"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function AddInstagramInfluencer({ close }: any) {

  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    followers: "",
    engagement: "",
    location: "",
    niche: "",
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

      <div className="w-full max-w-xl lg:max-w-2xl bg-white rounded-xl shadow-lg px-6 py-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">

          <h2 className="text-lg md:text-xl font-semibold text-[#1E1E1E]">
            Add Instagram Influencer
          </h2>

          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 text-lg"
          >
            ×
          </button>

        </div>

        <p className="text-sm text-gray-500 mb-6">
          Enter the influencer’s Instagram username. We’ll automatically pull their profile details and key metrics for you.
        </p>

        {/* FORM */}
        <div className="space-y-4">

          <div className="flex flex-col gap-1">
            <label className="text-sm">
              Username <span className="text-red-500">*</span>
            </label>

            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter Instagram Username"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">
              Email address
            </label>

            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">
              Full name
            </label>

            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-sm">
                Followers <span className="text-red-500">*</span>
              </label>

              <Input
                name="followers"
                value={form.followers}
                onChange={handleChange}
                placeholder="6000"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm">
                Eng. Rate <span className="text-red-500">*</span>
              </label>

              <Input
                name="engagement"
                value={form.engagement}
                onChange={handleChange}
                placeholder="2.8"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-sm">
                Location <span className="text-red-500">*</span>
              </label>

              <Input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm">
                Niche <span className="text-red-500">*</span>
              </label>

              <Input
                name="niche"
                value={form.niche}
                onChange={handleChange}
                placeholder="Niche"
              />
            </div>

          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 pt-6">

          <button
            onClick={handleCancel}
            className="h-10 px-5 text-sm font-medium rounded-lg border border-gray-300 
                       text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="h-10 px-6 text-sm font-medium rounded-lg
                       bg-[#1FAE5B] text-white hover:bg-[#0F6B3E]"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  )
}