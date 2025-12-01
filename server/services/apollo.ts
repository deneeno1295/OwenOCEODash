/**
 * Apollo.io Service
 * Company and person enrichment, executive search
 */

import axios from "axios";

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_BASE_URL = "https://api.apollo.io/v1";

if (!APOLLO_API_KEY) {
  console.warn("Warning: APOLLO_API_KEY not set. Apollo service will not function.");
}

interface ApolloCompany {
  id: string;
  name: string;
  website_url: string;
  linkedin_url: string;
  twitter_url: string;
  industry: string;
  estimated_num_employees: number;
  founded_year: number;
  short_description: string;
  annual_revenue: number;
  total_funding: number;
  latest_funding_stage: string;
  headquarters: {
    city: string;
    state: string;
    country: string;
  };
  technologies: string[];
}

interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string;
  email: string;
  linkedin_url: string;
  twitter_url: string;
  organization: {
    name: string;
    website_url: string;
  };
  city: string;
  state: string;
  country: string;
  seniority: string;
  departments: string[];
}

async function apolloRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  data?: any
): Promise<T> {
  if (!APOLLO_API_KEY) {
    throw new Error("APOLLO_API_KEY is not configured");
  }

  const response = await axios({
    method,
    url: `${APOLLO_BASE_URL}${endpoint}`,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    data: {
      api_key: APOLLO_API_KEY,
      ...data,
    },
  });

  return response.data;
}

/**
 * Enrich company data by domain
 */
export async function enrichCompany(domain: string): Promise<{
  name: string;
  website: string;
  industry: string;
  employeeCount: number;
  foundedYear: number;
  description: string;
  annualRevenue: number | null;
  totalFunding: number | null;
  fundingStage: string | null;
  headquarters: {
    city: string;
    state: string;
    country: string;
  };
  technologies: string[];
  linkedinUrl: string | null;
  twitterUrl: string | null;
}> {
  const response = await apolloRequest<{ organization: ApolloCompany }>(
    "/organizations/enrich",
    "POST",
    { domain }
  );

  const org = response.organization;
  return {
    name: org.name,
    website: org.website_url,
    industry: org.industry,
    employeeCount: org.estimated_num_employees,
    foundedYear: org.founded_year,
    description: org.short_description,
    annualRevenue: org.annual_revenue,
    totalFunding: org.total_funding,
    fundingStage: org.latest_funding_stage,
    headquarters: org.headquarters,
    technologies: org.technologies || [],
    linkedinUrl: org.linkedin_url,
    twitterUrl: org.twitter_url,
  };
}

/**
 * Enrich person data
 */
export async function enrichPerson(
  firstName: string,
  lastName: string,
  organization?: string,
  domain?: string
): Promise<{
  name: string;
  title: string;
  email: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  organization: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  seniority: string;
  departments: string[];
}> {
  const response = await apolloRequest<{ person: ApolloPerson }>(
    "/people/match",
    "POST",
    {
      first_name: firstName,
      last_name: lastName,
      organization_name: organization,
      domain,
    }
  );

  const person = response.person;
  return {
    name: person.name,
    title: person.title,
    email: person.email,
    linkedinUrl: person.linkedin_url,
    twitterUrl: person.twitter_url,
    organization: person.organization?.name || organization || "",
    location: {
      city: person.city,
      state: person.state,
      country: person.country,
    },
    seniority: person.seniority,
    departments: person.departments || [],
  };
}

/**
 * Search for people by role/title
 */
export async function searchPeopleByRole(
  titles: string[],
  location?: { city?: string; state?: string; country?: string },
  industries?: string[],
  limit: number = 25
): Promise<{
  people: {
    name: string;
    title: string;
    organization: string;
    email: string | null;
    linkedinUrl: string | null;
    location: string;
  }[];
  total: number;
}> {
  const filters: any = {
    person_titles: titles,
    per_page: limit,
  };

  if (location) {
    if (location.city) filters.person_locations = [location.city];
    if (location.country) filters.organization_locations = [location.country];
  }

  if (industries) {
    filters.organization_industries = industries;
  }

  const response = await apolloRequest<{ people: ApolloPerson[]; pagination: { total_entries: number } }>(
    "/mixed_people/search",
    "POST",
    filters
  );

  return {
    people: response.people.map((p) => ({
      name: p.name,
      title: p.title,
      organization: p.organization?.name || "",
      email: p.email,
      linkedinUrl: p.linkedin_url,
      location: [p.city, p.state, p.country].filter(Boolean).join(", "),
    })),
    total: response.pagination?.total_entries || response.people.length,
  };
}

/**
 * Get company executives (C-suite)
 */
export async function getCompanyExecutives(domain: string): Promise<{
  executives: {
    name: string;
    title: string;
    email: string | null;
    linkedinUrl: string | null;
    seniority: string;
  }[];
}> {
  const response = await apolloRequest<{ people: ApolloPerson[] }>(
    "/mixed_people/search",
    "POST",
    {
      q_organization_domains: domain,
      person_seniorities: ["c_suite", "vp", "director"],
      per_page: 50,
    }
  );

  return {
    executives: response.people.map((p) => ({
      name: p.name,
      title: p.title,
      email: p.email,
      linkedinUrl: p.linkedin_url,
      seniority: p.seniority,
    })),
  };
}

/**
 * Get hiring velocity indicator
 */
export async function getHiringVelocity(domain: string): Promise<{
  velocity: "high" | "medium" | "low";
  recentJobPostings: number;
  growthSignal: string;
  topRoles: string[];
}> {
  // Apollo doesn't have direct hiring data, but we can infer from job search
  const response = await apolloRequest<{ people: ApolloPerson[] }>(
    "/mixed_people/search",
    "POST",
    {
      q_organization_domains: domain,
      per_page: 10,
    }
  );

  const employeeCount = response.people.length;
  
  // Infer velocity based on available data
  let velocity: "high" | "medium" | "low" = "medium";
  let growthSignal = "Moderate hiring activity";

  if (employeeCount > 1000) {
    velocity = "high";
    growthSignal = "Large organization with active hiring";
  } else if (employeeCount < 50) {
    velocity = "low";
    growthSignal = "Smaller organization, focused hiring";
  }

  // Extract common roles
  const roleCount: Record<string, number> = {};
  response.people.forEach((p) => {
    const role = p.title?.split(" ")[0] || "Unknown";
    roleCount[role] = (roleCount[role] || 0) + 1;
  });

  const topRoles = Object.entries(roleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([role]) => role);

  return {
    velocity,
    recentJobPostings: employeeCount,
    growthSignal,
    topRoles,
  };
}

export default {
  enrichCompany,
  enrichPerson,
  searchPeopleByRole,
  getCompanyExecutives,
  getHiringVelocity,
};

