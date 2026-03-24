"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function InfluencerList() {
  const [showFilter, setShowFilter] = useState(false)

  const mockData = [
    {
      username: "https://www.a",
      followers: "3K",
      eng: "1.5%",
      status: "For Outreach",
    },
    {
      username: "https://www.b",
      followers: "5K",
      eng: "2.3%",
      status: "For Outreach",
    },
    {
      username: "https://www.c",
      followers: "10K",
      eng: "3.1%",
      status: "For Outreach",
    },
    {
      username: "https://www.d",
      followers: "1.2K",
      eng: "0.9%",
      status: "For Outreach",
    },
    {
      username: "https://www.e",
      followers: "7.8K",
      eng: "4.5%",
      status: "For Outreach",
    },
  ]

  return (
    <div className="flex flex-col gap-4">

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <Input placeholder="Search Influencer" className="max-w-sm" />
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-2"></th>
              <th className="p-2">Profile</th>
              <th className="p-2">Username</th>
              <th className="p-2">Followers</th>
              <th className="p-2">ENG Rate</th>
              <th className="p-2">Avg Video Views</th>
              <th className="p-2">GMV</th>
              <th className="p-2">Status</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Assessment</th>
              <th className="p-2">Created by</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {mockData.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">
                  <input type="checkbox" />
                </td>

                <td className="p-2">
                  <div className="w-8 h-8 rounded-full bg-orange-400" />
                </td>

                <td className="p-2">{item.username}</td>
                <td className="p-2">{item.followers}</td>
                <td className="p-2">{item.eng}</td>
                <td className="p-2"></td>
                <td className="p-2">$</td>

                <td className="p-2">
                  <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs">
                    {item.status}
                  </span>
                </td>

                <td className="p-2"></td>
                <td className="p-2"></td>

                <td className="p-2">
                  <div className="w-6 h-6 rounded-full bg-orange-400" />
                </td>

                <td className="p-2 text-red-500 cursor-pointer">
                  🗑
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}