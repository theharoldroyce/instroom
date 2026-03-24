"use client"

import { useState } from "react"
import {
  IconMail,
  IconFilter,
  IconTrash,
  IconArchive,
  IconX,
} from "@tabler/icons-react"

type Email = {
  id: number
  name: string
  subject: string
  preview: string
  date: string
  status?: "ONBOARDED" | "IN CONVERSATION" | "REJECTED"
}

const emails: Email[] = [
  {
    id: 1,
    name: "Rachel Berman",
    subject: "March content",
    preview: "All good to go! Hi Dani...",
    date: "Sent 3 days ago",
    status: "ONBOARDED",
  },
  {
    id: 2,
    name: "topknotmamakz",
    subject: "ROYO Samples",
    preview: "Delicious, Nutritious & Family Owned!",
    date: "Sent 6 days ago",
    status: "ONBOARDED",
  },
  {
    id: 3,
    name: "tinyexplorersphx",
    subject: "ROYO Samples",
    preview: "Just let me know your full name...",
    date: "Sent 6 days ago",
    status: "IN CONVERSATION",
  },
]

export default function InboxPage() {
  const [selected, setSelected] = useState<number[]>([])
  const [openCompose, setOpenCompose] = useState(false)

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Inbox - Influencer Emails
        </h1>

        <div className="flex items-center gap-2">
          <button className="border px-3 py-2 rounded-lg flex items-center gap-2">
            <IconFilter size={16} />
          </button>

          <button
            onClick={() => setOpenCompose(true)}
            className="border px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <IconMail size={16} />
            Compose
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2">
        <button className="font-medium border-b-2 border-purple-500 pb-1">
          All Emails
        </button>
        <button className="text-muted-foreground">
          Follow Up{" "}
          <span className="ml-1 text-xs bg-purple-100 px-2 py-0.5 rounded">
            99+
          </span>
        </button>
      </div>

      {/* Email List */}
      <div className="flex flex-col border rounded-xl overflow-hidden">
        {emails.map((email) => (
          <div
            key={email.id}
            className="flex items-center gap-3 px-4 py-3 border-b hover:bg-muted/50"
          >
            <input
              type="checkbox"
              checked={selected.includes(email.id)}
              onChange={() => toggleSelect(email.id)}
            />

            <div className="w-8 h-8 rounded-full bg-gray-300" />

            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium">{email.name}</span>

                {email.status && (
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                    {email.status}
                  </span>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{email.subject}</span> —{" "}
                {email.preview}
              </div>
            </div>

            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {email.date}
            </div>

            <div className="flex items-center gap-2">
              <IconArchive size={18} className="cursor-pointer" />
              <IconTrash size={18} className="cursor-pointer" />
            </div>
          </div>
        ))}
      </div>

      {/* COMPOSE MODAL */}
      {openCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpenCompose(false)}
          />

          {/* Modal */}
          <div className="relative w-[800px] bg-white rounded-xl shadow-xl p-4">

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">New Email</h2>

              <button onClick={() => setOpenCompose(false)}>
                <IconX />
              </button>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
              From: <span className="font-medium text-black">dani@eatroyo.com</span>
            </div>

            <input
              placeholder="To: Search Influencer"
              className="w-full border-b py-2 outline-none text-sm"
            />

            <input
              placeholder="Subject"
              className="w-full border-b py-2 outline-none text-sm mt-2"
            />

            <textarea
              placeholder="Press / for templates or { for snippets..."
              className="w-full h-64 mt-3 outline-none text-sm resize-none"
            />

            <div className="flex items-center justify-between border-t pt-3 mt-3 text-sm">

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1">
                  <input type="checkbox" />
                  Add Signature
                </label>

                <button className="font-bold">B</button>
                <button className="italic">I</button>
                <button className="underline">U</button>
                <button>S</button>

                <button>🔗</button>
                <button>📎</button>

                <button>⏰ Remind Me</button>
                <button>{"{} Snippets"}</button>
              </div>

              <button className="text-muted-foreground">
                Select Template ▼
              </button>
            </div>

            <div className="flex justify-between items-center mt-4">

              <div className="flex gap-2">
                <button className="bg-purple-500 text-white px-4 py-2 rounded-lg">
                  Send
                </button>

                <button className="border px-4 py-2 rounded-lg">
                  ✨ SIA
                </button>
              </div>

              <button
                onClick={() => setOpenCompose(false)}
                className="border px-4 py-2 rounded-lg text-muted-foreground"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}