"use client"

import InfluencerList from "@/components/influencer-list"

export default function InfluencersPage() {
  return (
    <div className="flex flex-col gap-4 p-4">

      {/* Title */}
      {/* <h2 className="text-base font-medium text-gray-800">
        Manage Influencers
      </h2> */}

      {/* Box Container (same as Pipeline & Closed) */}
      <div className="">

        <InfluencerList />

      </div>
    </div>
  )
}