"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import TableSheet from "@/components/table-sheet"
import { toast } from "sonner"

function InfluencersContent() {
  const searchParams = useSearchParams()
  const [brandId, setBrandId] = useState<string | null>(null)
  const [createdInfluencers, setCreatedInfluencers] = useState<Set<string>>(new Set())
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const id = searchParams.get("brandId")
    setBrandId(id)
  }, [searchParams])

  const handleRowsChange = async (rows: any[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      for (const row of rows) {
        const requiredFields = [
          'handle', 'platform', 'email', 'full_name', 'niche', 
          'gender', 'location', 'follower_count', 'engagement_rate', 'social_link'
        ]
        
        const hasAllFields = requiredFields.every(field => {
          const value = row[field]
          if (field === 'follower_count' || field === 'engagement_rate') {
            return value !== '' && value !== null && value !== undefined && value !== 0
          }
          return value && value !== "" && (field !== 'handle' || value !== "@")
        })
        
        if (!hasAllFields) continue

        const rowKey = `${row.handle}@${row.platform}`
        
        if (createdInfluencers.has(rowKey)) continue

        try {
          const response = await fetch("/api/influencers/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                handle: row.handle,
                platform: row.platform,
                full_name: row.full_name,
                email: row.email,
                gender: row.gender,
                niche: row.niche,
                location: row.location,
                bio: row.bio,
                profile_image_url: row.profile_image_url,
                social_link: row.social_link,
                follower_count: parseInt(row.follower_count),
                engagement_rate: parseFloat(row.engagement_rate),
                avg_likes: parseInt(row.avg_likes) || 0,
                avg_comments: parseInt(row.avg_comments) || 0,
                avg_views: parseInt(row.avg_views) || 0,                brandId: brandId,              }),
            })

            if (response.ok || response.status === 409) {
              setCreatedInfluencers(prev => new Set([...prev, rowKey]))
              
              if (response.status === 409) {
                toast.info(`"${row.handle}" already exists in database`)
              } else {
                toast.success(`"${row.handle}" created successfully`)
              }
            } else if (response.status === 403) {
              try {
                const error = await response.json()
                toast.error(error.error || `Influencer limit reached (${error.current}/${error.max})`)
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
          toast.error("Failed to save influencer")
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
      <TableSheet brandId={brandId} onRowsChange={handleRowsChange} />
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