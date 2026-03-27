"use client"

import { useState, useEffect } from "react"

export default function InfluencerProfile({ data, onUpdate, close }: any) {
  const [pipelineStatus, setPipelineStatus] = useState(data.pipelineStatus || "Prospect")
  const [campaignType, setCampaignType] = useState(data.campaignType || "Gifting")
  const [notes, setNotes] = useState(data.notes || "")
  const [activeTab, setActiveTab] = useState("basic")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setPipelineStatus(data.pipelineStatus || "Prospect")
    setCampaignType(data.campaignType || "Gifting")
    setNotes(data.notes || "")
    setActiveTab("basic")
  }, [data.id])

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(close, 300)
  }

  const statusOptions = ["Prospect", "Reached Out", "In Conversation", "Onboarded", "Rejected"]

  const inputClass =
    "border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]/20 focus:border-[#1FAE5B] bg-white"

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        onClick={handleClose}
        className={`
          fixed inset-0 z-40 bg-black/40 transition-opacity duration-300
          md:hidden
          ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 z-50 h-full bg-white border-l-4 border-[#1FAE5B] shadow-2xl
          flex flex-col w-full md:w-1/2
          transition-transform duration-300 ease-in-out
          ${visible ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-20 bg-white border-b shrink-0">
          <div className="flex items-center justify-between gap-4 px-5 py-4">

            {/* Left: Avatar + Name + Handle */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 shrink-0 rounded-full bg-[#1FAE5B] text-white flex items-center justify-center font-bold text-xl ring-4 ring-[#1FAE5B]/20">
                {data.influencer?.[0] ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-base leading-tight truncate">{data.influencer}</p>
                <p className="text-sm text-gray-400 truncate">{data.instagramHandle}</p>
              </div>
            </div>

            {/* Right: Pipeline + Campaign + divider + Close */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Pipeline */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 px-1">Pipeline</span>
                <select
                  className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]/30 focus:border-[#1FAE5B] cursor-pointer min-w-[140px]"
                  value={pipelineStatus}
                  onChange={(e) => {
                    const val = e.target.value
                    setPipelineStatus(val)
                    onUpdate?.({ ...data, pipelineStatus: val, campaignType })
                  }}
                >
                  {statusOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Campaign */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 px-1">Campaign</span>
                <select
                  className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]/30 focus:border-[#1FAE5B] cursor-pointer min-w-[110px]"
                  value={campaignType}
                  onChange={(e) => {
                    const val = e.target.value
                    setCampaignType(val)
                    onUpdate?.({ ...data, pipelineStatus, campaignType: val })
                  }}
                >
                  <option>Gifting</option>
                  <option>Paid</option>
                  <option>Affiliate</option>
                </select>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200 mx-1" />

              {/* Close */}
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>

            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="bg-gray-50 mx-4 mt-4 rounded-xl p-3 flex gap-2 flex-wrap shrink-0">
          <button className="bg-[#1FAE5B] hover:bg-[#0F6B3E] text-white px-3 py-1.5 rounded-lg text-sm transition">
            TikTok
          </button>
          <button className="bg-[#E6F9F0] hover:bg-[#C2F2DE] text-[#1FAE5B] px-3 py-1.5 rounded-lg text-sm border border-[#1FAE5B]/30 transition">
            Send Email
          </button>
          <button className="bg-[#E6F9F0] hover:bg-[#C2F2DE] text-[#1FAE5B] px-3 py-1.5 rounded-lg text-sm border border-[#1FAE5B]/30 transition">
            Send DM
          </button>
          <button className="bg-[#E6F9F0] hover:bg-[#C2F2DE] text-[#1FAE5B] px-3 py-1.5 rounded-lg text-sm border border-[#1FAE5B]/30 transition">
            Follow up
          </button>
        </div>

        {/* TABS */}
        <div className="mx-4 mt-3 shrink-0 border-b border-gray-100">
          <div className="flex gap-1 text-sm overflow-x-auto no-scrollbar">
            {[
              { key: "basic", label: "Basic Info" },
              { key: "order", label: "Order" },
              { key: "post", label: "Post Insight" },
              { key: "stats", label: "Statistics" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`whitespace-nowrap px-3 pb-3 pt-1 border-b-2 text-sm transition-colors ${
                  activeTab === key
                    ? "border-[#1FAE5B] text-[#1FAE5B] font-semibold"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">

          {/* BASIC */}
          {activeTab === "basic" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 px-5 py-4 border-b rounded-t-xl">
                <div>
                  <p className="text-xs text-gray-400">Followers</p>
                  <p className="font-semibold text-sm">{data.followers}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Eng Rate</p>
                  <p className="font-semibold text-sm">{data.engagementRate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg Views</p>
                  <p className="font-semibold text-sm">0</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">GMV</p>
                  <p className="font-semibold text-sm">$—</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-5 py-5 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className={data.email ? "text-[#1FAE5B]" : "text-gray-400"}>{data.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Username</p>
                  <p>{data.instagramHandle || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Location</p>
                  <p className={data.location ? "" : "text-gray-400"}>{data.location || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Niche</p>
                  <p>{data.niche || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Gender</p>
                  <p className={data.gender ? "" : "text-gray-400"}>{data.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Platform</p>
                  <p>{data.platform || "Instagram"}</p>
                </div>
              </div>
              <div className="px-5 pb-5">
                <p className="text-xs text-gray-400 mb-2">Notes</p>
                <textarea
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]/20 focus:border-[#1FAE5B]"
                  placeholder="Add a note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ORDER */}
          {activeTab === "order" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input className={inputClass} placeholder="First name" defaultValue={data.firstName || ""} />
                <input className={inputClass} placeholder="Last name" defaultValue={data.lastName || ""} />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Contact Number" defaultValue={data.contactInfo || ""} />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Product Name" />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Order Number" />
                <input className={inputClass} placeholder="Product Cost" />
                <input className={inputClass} placeholder="Discount Code" />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Affiliate Link" />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Shipping Address" />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Tracking Link" defaultValue={data.trackingLink || ""} />
              </div>
            </div>
          )}

          {/* POST */}
          {activeTab === "post" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input className={inputClass} placeholder="Post Link" />
                <input className={inputClass} placeholder="Likes" />
                <input className={inputClass} placeholder="Sales" />
                <input className={inputClass} placeholder="Drive Link" />
                <input className={inputClass} placeholder="Comments" />
                <input className={inputClass} placeholder="Amount" />
                <input className={inputClass} placeholder="Usage Rights" />
                <input className={inputClass} placeholder="Views" />
                <input className={inputClass} placeholder="Clicks" />
                <input className={`${inputClass} sm:col-span-3`} placeholder="Conversion Rate" />
              </div>
            </div>
          )}

          {/* STATS */}
          {activeTab === "stats" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4 p-6 text-gray-400 text-sm">
              No statistics yet.
            </div>
          )}

        </div>
      </div>
    </>
  )
}