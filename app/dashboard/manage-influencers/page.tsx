"use client"

import InfluencerList from "@/app/dashboard/manage-influencers/influencer-list"

export default function InfluencersPage() {
  return (
    <div className="flex flex-col gap-4 p-4">

      <div>
        <InfluencerList />
      </div>

    </div>
  )
}