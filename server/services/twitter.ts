/**
 * Twitter/X Service
 * Social media monitoring and sentiment analysis
 */

import axios from "axios";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_BASE_URL = "https://api.twitter.com/2";

if (!TWITTER_BEARER_TOKEN) {
  console.warn("Warning: TWITTER_BEARER_TOKEN not set. Twitter service will not function.");
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    impression_count?: number;
  };
  entities?: {
    mentions?: { username: string }[];
    hashtags?: { tag: string }[];
    urls?: { expanded_url: string }[];
  };
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  description: string;
  verified: boolean;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface TwitterSearchResponse {
  data: Tweet[];
  includes?: {
    users?: TwitterUser[];
  };
  meta: {
    result_count: number;
    next_token?: string;
  };
}

async function twitterRequest<T>(
  endpoint: string,
  params?: Record<string, any>
): Promise<T> {
  if (!TWITTER_BEARER_TOKEN) {
    throw new Error("TWITTER_BEARER_TOKEN is not configured");
  }

  const response = await axios.get<T>(`${TWITTER_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    },
    params,
  });

  return response.data;
}

/**
 * Search for tweets on a topic
 */
export async function searchTweets(
  query: string,
  options?: {
    maxResults?: number;
    startTime?: string;
    endTime?: string;
    sortOrder?: "recency" | "relevancy";
  }
): Promise<{
  tweets: {
    id: string;
    text: string;
    createdAt: string;
    authorUsername: string;
    authorName: string;
    metrics: {
      retweets: number;
      replies: number;
      likes: number;
      quotes: number;
    };
    hashtags: string[];
    mentions: string[];
  }[];
  totalCount: number;
}> {
  try {
    const response = await twitterRequest<TwitterSearchResponse>(
      "/tweets/search/recent",
      {
        query,
        max_results: options?.maxResults || 25,
        start_time: options?.startTime,
        end_time: options?.endTime,
        sort_order: options?.sortOrder || "relevancy",
        "tweet.fields": "created_at,public_metrics,entities,author_id",
        expansions: "author_id",
        "user.fields": "name,username,verified,public_metrics",
      }
    );

    const users = response.includes?.users || [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    return {
      tweets: response.data.map((tweet) => {
        const author = userMap.get(tweet.author_id);
        return {
          id: tweet.id,
          text: tweet.text,
          createdAt: tweet.created_at,
          authorUsername: author?.username || "",
          authorName: author?.name || "",
          metrics: {
            retweets: tweet.public_metrics.retweet_count,
            replies: tweet.public_metrics.reply_count,
            likes: tweet.public_metrics.like_count,
            quotes: tweet.public_metrics.quote_count,
          },
          hashtags: tweet.entities?.hashtags?.map((h) => h.tag) || [],
          mentions: tweet.entities?.mentions?.map((m) => m.username) || [],
        };
      }),
      totalCount: response.meta.result_count,
    };
  } catch (error) {
    console.warn("Twitter API error:", error);
    return { tweets: [], totalCount: 0 };
  }
}

/**
 * Get tweets from a specific account
 */
export async function getAccountTweets(
  username: string,
  options?: {
    maxResults?: number;
    excludeReplies?: boolean;
    excludeRetweets?: boolean;
  }
): Promise<{
  tweets: {
    id: string;
    text: string;
    createdAt: string;
    metrics: {
      retweets: number;
      replies: number;
      likes: number;
    };
  }[];
  user: {
    name: string;
    username: string;
    followers: number;
    verified: boolean;
  } | null;
}> {
  try {
    // First get user ID
    const userResponse = await twitterRequest<{ data: TwitterUser }>(
      `/users/by/username/${username}`,
      {
        "user.fields": "name,username,verified,public_metrics,description",
      }
    );

    const userId = userResponse.data.id;

    // Build exclusion query
    let exclusions = "";
    if (options?.excludeReplies) exclusions += " -is:reply";
    if (options?.excludeRetweets) exclusions += " -is:retweet";

    // Get tweets
    const tweetsResponse = await twitterRequest<TwitterSearchResponse>(
      `/users/${userId}/tweets`,
      {
        max_results: options?.maxResults || 20,
        "tweet.fields": "created_at,public_metrics",
        exclude: [
          options?.excludeReplies && "replies",
          options?.excludeRetweets && "retweets",
        ].filter(Boolean).join(",") || undefined,
      }
    );

    return {
      tweets: tweetsResponse.data.map((tweet) => ({
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        metrics: {
          retweets: tweet.public_metrics.retweet_count,
          replies: tweet.public_metrics.reply_count,
          likes: tweet.public_metrics.like_count,
        },
      })),
      user: {
        name: userResponse.data.name,
        username: userResponse.data.username,
        followers: userResponse.data.public_metrics.followers_count,
        verified: userResponse.data.verified,
      },
    };
  } catch (error) {
    console.warn("Twitter API error:", error);
    return { tweets: [], user: null };
  }
}

/**
 * Get trending sentiment for a topic
 */
export async function getTrendingSentiment(
  topic: string,
  options?: {
    sampleSize?: number;
  }
): Promise<{
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  volume: number;
  topHashtags: string[];
  topInfluencers: {
    username: string;
    followers: number;
  }[];
  sampleTweets: {
    text: string;
    likes: number;
    sentiment: "positive" | "negative" | "neutral";
  }[];
}> {
  const searchResult = await searchTweets(topic, {
    maxResults: options?.sampleSize || 100,
    sortOrder: "relevancy",
  });

  // Simple sentiment analysis based on common patterns
  const analyzeTweetSentiment = (text: string): "positive" | "negative" | "neutral" => {
    const lowerText = text.toLowerCase();
    const positiveWords = ["great", "amazing", "love", "excellent", "best", "good", "awesome", "fantastic", "bullish", "win"];
    const negativeWords = ["bad", "terrible", "hate", "worst", "fail", "poor", "awful", "bearish", "lose", "crash"];
    
    const positiveCount = positiveWords.filter((w) => lowerText.includes(w)).length;
    const negativeCount = negativeWords.filter((w) => lowerText.includes(w)).length;
    
    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  };

  // Calculate sentiment distribution
  const sentiments = searchResult.tweets.map((t) => analyzeTweetSentiment(t.text));
  const sentimentCounts = {
    positive: sentiments.filter((s) => s === "positive").length,
    negative: sentiments.filter((s) => s === "negative").length,
    neutral: sentiments.filter((s) => s === "neutral").length,
  };
  const total = sentiments.length || 1;

  // Extract top hashtags
  const hashtagCounts: Record<string, number> = {};
  searchResult.tweets.forEach((t) => {
    t.hashtags.forEach((h) => {
      hashtagCounts[h] = (hashtagCounts[h] || 0) + 1;
    });
  });
  const topHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  // Get top influencers (by engagement)
  const influencers = searchResult.tweets
    .filter((t) => t.metrics.likes > 10)
    .map((t) => ({ username: t.authorUsername, followers: t.metrics.likes * 10 })) // Estimate
    .slice(0, 5);

  return {
    sentiment: {
      positive: Math.round((sentimentCounts.positive / total) * 100),
      negative: Math.round((sentimentCounts.negative / total) * 100),
      neutral: Math.round((sentimentCounts.neutral / total) * 100),
    },
    volume: searchResult.totalCount,
    topHashtags,
    topInfluencers: influencers,
    sampleTweets: searchResult.tweets.slice(0, 5).map((t) => ({
      text: t.text,
      likes: t.metrics.likes,
      sentiment: analyzeTweetSentiment(t.text),
    })),
  };
}

/**
 * Monitor company mentions
 */
export async function monitorCompanyMentions(
  companyName: string,
  companyHandle?: string
): Promise<{
  recentMentions: {
    text: string;
    author: string;
    engagement: number;
    sentiment: "positive" | "negative" | "neutral";
    createdAt: string;
  }[];
  mentionCount: number;
  averageEngagement: number;
}> {
  const query = companyHandle
    ? `${companyName} OR @${companyHandle}`
    : companyName;

  const result = await searchTweets(query, {
    maxResults: 50,
    sortOrder: "recency",
  });

  const analyzeSentiment = (text: string): "positive" | "negative" | "neutral" => {
    const lower = text.toLowerCase();
    if (lower.includes("great") || lower.includes("love") || lower.includes("amazing")) return "positive";
    if (lower.includes("bad") || lower.includes("terrible") || lower.includes("hate")) return "negative";
    return "neutral";
  };

  const mentions = result.tweets.map((t) => ({
    text: t.text,
    author: t.authorUsername,
    engagement: t.metrics.likes + t.metrics.retweets + t.metrics.replies,
    sentiment: analyzeSentiment(t.text),
    createdAt: t.createdAt,
  }));

  const totalEngagement = mentions.reduce((sum, m) => sum + m.engagement, 0);

  return {
    recentMentions: mentions,
    mentionCount: result.totalCount,
    averageEngagement: mentions.length ? Math.round(totalEngagement / mentions.length) : 0,
  };
}

export default {
  searchTweets,
  getAccountTweets,
  getTrendingSentiment,
  monitorCompanyMentions,
};

