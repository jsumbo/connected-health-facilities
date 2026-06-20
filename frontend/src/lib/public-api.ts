import type {
  ClusterOverview,
  DataQualityReport,
  DlaOverview,
  FacilityDlaDetail,
  ProgrammeFacility,
  PublicOverview,
  FacilitySentimentDetail,
  SentimentOverview,
  QuestionStat,
} from "./types-public"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 120 },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(body.detail || "Failed to load dashboard data")
  }
  return res.json()
}

export function getPublicOverview(): Promise<PublicOverview> {
  return publicFetch<PublicOverview>("/public/overview")
}

export function getPublicFacilities(params?: {
  county?: string
  tier?: string
  region?: string
  status?: string
}): Promise<{ total: number; items: ProgrammeFacility[] }> {
  const q = new URLSearchParams()
  if (params?.county) q.set("county", params.county)
  if (params?.tier) q.set("tier", params.tier)
  if (params?.region) q.set("region", params.region)
  if (params?.status) q.set("status", params.status)
  const query = q.toString() ? `?${q}` : ""
  return publicFetch(`/public/facilities${query}`)
}

export function getPublicFacility(slug: string): Promise<ProgrammeFacility> {
  return publicFetch<ProgrammeFacility>(`/public/facilities/${slug}`)
}

/** Same-origin URL for map/detail facility photos (proxied to FastAPI). */
export function getFacilityPhotoUrl(slug: string): string {
  return `/api/proxy/public/facilities/${encodeURIComponent(slug)}/photo`
}

export function getDataQuality(): Promise<DataQualityReport> {
  return publicFetch<DataQualityReport>("/public/data-quality")
}

export function getPublicSentiment(): Promise<SentimentOverview> {
  return publicFetch<SentimentOverview>("/public/sentiment")
}

export function getPublicSentimentFacility(slug: string): Promise<FacilitySentimentDetail> {
  return publicFetch<FacilitySentimentDetail>(`/public/sentiment/${slug}`)
}

export function getPublicDla(): Promise<DlaOverview> {
  return publicFetch<DlaOverview>("/public/dla")
}

export function getPublicDlaFacility(slug: string): Promise<FacilityDlaDetail> {
  return publicFetch<FacilityDlaDetail>(`/public/dla/${slug}`)
}

export function getPublicClusters(): Promise<ClusterOverview> {
  return publicFetch<ClusterOverview>("/public/clusters")
}

export async function getPublicDlaQuestionStats(): Promise<QuestionStat[]> {
  try {
    const url = `${API_URL}/public/dla/questions`
    const response = await fetch(url, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(`Failed to fetch DLA question stats: ${response.statusText}`)
    }

    const data = await response.json()
    return data.questions || []
  } catch (error) {
    console.error("Error fetching DLA question stats:", error)
    return []
  }
}
