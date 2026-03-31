"use client"

import { useState, useEffect } from "react"
import { Drawer, DrawerContent, DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

export default function InfluencerProfile({ data, onUpdate, close }: any) {
  const [pipelineStatus, setPipelineStatus] = useState(data.pipelineStatus || "Prospect")
  const [campaignType, setCampaignType] = useState(data.campaignType || "Gifting")
  const [notes, setNotes] = useState(data.notes || "")
  const [activeTab, setActiveTab] = useState("basic")
  const [visible, setVisible] = useState(false)

  const [openStatus, setOpenStatus] = useState(false)
  const [openCampaign, setOpenCampaign] = useState(false)

  const statusOptions = ["Prospect", "Reached Out", "In Conversation", "Onboarded", "Rejected"]
  const campaignOptions = ["Gifting", "Paid", "Affiliate"]

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(close, 300)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Prospect": return "bg-gray-100 text-gray-700"
      case "Reached Out": return "bg-blue-100 text-blue-700"
      case "In Conversation": return "bg-yellow-100 text-yellow-700"
      case "Onboarded": return "bg-green-100 text-green-700"
      case "Rejected": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const inputClass = "border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]/20 focus:border-[#1FAE5B]"

  const getCampaignColor = (type: string) => {
    switch (type) {
      case "Gifting":
        return "bg-purple-100 text-purple-700"
      case "Paid":
        return "bg-yellow-100 text-yellow-700"
      case "Affiliate":
        return "bg-indigo-100 text-indigo-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Drawer open={true} direction="right" onOpenChange={open => { if (!open) close(); }}>
      <DrawerContent className="w-2/3 max-w-full ml-auto h-full rounded-none p-0 bg-white border-l-4 border-[#1FAE5B] shadow-2xl">

        <DrawerHeader>
          <DrawerTitle className="text-2xl">Influencer Profile</DrawerTitle>
        </DrawerHeader>

        <div className="sticky top-0 z-20 bg-white border-b flex items-center justify-between p-6">
          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-[#1FAE5B] text-white flex items-center justify-center font-semibold ring-4 ring-[#1FAE5B]/20">
              {data.influencer?.[0] ?? "?"}
            </div>

            <div>
              <p className="font-bold text-lg">{data.influencer}</p>
              <p className="text-xs text-gray-500">{data.instagramHandle}</p>
            </div>

            {/* PIPELINE STATUS */}
            <div className="flex flex-col text-xs ml-6 relative">
              <span className="text-gray-500 mb-1">Pipeline status</span>

              <button
                onClick={() => setOpenStatus(!openStatus)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm shadow-sm border w-[135px]",
                  getStatusColor(pipelineStatus)
                )}
              >
                {pipelineStatus}
                <span className="text-xs">▼</span>
              </button>

              {openStatus && (
                <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50">
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setPipelineStatus(s)
                        setOpenStatus(false)
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between",
                        getStatusColor(s)
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CAMPAIGN TYPE */}
            <div className="flex flex-col text-xs ml-4 relative">
              <span className="text-gray-500 mb-1">Campaign type</span>

              <button
                onClick={() => setOpenCampaign(!openCampaign)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm shadow-sm border w-[100px]",
                  getCampaignColor(campaignType)
                )}
              >
                {campaignType}
                <span className="text-xs">▼</span>
              </button>

              {openCampaign && (
                <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50">
                  {campaignOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCampaignType(c)
                        setOpenCampaign(false)
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-gray-50",
                        getCampaignColor(c)
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
          
          <DrawerClose asChild>
            <button
              onClick={close}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </DrawerClose>
        </div>

        <div className="bg-gray-50 rounded-xl shadow-sm mx-6 mt-6 p-4 flex gap-2 flex-wrap">
          <button className="bg-[#1FAE5B] hover:bg-[#0F6B3E] text-white px-4 py-2 rounded-lg text-sm transition">TikTok</button>
          <button className="bg-[#E6F9F0] hover:bg-[#C2F2DE] text-[#1FAE5B] px-4 py-2 rounded-lg text-sm border border-[#1FAE5B]/30 transition">Send Email</button>
          <button className="bg-[#E6F9F0] hover:bg-[#C2F2DE] text-[#1FAE5B] px-4 py-2 rounded-lg text-sm border border-[#1FAE5B]/30 transition">Send DM</button>
          <button className="bg-[#E6F9F0] hover:bg-[#C2F2DE] text-[#1FAE5B] px-4 py-2 rounded-lg text-sm border border-[#1FAE5B]/30 transition">Follow up</button>
        </div>

        <div className="bg-gray-50 rounded-xl shadow-sm mx-6 mt-4 p-4 border-b">
          <div className="flex gap-6 text-sm">
            {["basic", "order", "post", "stats"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-2 capitalize ${
                  activeTab === tab
                    ? "border-[#1FAE5B] text-[#1FAE5B] font-semibold"
                    : "border-transparent text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {activeTab === "basic" && (
            <div className="bg-white rounded-xl shadow p-6 mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 px-6 py-5 border-b rounded-xl">
                <div><p className="text-xs text-gray-500">Followers</p><p className="font-semibold">{data.followers}</p></div>
                <div><p className="text-xs text-gray-500">Eng Rate</p><p className="font-semibold">{data.engagementRate}</p></div>
                <div><p className="text-xs text-gray-500">Avg Views</p><p className="font-semibold">0</p></div>
                <div><p className="text-xs text-gray-500">GMV</p><p className="font-semibold">$</p></div>
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

          {activeTab === "order" && (
            <div className="bg-white rounded-xl shadow p-6 mt-6">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input className={inputClass} placeholder="First name" />
                <input className={inputClass} placeholder="Last name" />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Contact Number" />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Product Name" />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Order Number" />
                <input className={inputClass} placeholder="Product Cost" />
                <input className={inputClass} placeholder="Discount Code" />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Affiliate Link" />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Shipping Address" />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Tracking Link" />
              </div>
            </div>
          )}

          {activeTab === "post" && (
            <div className="bg-white rounded-xl shadow p-6 mt-6">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input className={inputClass} placeholder="Post Link" />
                <input className={inputClass} placeholder="Likes" />
                <input className={inputClass} placeholder="Sales" />
                <input className={inputClass} placeholder="Drive Link" />
                <input className={inputClass} placeholder="Comments" />
                <input className={inputClass} placeholder="Amount" />
                <input className={inputClass} placeholder="Usage Rights" />
                <input className={inputClass} placeholder="Views" />
                <input className={inputClass} placeholder="Clicks" />
                <input className="border rounded-lg px-3 py-2 w-full sm:col-span-3" placeholder="Conversion Rate" />
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="bg-white rounded-xl shadow p-6 mt-6 text-gray-400 text-sm">
              No statistics yet.
            </div>
          )}
        </div>

      </DrawerContent>
    </Drawer>
  )
}
