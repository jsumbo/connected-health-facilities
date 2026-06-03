import type { Metadata } from "next"

export const SITE_NAME = "Connected Facilities"

export const SITE_TITLE_DEFAULT =
  "Connected Facilities — National Readiness Dashboard"

export const SITE_DESCRIPTION =
  "Explore baseline assessment scores, deployment tiers, blockers, and staff surveys for health facilities across Liberia—informing phased HOS rollout."

export const SITE_KEYWORDS = [
  "Liberia",
  "health facilities",
  "HOS",
  "deployment readiness",
  "digital health",
  "Ministry of Health",
  "NHIC",
  "facility assessment",
] as const

export const OG_IMAGE_ALT =
  "Connected Facilities national readiness dashboard showing deployment tiers and facility scores across Liberia"

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (url) return url.replace(/\/$/, "")
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  }
  return "http://localhost:3000"
}

export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
}: {
  title: string
  description?: string
  path?: string
}): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: SITE_NAME,
    },
    twitter: {
      title,
      description,
    },
  }
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_TITLE_DEFAULT,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  applicationName: SITE_NAME,
  authors: [{ name: "Ministry of Health, Republic of Liberia" }],
  creator: "LNHIC",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icons/favicon.png",
    shortcut: "/icons/favicon.png",
    apple: "/icons/icon.png",
  },
  themeColor: "#0a0a0a",
}
