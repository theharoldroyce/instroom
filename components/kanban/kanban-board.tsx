"use client"

import { useState } from "react"
import {
  IconLayoutKanban,
  IconList,
  IconSearch,
  IconPlus
} from "@tabler/icons-react"

type Influencer = {
  id: string
  name: string
  handle: string
  followers: string
  status: string
}

const columns = [
  { key: "prospects", title: "Prospects", color: "bg-yellow-400" },
  { key: "reached", title: "Reached Out", color: "bg-orange-400" },
  { key: "conversation", title: "In Conversation", color: "bg-blue-400" },
  { key: "onboarded", title: "Onboarded", color: "bg-[#1FAE5B]" },
  { key: "rejected", title: "Rejected", color: "bg-red-500" },
]

const initialData: Influencer[] = [
  { id: "1", name: "Marisha Nicole", handle: "@luxe_liftin", followers: "56.6k", status: "prospects" },
  { id: "2", name: "Emma Murray", handle: "@emmabrah", followers: "35.1k", status: "prospects" },
  { id: "3", name: "Shaquille", handle: "@shaquille", followers: "13k", status: "reached" },
  { id: "4", name: "Audrey", handle: "@bestie_audrey", followers: "44.8k", status: "conversation" },
  { id: "5", name: "Flo", handle: "@theblended", followers: "14k", status: "onboarded" },
  { id: "6", name: "John Merola", handle: "@johnmerola", followers: "47.2k", status: "rejected" },
]

export default function PipelinePage() {

  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [data] = useState(initialData)
  const [search, setSearch] = useState("")

  const filtered = data.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.handle.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4 p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        {/* SEARCH */}
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

        {/* VIEW SWITCH */}
        <div className="flex gap-2">

          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              view === "kanban"
                ? "bg-[#1FAE5B] text-white"
                : "border border-[#0F6B3E]/20"
            }`}
          >
            <IconLayoutKanban size={16}/>
            Kanban
          </button>

          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
              view === "list"
                ? "bg-[#1FAE5B] text-white"
                : "border border-[#0F6B3E]/20"
            }`}
          >
            <IconList size={16}/>
            List
          </button>

        </div>

      </div>

      {/* KANBAN */}
      {view === "kanban" && (

        <div className="rounded-xl border border-[#0F6B3E]/10 bg-white p-5">

          <div className="grid grid-cols-5 gap-4">

            {columns.map((col) => {

              const items = filtered.filter(
                (i) => i.status === col.key
              )

              return (

                <div key={col.key} className="flex flex-col gap-3">

                  {/* COLUMN HEADER */}
                  <div className={`${col.color} text-white rounded-lg px-3 py-2 text-sm font-semibold flex justify-between`}>
                    <span>{items.length} {col.title}</span>
                  </div>

                  {/* CARDS */}
                  {items.map((inf) => (

                    <div
                      key={inf.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-sm"
                    >

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-full bg-[#1FAE5B]/20 flex items-center justify-center text-[#0F6B3E] font-semibold text-sm">
                          {inf.name.charAt(0)}
                        </div>

                        <div className="flex flex-col text-sm">
                          <span className="font-medium">{inf.name}</span>
                          <span className="text-xs text-gray-500">{inf.handle}</span>
                          <span className="text-xs text-gray-400">👥 {inf.followers}</span>
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

      )}

      {/* LIST VIEW */}
      {view === "list" && (

        <div className="bg-white border rounded-xl overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Influencer</th>
                <th className="px-4 py-3 text-left">Handle</th>
                <th className="px-4 py-3 text-left">Followers</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>

              {filtered.map((inf) => (

                <tr key={inf.id} className="border-t hover:bg-gray-50">

                  <td className="px-4 py-3 flex items-center gap-3">

                    <div className="w-9 h-9 rounded-full bg-[#1FAE5B]/20 flex items-center justify-center font-semibold text-[#0F6B3E]">
                      {inf.name.charAt(0)}
                    </div>

                    {inf.name}

                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {inf.handle}
                  </td>

                  <td className="px-4 py-3">
                    {inf.followers}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-[#1FAE5B]/15 text-[#0F6B3E]">
                      {inf.status}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  )
}