"use client"

import { useState } from "react"
import { IconPlus } from "@tabler/icons-react"

const columns = [
  { key: "for-creation", title: "For Order Creation", color: "bg-green-400" },
  { key: "in-transit", title: "In-Transit", color: "bg-yellow-400" },
  { key: "delivered", title: "Delivered", color: "bg-cyan-400" },
  { key: "posted", title: "Posted", color: "bg-green-500" },
  { key: "completed", title: "Completed", color: "bg-pink-400" },
]

const initialTasks = [
  { id: "1", title: "Order 1", status: "for-creation" },
  { id: "2", title: "Order 2", status: "in-transit" },
]

export default function ClosedPage() {
  const [tasks] = useState(initialTasks)

  return (
    <div className="flex flex-col gap-4 p-4">

      {/* Top Title (outside box like layout header) */}
      <h2 className="text-base font-medium text-gray-800">
        Closed Collaborations
      </h2>

      {/* BOX CONTAINER (same as Pipeline) */}
      <div className="rounded-xl border bg-white p-4">

        {/* Columns */}
        <div className="grid grid-cols-5 gap-4">
          {columns.map((col) => {
            const count = tasks.filter((t) => t.status === col.key).length

            return (
              <div key={col.key} className="flex flex-col gap-2">

                {/* Header */}
                <div className={`${col.color} text-white rounded-lg px-3 py-2 text-sm font-medium flex justify-between items-center`}>
                  <span>{count} {col.title}</span>
                </div>

                {/* Drop Area */}
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