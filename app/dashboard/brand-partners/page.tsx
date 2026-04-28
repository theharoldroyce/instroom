// app/dashboard/brand-partners/page.tsx
// Route: /dashboard/brand-partners?brandId=<cuid>
//
// Reads brandId from the URL search params and passes it as a prop.
// Must be a Client Component to use useSearchParams().

"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import BrandPartnersPage from "./BrandPartnersPage"

function BrandPartnersContent() {
  const searchParams = useSearchParams()
  const brandId = searchParams.get("brandId")

  if (!brandId) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        fontFamily: "'Inter', sans-serif",
        flexDirection: "column",
        gap: 8,
        color: "#888",
      }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontWeight: 600, color: "#1E1E1E" }}>No brand selected</div>
        <div style={{ fontSize: 12 }}>
          Add <code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: 4 }}>?brandId=YOUR_BRAND_ID</code> to the URL
        </div>
      </div>
    )
  }

  return <BrandPartnersPage brandId={brandId} />
}

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        fontFamily: "'Inter', sans-serif",
        color: "#888",
      }}>
        Loading…
      </div>
    }>
      <BrandPartnersContent />
    </Suspense>
  )
}