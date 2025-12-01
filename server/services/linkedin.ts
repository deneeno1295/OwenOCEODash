/**
 * LinkedIn Service
 * Sales Navigator search and profile data
 */

import axios from "axios";

const LINKEDIN_API_KEY = process.env.LINKEDIN_API_KEY;
const LINKEDIN_BASE_URL = "https://api.linkedin.com/v2";

if (!LINKEDIN_API_KEY) {
  console.warn("Warning: LINKEDIN_API_KEY not set. LinkedIn service will not function.");
}

interface LinkedInPerson {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  profilePicture?: string;
  vanityName?: string;
  industry?: string;
  location?: {
    country: string;
    city?: string;
  };
  positions?: {
    title: string;
    companyName: string;
    startDate?: string;
    current: boolean;
  }[];
  connections?: number;
}

async function linkedInRequest<T>(
  endpoint: string,
  params?: Record<string, any>
): Promise<T> {
  if (!LINKEDIN_API_KEY) {
    throw new Error("LINKEDIN_API_KEY is not configured");
  }

  const response = await axios.get<T>(`${LINKEDIN_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${LINKEDIN_API_KEY}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    params,
  });

  return response.data;
}

/**
 * Search Sales Navigator for leads
 */
export async function searchSalesNavigator(
  query: string,
  filters?: {
    titles?: string[];
    locations?: string[];
    industries?: string[];
    companySize?: string[];
    seniority?: string[];
  }
): Promise<{
  results: {
    name: string;
    title: string;
    company: string;
    location: string;
    headline: string;
    profileUrl: string;
    connectionDegree: number;
  }[];
  total: number;
}> {
  // Note: Sales Navigator API requires specific partnership access
  // This is a structured response format for when the API is available
  
  try {
    const response = await linkedInRequest<any>("/salesNavigator/leads", {
      q: "search",
      query,
      ...filters,
    });

    return {
      results: response.elements?.map((e: any) => ({
        name: `${e.firstName} ${e.lastName}`,
        title: e.headline,
        company: e.positions?.[0]?.companyName || "",
        location: e.location?.country || "",
        headline: e.headline,
        profileUrl: `https://linkedin.com/in/${e.vanityName}`,
        connectionDegree: e.connectionDegree || 3,
      })) || [],
      total: response.paging?.total || 0,
    };
  } catch (error) {
    // Return empty results if API is not accessible
    console.warn("LinkedIn Sales Navigator API not accessible:", error);
    return { results: [], total: 0 };
  }
}

/**
 * Get LinkedIn profile data
 */
export async function getLinkedInProfile(profileUrl: string): Promise<{
  name: string;
  headline: string;
  location: string;
  industry: string;
  currentPosition: {
    title: string;
    company: string;
  } | null;
  connectionCount: number;
  profilePicture: string | null;
}> {
  // Extract vanity name from URL
  const vanityMatch = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
  const vanityName = vanityMatch?.[1];

  if (!vanityName) {
    throw new Error("Invalid LinkedIn profile URL");
  }

  try {
    const response = await linkedInRequest<LinkedInPerson>(`/people/${vanityName}`);

    const currentPosition = response.positions?.find((p) => p.current);

    return {
      name: `${response.firstName} ${response.lastName}`,
      headline: response.headline,
      location: response.location?.city 
        ? `${response.location.city}, ${response.location.country}`
        : response.location?.country || "",
      industry: response.industry || "",
      currentPosition: currentPosition
        ? { title: currentPosition.title, company: currentPosition.companyName }
        : null,
      connectionCount: response.connections || 0,
      profilePicture: response.profilePicture || null,
    };
  } catch (error) {
    console.warn("LinkedIn Profile API not accessible:", error);
    return {
      name: "",
      headline: "",
      location: "",
      industry: "",
      currentPosition: null,
      connectionCount: 0,
      profilePicture: null,
    };
  }
}

/**
 * Search for regional leaders in a specific location and industry
 */
export async function searchRegionalLeaders(
  location: string,
  industry?: string,
  limit: number = 25
): Promise<{
  leaders: {
    name: string;
    title: string;
    company: string;
    location: string;
    profileUrl: string;
    relevanceScore: number;
  }[];
}> {
  const filters: any = {
    locations: [location],
    seniority: ["CXO", "VP", "Director", "Partner"],
  };

  if (industry) {
    filters.industries = [industry];
  }

  const searchResult = await searchSalesNavigator(
    `leaders in ${location}${industry ? ` ${industry}` : ""}`,
    filters
  );

  return {
    leaders: searchResult.results.slice(0, limit).map((r, index) => ({
      ...r,
      relevanceScore: Math.max(100 - index * 5, 50), // Decay score by position
    })),
  };
}

/**
 * Get shared connections with a profile
 */
export async function getSharedConnections(profileId: string): Promise<{
  connections: {
    name: string;
    title: string;
    company: string;
    profileUrl: string;
  }[];
  count: number;
}> {
  try {
    const response = await linkedInRequest<any>(
      `/people/${profileId}/connections`,
      { count: 50 }
    );

    return {
      connections: response.elements?.map((e: any) => ({
        name: `${e.firstName} ${e.lastName}`,
        title: e.headline,
        company: e.positions?.[0]?.companyName || "",
        profileUrl: `https://linkedin.com/in/${e.vanityName}`,
      })) || [],
      count: response.paging?.total || 0,
    };
  } catch (error) {
    console.warn("LinkedIn Connections API not accessible:", error);
    return { connections: [], count: 0 };
  }
}

export default {
  searchSalesNavigator,
  getLinkedInProfile,
  searchRegionalLeaders,
  getSharedConnections,
};

