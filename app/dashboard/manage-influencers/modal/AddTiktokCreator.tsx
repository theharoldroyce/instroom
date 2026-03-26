"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function AddTiktokCreator({ close }: any) {

  const [form, setForm] = useState({
    handle: "",
    email: "",
    name: "",
    followers: "",
    engagement: "",
    avgViews: "",
    gmv: "",
    postRate: "",
    location: "",
    niche: ""
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    console.log(form)
    close()
  }

  const handleCancel = () => {
    const hasInput = Object.values(form).some((v) => v !== "")

    if (hasInput) {
      const confirmClose = window.confirm("Discard entered information?")
      if (!confirmClose) return
    }

    close()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      {/* Modal Container - No scroll, adjusted height */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl bg-white rounded-xl shadow-lg px-4 sm:px-6 py-5 sm:py-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#1E1E1E]">
            Add TikTok Creator
          </h2>

          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 text-lg transition-colors"
          >
            ×
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Just type the TikTok username — their profile info and performance data will be filled in automatically.
        </p>

        <div className="space-y-4">
          {/* HANDLE - Full width on all screens */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Handlename <span className="text-red-500">*</span>
            </label>

            <Input
              name="handle"
              value={form.handle}
              onChange={handleChange}
              placeholder="https://www.tiktok.com/@username or @username"
              className="w-full"
            />
          </div>

          {/* EMAIL & FULL NAME - Responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Email address
              </label>

              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Full name
              </label>

              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full"
              />
            </div>
          </div>

          {/* METRICS - Responsive grid with 2 columns on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Followers
              </label>

              <Input
                name="followers"
                value={form.followers}
                onChange={handleChange}
                placeholder="Followers"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Engagement Rate
              </label>

              <Input
                name="engagement"
                value={form.engagement}
                onChange={handleChange}
                placeholder="Eng. Rate (%)"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Avg Video Views
              </label>

              <Input
                name="avgViews"
                value={form.avgViews}
                onChange={handleChange}
                placeholder="Avg Video Views"
                className="w-full"
              />
            </div>
          </div>

          {/* GMV + POST RATE - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                GMV
              </label>

              <Input
                name="gmv"
                value={form.gmv}
                onChange={handleChange}
                placeholder="GMV ($)"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Est. Post Rate
              </label>

              <Input
                name="postRate"
                value={form.postRate}
                onChange={handleChange}
                placeholder="Est. Post Rate (per week)"
                className="w-full"
              />
            </div>
          </div>

          {/* LOCATION + NICHE - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Location
              </label>

              <Input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Niche
              </label>

              <Input
                name="niche"
                value={form.niche}
                onChange={handleChange}
                placeholder="e.g., Beauty, Fitness, Comedy"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS - Responsive button layout */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
          <button
            onClick={handleCancel}
            className="h-10 px-4 sm:px-5 text-sm font-medium rounded-lg border border-gray-300 
                       text-gray-600 hover:bg-gray-100 transition-colors
                       w-full sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="h-10 px-4 sm:px-6 text-sm font-medium rounded-lg
                       bg-[#1FAE5B] text-white hover:bg-[#0F6B3E] transition-colors
                       w-full sm:w-auto"
          >
            Save Creator
          </button>
        </div>
      </div>
    </div>
  )
}