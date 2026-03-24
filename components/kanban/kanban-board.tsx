"use client"

import { useState } from "react"
import { IconPlus, IconBrandInstagram } from "@tabler/icons-react"

type Influencer = {
  id: string
  name: string
  handle: string
  followers: string
  status: string
}

const columns = [
  { key: "prospects", title: "PROSPECTS", color: "bg-yellow-100" },
  { key: "reached", title: "REACHED OUT", color: "bg-purple-100" },
  { key: "conversation", title: "IN CONVERSATION", color: "bg-gray-100" },
  { key: "onboarded", title: "ONBOARDED", color: "bg-green-100" },
  { key: "rejected", title: "REJECTED", color: "bg-red-100" },
]

const initialData: Influencer[] = [
  {
    id: "1",
    name: "Marisha Nicole",
    handle: "@luxe_liftin",
    followers: "56.6k",
    status: "prospects",
  },
  {
    id: "2",
    name: "Emma Murray",
    handle: "@emmabrahamson",
    followers: "35.1k",
    status: "prospects",
  },
  {
    id: "3",
    name: "Shaquille",
    handle: "@shaquillebarneau",
    followers: "13k",
    status: "reached",
  },
  {
    id: "4",
    name: "Audrey",
    handle: "@bestie_audrey",
    followers: "44.8k",
    status: "conversation",
  },
  {
    id: "5",
    name: "Flo",
    handle: "@theblendedbeauty",
    followers: "14k",
    status: "onboarded",
  },
  {
    id: "6",
    name: "John Merola",
    handle: "@johnmerola",
    followers: "47.2k",
    status: "rejected",
  },
]

export default function KanbanBoard() {
  const [data] = useState(initialData)

  return (
    <div className="flex gap-4 overflow-x-auto p-4">

      {columns.map((col) => {
        const items = data.filter((d) => d.status === col.key)

        return (
          <div key={col.key} className="w-72 flex-shrink-0">

            {/* Header */}
            <div className={`${col.color} rounded-lg px-3 py-2 mb-2`}>
              <div className="flex justify-between text-xs font-semibold">
                <span>{col.title}</span>
                <span>{items.length}</span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">

              {items.map((inf) => (
                <div
                  key={inf.id}
                  className="bg-white rounded-xl p-3 shadow-sm border hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                      {inf.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{inf.name}</p>
                      <p className="text-xs text-gray-500">{inf.handle}</p>
                    </div>

                    {/* IG */}
                    <IconBrandInstagram size={18} className="text-pink-500" />
                  </div>

                  {/* Followers */}
                  <div className="text-xs text-gray-500 mt-2">
                    👥 {inf.followers}
                  </div>
                </div>
              ))}

              {/* Drop area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-xs text-gray-400 flex flex-col items-center gap-1">
                Drop Here
                <IconPlus size={14} />
              </div>

            </div>
          </div>
        )
      })}
    </div>
  )
}