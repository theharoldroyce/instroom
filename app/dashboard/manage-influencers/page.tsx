// C:\Users\reyme\Videos\instroom\app\dashboard\manage-influencers\page.tsx

"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import TableSheet from "@/components/table-sheet"
import { LimitExceededDialog } from "@/components/limit-exceeded-dialog"
import { toast } from "sonner"

function InfluencersContent({ brandId: initialBrandId }: { brandId?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [brandId, setBrandId] = useState<string | null>(initialBrandId || null)
  const [influencers, setInfluencers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [createdInfluencers, setCreatedInfluencers] = useState<Set<string>>(new Set())
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    const id = searchParams.get("brandId")
    setBrandId(id)
  }, [searchParams])

  // Fetch influencers for the brand
  useEffect(() => {
    if (!brandId) return

    const fetchInfluencers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/brand/${brandId}/influencers`)
        if (response.ok) {
          const data = await response.json()
          // Extract influencers array from response and transform to InfluencerRow format
          const brandInfluencers = data?.influencers || []
          const transformed = brandInfluencers
            .filter((bi: any) => bi.influencer && bi.influencer.id) // Only include if influencer exists
            .map((bi: any) => {
              const inf = bi.influencer
              return {
                // Influencer table fields
                id: inf.id,
                handle: inf.handle || "",
                platform: inf.platform || "instagram",
                full_name: inf.full_name || "",
                email: inf.email || "",
                gender: inf.gender || "",
                niche: inf.niche || "",
                location: inf.location || "",
                follower_count: String(inf.follower_count || 0),
                engagement_rate: String(inf.engagement_rate || 0),
                social_link: inf.social_link || "",
                bio: inf.bio || "",
                profile_image_url: inf.profile_image_url || "",
                avg_likes: inf.avg_likes || 0,
                avg_comments: inf.avg_comments || 0,
                avg_views: inf.avg_views || 0,
                // BrandInfluencer table fields
                approval_status: bi.approval_status || "Pending",
                approval_notes: bi.approval_notes || "",
                contact_status: bi.contact_status || "not_contacted",
                agreed_rate: bi.agreed_rate || "",
                notes: bi.notes || "",
                stage: String(bi.stage || "1"),
                transferred_date: bi.transferred_date ? new Date(bi.transferred_date).toISOString().split('T')[0] : "",
                // UI-only fields
                first_name: inf.full_name?.split(" ")[0] || "",
                contact_info: inf.email || "",
                decline_reason: "",
                tier: "Bronze",
                community_status: "Pending",
                custom: {},
              }
            })
          setInfluencers(transformed)
        } else {
          // If endpoint doesn't exist or fails, just use empty array
          setInfluencers([])
        }
      } catch (error) {
        console.error("Failed to fetch influencers:", error)
        setInfluencers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInfluencers()
  }, [brandId])

  const handleRowsChange = async (rows: any[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        
        // Only require handle and platform to create
        const hasRequiredFields = row.handle && row.handle !== "" && row.handle !== "@" && row.platform
        
        if (!hasRequiredFields) continue

        const rowKey = `${row.handle}@${row.platform}`
        
        if (createdInfluencers.has(rowKey)) continue

        try {
          const response = await fetch("/api/influencers/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                handle: row.handle,
                platform: row.platform,
                full_name: row.full_name || null,
                email: row.email || null,
                gender: row.gender || null,
                niche: row.niche || null,
                location: row.location || null,
                bio: row.bio || null,
                profile_image_url: row.profile_image_url || null,
                social_link: row.social_link || null,
                follower_count: row.follower_count ? parseInt(row.follower_count) : 0,
                engagement_rate: row.engagement_rate ? parseFloat(row.engagement_rate) : 0,
                avg_likes: parseInt(row.avg_likes) || 0,
                avg_comments: parseInt(row.avg_comments) || 0,
                avg_views: parseInt(row.avg_views) || 0,
                brandId: brandId,
              }),
            })

            if (response.ok) {
              const createdInfluencer = await response.json()
              
              // Update row ID with the actual database ID
              row.id = createdInfluencer.id
              rows[i] = row
              
              setCreatedInfluencers(prev => new Set([...prev, rowKey]))
              toast.success(`"${row.handle}" created successfully`)
            } else if (response.status === 409) {
              setCreatedInfluencers(prev => new Set([...prev, rowKey]))
              toast.info(`"${row.handle}" already exists in database`)
            } else if (response.status === 403) {
              try {
                const error = await response.json()
                if (error.requiresSubscription) {
                  setShowSubscriptionDialog(true)
                } else {
                  toast.error(error.error || `Influencer limit reached (${error.current}/${error.max})`)
                }
              } catch (e) {
                toast.error("Influencer limit reached for your plan")
              }
            } else {
              let error: any = {}
              const contentType = response.headers.get("content-type")
              try {
                if (contentType?.includes("application/json")) {
                  error = await response.json()
                } else {
                  const text = await response.text()
                  error = { error: text || `HTTP ${response.status}` }
                }
              } catch (e) {
                error = { error: `HTTP ${response.status}` }
              }
              toast.error(error.details || error.error || `Failed to create (${response.status})`)
            }
        } catch (error) {
          console.error("Auto-creation error:", error)
          toast.error("Failed to auto-create influencer")
        }
      }
    }, 800)
  }

  if (!brandId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No brand selected</p>
          <p className="text-sm text-gray-500">Please select a brand to manage influencers</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-500">Loading influencers...</p>
        </div>
      )}
      {!isLoading && (
      <TableSheet initialRows={influencers} onRowsChange={handleRowsChange} brandId={brandId} />
      )}
      <LimitExceededDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        limitType="influencer"
        current={0}
        max={null}
        title="Subscription Required"
        description="You need a paid plan to add influencers."
        message="Subscribe to a paid plan to start adding influencers to your brand."
      />
    </div>
  )
}

export default function InfluencersPage() {
  return (
    <Suspense>
      <InfluencersContent />
    </Suspense>
  )
}


// "use client"

// import TableSheet from "@/components/table-sheet"
// // import InfluencerList from "./influencer-list"

// export default function InfluencersPage() {
//   return (
//     <div className="flex flex-col gap-4 p-4">

//       <div>
//         <TableSheet />
//          {/* <InfluencerList /> */}
//       </div>

//     </div>
//   )
// }