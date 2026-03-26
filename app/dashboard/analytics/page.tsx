"use client"

import { useState, useEffect } from "react"
import jsonData from "@/app/dashboard/data.json"

function MetricBox({
  title,
  items,
  color,
}: {
  title: string
  items: { label: string; value: string | number }[]
  color: string
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="text-sm font-medium mb-3">{title}</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className="opacity-70">{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [influencers, setInfluencers] = useState<any[]>([])

  // Load data from JSON file
  useEffect(() => {
    if (jsonData && Array.isArray(jsonData)) {
      setInfluencers(jsonData)
    }
  }, [])

  // Calculate metrics based on pipeline status
  const calculateMetrics = () => {
    // Count by platform (assuming Instagram handle indicates platform)
    const instagramCount = influencers.filter(i => i.instagramHandle?.startsWith('@')).length
    const tiktokCount = influencers.filter(i => i.instagramHandle?.includes('tiktok') || i.niche === 'TikTok').length
    
    // Count by status
    const totalInfluencers = influencers.length
    const reachedOut = influencers.filter(i => i.pipelineStatus === "Reached Out").length
    const inConversation = influencers.filter(i => i.pipelineStatus === "In Conversation").length
    const onboarded = influencers.filter(i => i.pipelineStatus === "Onboarded").length
    const prospects = influencers.filter(i => i.pipelineStatus === "Prospect").length
    const rejected = influencers.filter(i => i.pipelineStatus === "Rejected").length
    
    // For order creation, in transit, delivered, posted (not in current data, set to 0)
    const forOrderCreation = 0
    const inTransit = 0
    const delivered = 0
    const contentPending = 0
    const posted = 0
    
    // Response rate and closing rate calculations
    const responded = inConversation + onboarded
    const responseRate = totalInfluencers > 0 ? ((responded / totalInfluencers) * 100).toFixed(1) : "0"
    const closingRate = totalInfluencers > 0 ? ((onboarded / totalInfluencers) * 100).toFixed(1) : "0"
    const postRate = totalInfluencers > 0 ? ((posted / totalInfluencers) * 100).toFixed(1) : "0"
    
    // Not interested reasons (placeholder data)
    const notInterested = rejected
    const notInterestedBreakdown = {
      paidOnly: 0,
      noUsageRights: 0,
      noCreativeFreedom: 0,
      valuesMismatch: 0,
      brandConflict: 0,
      fullyBooked: 0,
      others: notInterested
    }
    
    // Platform specific counts
    const platformCounts = {
      instagram: instagramCount,
      tiktok: tiktokCount,
      facebook: 0,
      youtube: 0
    }
    
    return {
      totalInfluencers,
      reachedOut,
      inConversation,
      onboarded,
      prospects,
      rejected,
      forOrderCreation,
      inTransit,
      delivered,
      contentPending,
      posted,
      responseRate,
      closingRate,
      postRate,
      notInterestedBreakdown,
      platformCounts
    }
  }
  
  const metrics = calculateMetrics()

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* HEADER */}
      <div>
        <p className="text-sm text-muted-foreground">
          Here are the latest insights from your influencer campaigns
        </p>
      </div>

      {/* CONVERSION METRICS */}
      <div>
        <h2 className="text-md font-semibold mb-3">Conversion Metrics</h2>

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricBox title="Web Clicks" color="border-purple-400" items={[
            { label: "Clicks", value: 0 },
          ]} />

          <MetricBox title="Sales Quantity" color="border-green-400" items={[
            { label: "Units Sold", value: 0 },
          ]} />

          <MetricBox title="Sales Amount" color="border-cyan-400" items={[
            { label: "Revenue", value: "$0" },
          ]} />

          <MetricBox title="Product Expenditure" color="border-blue-400" items={[
            { label: "Cost", value: "$0" },
          ]} />

          <MetricBox title="Average Order Value" color="border-indigo-400" items={[
            { label: "AOV", value: "$0" },
          ]} />

          <MetricBox title="Conversion Rate" color="border-red-400" items={[
            { label: "CVR", value: "0%" },
          ]} />
        </div>
      </div>

      {/* CAMPAIGN METRICS */}
      <div>
        <h2 className="text-md font-semibold mb-3">Campaign Metrics</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <MetricBox title="Response Rate" color="border-purple-400" items={[
            { label: "Responses", value: `${metrics.responseRate}%` },
          ]} />

          <MetricBox title="Closing Rate" color="border-green-400" items={[
            { label: "Deals Closed", value: `${metrics.closingRate}%` },
          ]} />

          <MetricBox title="Post Rate" color="border-red-400" items={[
            { label: "Posted", value: `${metrics.postRate}%` },
          ]} />
        </div>
      </div>

      {/* POST INSIGHTS */}
      <div>
        <h2 className="text-md font-semibold mb-3">Post Insights</h2>

        <div className="grid md:grid-cols-4 gap-4">
          <MetricBox title="Posted" color="bg-blue-700 text-white" items={[
            { label: "Total", value: metrics.posted },
          ]} />

          <MetricBox title="Content Pending" color="bg-indigo-600 text-white" items={[
            { label: "Pending", value: metrics.contentPending },
          ]} />

          <MetricBox title="Inactive" color="bg-sky-600 text-white" items={[
            { label: "Inactive", value: metrics.rejected },
          ]} />

          <MetricBox title="Content Saved" color="bg-teal-500 text-white" items={[
            { label: "Saved", value: 0 },
          ]} />
        </div>
      </div>

      {/* BRAND AWARENESS */}
      <div>
        <h2 className="text-md font-semibold mb-3">Brand Awareness</h2>

        <div className="grid md:grid-cols-5 gap-4">
          <MetricBox title="Total Likes" color="bg-purple-500 text-white" items={[
            { label: "Likes", value: 0 },
          ]} />

          <MetricBox title="Total Comments" color="bg-green-500 text-white" items={[
            { label: "Comments", value: 0 },
          ]} />

          <MetricBox title="Total Video Views" color="bg-indigo-500 text-white" items={[
            { label: "Views", value: 0 },
          ]} />

          <MetricBox title="Views" color="bg-cyan-500 text-white" items={[
            { label: "Reach", value: 0 },
          ]} />

          <MetricBox title="CPM (Estimated)" color="bg-red-400 text-white" items={[
            { label: "Cost per 1k", value: "$0.00" },
          ]} />
        </div>
      </div>

      {/* SUMMARY INSIGHTS */}
      <div>
        <h2 className="text-md font-semibold mb-3">Summary Insights</h2>

        <div className="grid md:grid-cols-3 gap-4">

          {/* TOTAL INFLUENCER */}
          <MetricBox
            title={`Total Influencer: ${metrics.totalInfluencers}`}
            color="border"
            items={[
              { label: "Facebook", value: metrics.platformCounts.facebook },
              { label: "Instagram", value: metrics.platformCounts.instagram },
              { label: "TikTok", value: metrics.platformCounts.tiktok },
              { label: "YouTube", value: metrics.platformCounts.youtube },
            ]}
          />

          {/* TOTAL REACHED OUT */}
          <MetricBox
            title={`Total Reached Out: ${metrics.reachedOut + metrics.inConversation + metrics.onboarded}`}
            color="border"
            items={[
              { label: "Facebook", value: 0 },
              { label: "Instagram", value: metrics.reachedOut + metrics.inConversation + metrics.onboarded },
              { label: "TikTok", value: 0 },
              { label: "YouTube", value: 0 },
            ]}
          />

          {/* TOTAL WON */}
          <MetricBox
            title={`Total Won: ${metrics.onboarded}`}
            color="border"
            items={[
              { label: "Facebook", value: 0 },
              { label: "Instagram", value: metrics.onboarded },
              { label: "TikTok", value: 0 },
              { label: "YouTube", value: 0 },
            ]}
          />

        </div>

        {/* SECOND ROW */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">

          {/* TOTAL OUTREACH */}
          <MetricBox
            title={`Total Outreach: ${metrics.totalInfluencers}`}
            color="border"
            items={[
              { label: "No Response", value: metrics.prospects },
              { label: "Responded", value: metrics.inConversation + metrics.onboarded },
              { label: "In Progress", value: metrics.inConversation },
              { label: "Not Interested", value: metrics.rejected },
              { label: "For Order Creation", value: metrics.forOrderCreation },
              { label: "In Transit", value: metrics.inTransit },
              { label: "Delivered", value: metrics.delivered },
              { label: "Content Pending", value: metrics.contentPending },
              { label: "Posted", value: metrics.posted },
            ]}
          />

          {/* NOT INTERESTED */}
          <MetricBox
            title={`Not Interested: ${metrics.rejected}`}
            color="border"
            items={[
              { label: "Paid only", value: metrics.notInterestedBreakdown.paidOnly },
              { label: "No usage rights", value: metrics.notInterestedBreakdown.noUsageRights },
              { label: "No creative freedom", value: metrics.notInterestedBreakdown.noCreativeFreedom },
              { label: "Values mismatch", value: metrics.notInterestedBreakdown.valuesMismatch },
              { label: "Brand conflict", value: metrics.notInterestedBreakdown.brandConflict },
              { label: "Fully booked", value: metrics.notInterestedBreakdown.fullyBooked },
              { label: "Others", value: metrics.notInterestedBreakdown.others },
            ]}
          />

          {/* TOTAL WON PIPELINE */}
          <MetricBox
            title={`Total Won: ${metrics.onboarded}`}
            color="border"
            items={[
              { label: "For Order Creation", value: metrics.forOrderCreation },
              { label: "In Transit", value: metrics.inTransit },
              { label: "Delivered", value: metrics.delivered },
              { label: "Content Pending", value: metrics.contentPending },
              { label: "Posted", value: metrics.posted },
            ]}
          />

        </div>

        {/* GEOGRAPHIC */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <MetricBox
            title="Geographic Agreement Insights"
            color="border"
            items={[
              { label: "PH", value: metrics.totalInfluencers },
            ]}
          />
        </div>
      </div>

      {/* PLATFORM INSIGHTS */}
      <div>
        <h2 className="text-md font-semibold mb-3">Platform Insights</h2>

        <div className="grid md:grid-cols-2 gap-4">

          {/* FACEBOOK */}
          <MetricBox title="Facebook Total Influencer: 0" color="border" items={[
            { label: "Outreach", value: 0 },
            { label: "Responded", value: 0 },
            { label: "Not Interested", value: 0 },
            { label: "Content Pending", value: 0 },
            { label: "Posted", value: 0 },
            { label: "Web Clicks", value: 0 },
            { label: "Sales Quantity", value: 0 },
            { label: "Sales Amount", value: "$0" },
            { label: "CVR", value: 0 },
            { label: "Won", value: 0 },
          ]} />

          {/* INSTAGRAM */}
          <MetricBox title={`Instagram Total Influencer: ${metrics.platformCounts.instagram}`} color="border" items={[
            { label: "Outreach", value: metrics.prospects },
            { label: "Responded", value: metrics.inConversation + metrics.onboarded },
            { label: "Not Interested", value: metrics.rejected },
            { label: "Content Pending", value: metrics.contentPending },
            { label: "Posted", value: metrics.posted },
            { label: "Web Clicks", value: 0 },
            { label: "Sales Quantity", value: 0 },
            { label: "Sales Amount", value: "$0" },
            { label: "CVR", value: 0 },
            { label: "Won", value: metrics.onboarded },
          ]} />

          {/* TIKTOK */}
          <MetricBox title={`TikTok Total Influencer: ${metrics.platformCounts.tiktok}`} color="border" items={[
            { label: "Outreach", value: 0 },
            { label: "Responded", value: 0 },
            { label: "Not Interested", value: 0 },
            { label: "Content Pending", value: 0 },
            { label: "Posted", value: 0 },
            { label: "Web Clicks", value: 0 },
            { label: "Sales Quantity", value: 0 },
            { label: "Sales Amount", value: "$0" },
            { label: "CVR", value: 0 },
            { label: "Won", value: 0 },
          ]} />

          {/* YOUTUBE */}
          <MetricBox title="YouTube Total Influencer: 0" color="border" items={[
            { label: "Outreach", value: 0 },
            { label: "Responded", value: 0 },
            { label: "Not Interested", value: 0 },
            { label: "Content Pending", value: 0 },
            { label: "Posted", value: 0 },
            { label: "Web Clicks", value: 0 },
            { label: "Sales Quantity", value: 0 },
            { label: "Sales Amount", value: "$0" },
            { label: "CVR", value: 0 },
            { label: "Won", value: 0 },
          ]} />

        </div>
      </div>

    </div>
  )
}