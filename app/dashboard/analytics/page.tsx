"use client"

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
  return (
    <div className="flex flex-col gap-6 p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Here are the latest insights
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
            { label: "Responses", value: "0.00%" },
          ]} />

          <MetricBox title="Closing Rate" color="border-green-400" items={[
            { label: "Deals Closed", value: "0.00%" },
          ]} />

          <MetricBox title="Post Rate" color="border-red-400" items={[
            { label: "Posted", value: "0.00%" },
          ]} />
        </div>
      </div>

      {/* POST INSIGHTS */}
      <div>
        <h2 className="text-md font-semibold mb-3">Post Insights</h2>

        <div className="grid md:grid-cols-4 gap-4">
          <MetricBox title="Posted" color="bg-blue-700 text-white" items={[
            { label: "Total", value: 0 },
          ]} />

          <MetricBox title="Content Pending" color="bg-indigo-600 text-white" items={[
            { label: "Pending", value: 0 },
          ]} />

          <MetricBox title="Inactive" color="bg-sky-600 text-white" items={[
            { label: "Inactive", value: 0 },
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
      title="Total Influencer: 1"
      color="border"
      items={[
        { label: "Facebook", value: 0 },
        { label: "Instagram", value: 0 },
        { label: "TikTok", value: 1 },
        { label: "YouTube", value: 0 },
      ]}
    />

    {/* TOTAL REACHED OUT */}
    <MetricBox
      title="Total Reached Out: 0"
      color="border"
      items={[
        { label: "Facebook", value: 0 },
        { label: "Instagram", value: 0 },
        { label: "TikTok", value: 0 },
        { label: "YouTube", value: 0 },
      ]}
    />

    {/* TOTAL WON */}
    <MetricBox
      title="Total Won: 0"
      color="border"
      items={[
        { label: "Facebook", value: 0 },
        { label: "Instagram", value: 0 },
        { label: "TikTok", value: 0 },
        { label: "YouTube", value: 0 },
      ]}
    />

  </div>

  {/* SECOND ROW */}
  <div className="grid md:grid-cols-3 gap-4 mt-4">

    {/* TOTAL OUTREACH */}
    <MetricBox
      title="Total Outreach: 0"
      color="border"
      items={[
        { label: "No Response", value: 0 },
        { label: "Responded", value: 0 },
        { label: "In Progress", value: 0 },
        { label: "Not Interested", value: 0 },
        { label: "For Order Creation", value: 0 },
        { label: "In Transit", value: 0 },
        { label: "Delivered", value: 0 },
        { label: "Content Pending", value: 0 },
        { label: "Posted", value: 0 },
      ]}
    />

    {/* NOT INTERESTED */}
    <MetricBox
      title="Not Interested: 0"
      color="border"
      items={[
        { label: "Paid only", value: 0 },
        { label: "No usage rights", value: 0 },
        { label: "No creative freedom", value: 0 },
        { label: "Values mismatch", value: 0 },
        { label: "Brand conflict", value: 0 },
        { label: "Fully booked", value: 0 },
        { label: "Others", value: 0 },
      ]}
    />

    {/* TOTAL WON PIPELINE */}
    <MetricBox
      title="Total Won: 0"
      color="border"
      items={[
        { label: "For Order Creation", value: 0 },
        { label: "In Transit", value: 0 },
        { label: "Delivered", value: 0 },
        { label: "Content Pending", value: 0 },
        { label: "Posted", value: 0 },
      ]}
    />

  </div>

  {/* GEOGRAPHIC */}
  <div className="grid md:grid-cols-3 gap-4 mt-4">
    <MetricBox
      title="Geographic Agreement Insights"
      color="border"
      items={[
        { label: "PH", value: 0 },
      ]}
    />
  </div>
</div>


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
          <MetricBox title="Instagram Total Influencer: 0" color="border" items={[
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

          {/* TIKTOK */}
          <MetricBox title="TikTok Total Influencer: 1" color="border" items={[
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