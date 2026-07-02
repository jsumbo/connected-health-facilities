import { ImageResponse } from "next/og"
import { SITE_NAME } from "@/lib/site-metadata"

export const runtime = "edge"
export const alt = "Connected Facilities national readiness dashboard"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #0a0a0a 0%, #111827 55%, #0f172a 100%)",
          padding: "64px 72px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#14b8a6",
            }}
          />
          <div
            style={{
              fontSize: 22,
              color: "#94a3b8",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Ministry of Health · NHIC
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#f8fafc",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: "#cbd5e1",
              lineHeight: 1.2,
            }}
          >
            National Readiness Dashboard
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 26,
              color: "#14b8a6",
              fontWeight: 500,
            }}
          >
            HOS deployment readiness · Liberia
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {[
            { label: "Tier 1", color: "#f54343" },
            { label: "Tier 2", color: "#0f0f0f" },
            { label: "Tier 3", color: "#f59e0b" },
            { label: "Tier 4", color: "#f43f5e" },
          ].map((tier) => (
            <div
              key={tier.label}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: tier.color,
                }}
              />
              <span style={{ fontSize: 20, color: "#94a3b8" }}>{tier.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
