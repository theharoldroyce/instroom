"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function AddManualInfluencer({ close }: any) {

  const [form, setForm] = useState({
    platform: "",
    username: "",
    email: "",
    instagram: "",
    firstName: "",
    lastName: "",
    followers: "",
    engagement: "",
    location: "",
    niche: "",
    notes: "",
  })

  const [errors, setErrors] = useState<any>({})

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    let newErrors: any = {}

    if (!form.platform) newErrors.platform = true
    if (!form.username) newErrors.username = true
    if (!form.followers) newErrors.followers = true
    if (!form.engagement) newErrors.engagement = true
    if (!form.location) newErrors.location = true
    if (!form.niche) newErrors.niche = true

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    console.log(form)
    close()
  }

  return (

    <div className="w-full max-w-2xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-semibold text-[#1E1E1E]">
          Create New Influencer
        </h2>

        <button
          onClick={close}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-lg text-gray-500"
        >
          ×
        </button>

      </div>

      {/* FORM */}
      <div className="space-y-6">

        {/* PLATFORM + USERNAME */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

          <div className="flex flex-col gap-1">
            <label>
              Select Platform <span className="text-red-500">*</span>
            </label>

            <select
              name="platform"
              value={form.platform}
              onChange={handleChange}
              className={`h-10 border rounded-md px-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]
              ${errors.platform ? "border-red-500" : "border-gray-200"}`}
            >
              <option value="">Platform</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label>
              Username or Handlename <span className="text-red-500">*</span>
            </label>

            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="chooseinstroom"
              className={errors.username ? "border-red-500" : ""}
            />
          </div>

        </div>

        {/* CONTACT INFO */}
        <div>
          <p className="text-sm font-medium text-[#1E1E1E] mb-3">
            Contact Information
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
            />

            <Input
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              placeholder="Instagram Handle"
            />

            <Input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First Name"
            />

            <Input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last Name"
            />

          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Input
            name="followers"
            value={form.followers}
            onChange={handleChange}
            placeholder="Followers"
            className={errors.followers ? "border-red-500" : ""}
          />

          <Input
            name="engagement"
            value={form.engagement}
            onChange={handleChange}
            placeholder="Engagement Rate"
            className={errors.engagement ? "border-red-500" : ""}
          />

          <Input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className={errors.location ? "border-red-500" : ""}
          />

          <Input
            name="niche"
            value={form.niche}
            onChange={handleChange}
            placeholder="Niche"
            className={errors.niche ? "border-red-500" : ""}
          />

        </div>

        {/* NOTES */}
        <Input
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Add Notes"
        />

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-4 pt-4">

          <button
            onClick={close}
            className="text-gray-500 hover:text-[#0F6B3E]"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#1FAE5B] text-white px-6 py-2 rounded-lg hover:bg-[#0F6B3E]"
          >
            Save Influencer
          </button>

        </div>

      </div>

    </div>
  )
}