"use client"

import { useState } from "react"
import { IconPlus, IconSearch } from "@tabler/icons-react"

const columns = [
  { key: "for-creation", title: "For Order Creation", color: "bg-[#1FAE5B]" },
  { key: "in-transit", title: "In-Transit", color: "bg-yellow-500" },
  { key: "delivered", title: "Delivered", color: "bg-cyan-500" },
  { key: "posted", title: "Posted", color: "bg-[#0F6B3E]" },
  { key: "completed", title: "Completed", color: "bg-pink-500" },
]

const initialTasks = [
  {
    id: "1",
    name: "Marisha Nicole",
    handle: "@luxe_liftin",
    followers: "56.6k",
    status: "for-creation",
  },
  {
    id: "2",
    name: "Emma Murray",
    handle: "@emmabrah",
    followers: "35.1k",
    status: "in-transit",
  },
  {
    id: "3",
    name: "Shaquille",
    handle: "@shaquille",
    followers: "13k",
    status: "delivered",
  },
]

export default function ClosedPage() {

  const [tasks] = useState(initialTasks)
  const [search, setSearch] = useState("")

  const filteredTasks = tasks.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.handle.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4 p-6">

      {/* SEARCH BAR */}
      <div className="relative w-full max-w-md">

        <IconSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search influencer..."
          className="w-full pl-9 pr-3 h-10 border border-[#0F6B3E]/20 rounded-lg outline-none focus:ring-2 focus:ring-[#1FAE5B]"
        />

      </div>

      {/* BOARD */}
      <div className="rounded-xl border border-[#0F6B3E]/10 bg-white p-5">

        <div className="grid grid-cols-5 gap-4">

          {columns.map((col) => {

            const items = filteredTasks.filter(
              (t) => t.status === col.key
            )

            return (

              <div key={col.key} className="flex flex-col gap-3">

                {/* HEADER */}
                <div className={`${col.color} text-white rounded-lg px-3 py-2 text-sm font-semibold flex justify-between`}>
                  <span>{items.length} {col.title}</span>
                </div>

                {/* CARDS */}
                {items.map((task) => (

                  <div
                    key={task.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-sm"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-full bg-[#1FAE5B]/20 flex items-center justify-center text-[#0F6B3E] font-semibold text-sm">
                        {task.name.charAt(0)}
                      </div>

                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{task.name}</span>
                        <span className="text-xs text-gray-500">{task.handle}</span>
                        <span className="text-xs text-gray-400">👥 {task.followers}</span>
                      </div>

                    </div>

                  </div>

                ))}

                {/* DROP AREA */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition">
                  <span>Drop Here</span>
                  <IconPlus size={16} />
                </div>

              </div>

            )

          })}

        </div>

      </div>

    </div>
  )
}