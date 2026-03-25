"use client"

import { useState } from "react"
import {
  IconMail,
  IconFilter,
  IconTrash,
  IconArchive,
  IconSearch,
  IconX,
  IconSend,
} from "@tabler/icons-react"

type Email = {
  id: number
  name: string
  subject: string
  preview: string
  message: string
  date: string
  status?: "ONBOARDED" | "IN CONVERSATION"
}

const emails: Email[] = [
  {
    id: 1,
    name: "Rachel Berman",
    subject: "March content",
    preview: "All good to go! Hi Dani...",
    message:
      "Hi Dani! Everything looks good on our side. We are ready to move forward with the collaboration.",
    date: "Sent 3 days ago",
    status: "ONBOARDED",
  },
  {
    id: 2,
    name: "topknotmamakz",
    subject: "ROYO Samples",
    preview: "Delicious, Nutritious & Family Owned!",
    message:
      "Hi! We would love to collaborate. ROYO samples are available.",
    date: "Sent 6 days ago",
    status: "ONBOARDED",
  },
  {
    id: 3,
    name: "tinyexplorersphx",
    subject: "ROYO Samples",
    preview: "Just let me know your full name...",
    message:
      "Just let me know your full name and address so we can send the package.",
    date: "Sent 6 days ago",
    status: "IN CONVERSATION",
  },
]

export default function InboxPage() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [openCompose, setOpenCompose] = useState(false)
  const [reply, setReply] = useState("")

  return (
    <div className="flex h-full gap-6 p-6">

      {/* LEFT PANEL */}
      <div className="flex flex-col w-[420px] border border-[#0F6B3E]/20 rounded-xl overflow-hidden bg-white">

        {/* HEADER */}
        <div className="p-4 border-b border-[#0F6B3E]/10">
          <div className="flex items-center gap-3">

            <div className="relative flex-1">
              <IconSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                placeholder="Search email or influencer"
                className="w-full pl-9 pr-3 h-10 border border-[#0F6B3E]/20 rounded-lg outline-none focus:ring-2 focus:ring-[#1FAE5B]"
              />
            </div>

            <button className="border border-[#0F6B3E]/20 p-2 rounded-lg hover:bg-[#0F6B3E]/10">
              <IconFilter size={16} />
            </button>

            <button
              onClick={() => setOpenCompose(true)}
              className="bg-[#1FAE5B] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0F6B3E]"
            >
              <IconMail size={16} />
              Compose
            </button>

          </div>
        </div>

        {/* EMAIL LIST */}
        <div className="flex flex-col">

          {emails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`cursor-pointer px-4 py-3 border-b border-[#0F6B3E]/10 hover:bg-[#0F6B3E]/5 transition ${
                selectedEmail?.id === email.id ? "bg-[#1FAE5B]/10" : ""
              }`}
            >
              <div className="flex items-start gap-3">

                <div className="w-9 h-9 rounded-full bg-[#1FAE5B]/20 flex items-center justify-center text-[#0F6B3E] font-semibold text-sm">
                  {email.name.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">

                    <span className="font-medium text-sm">
                      {email.name}
                    </span>

                    {email.status && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[#1FAE5B]/20 text-[#0F6B3E]">
                        {email.status}
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{email.subject}</span> — {email.preview}
                  </p>
                </div>

                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {email.date}
                </div>

              </div>
            </div>
          ))}

        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 border border-[#0F6B3E]/20 rounded-xl p-6 bg-white">

        {selectedEmail ? (

          <div className="flex flex-col h-full">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">

              <div>
                <h2 className="font-semibold text-lg">
                  {selectedEmail.subject}
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedEmail.name}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <IconArchive
                  size={20}
                  className="cursor-pointer text-[#0F6B3E]"
                />

                <IconTrash
                  size={20}
                  className="cursor-pointer text-red-500"
                />
              </div>

            </div>

            {/* MESSAGE */}
            <div className="flex-1 text-sm text-gray-700 leading-relaxed">
              {selectedEmail.message}
            </div>

            {/* REPLY */}
            <div className="mt-6 border-t pt-4 flex gap-2">

              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 border border-[#0F6B3E]/20 rounded-lg p-3 h-20 outline-none focus:ring-2 focus:ring-[#1FAE5B]"
              />

              <button className="bg-[#1FAE5B] text-white px-4 rounded-lg flex items-center">
                <IconSend size={18} />
              </button>

            </div>

          </div>

        ) : (

          <div className="flex h-full items-center justify-center text-gray-400">
            Select an email to view conversation
          </div>

        )}

      </div>

      {/* COMPOSE MODAL */}
      {openCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpenCompose(false)}
          />

          <div className="relative w-[700px] bg-white rounded-xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-4">

              <h2 className="font-semibold text-lg">
                Compose Email
              </h2>

              <button onClick={() => setOpenCompose(false)}>
                <IconX />
              </button>

            </div>

            <input
              placeholder="To"
              className="w-full border-b border-[#0F6B3E]/20 py-2 outline-none"
            />

            <input
              placeholder="Subject"
              className="w-full border-b border-[#0F6B3E]/20 py-2 outline-none mt-3"
            />

            <textarea
              placeholder="Write message..."
              className="w-full h-40 mt-4 outline-none resize-none"
            />

            <div className="flex justify-end gap-2 mt-6">

              <button
                onClick={() => setOpenCompose(false)}
                className="border border-[#0F6B3E]/20 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button className="bg-[#1FAE5B] text-white px-4 py-2 rounded-lg hover:bg-[#0F6B3E]">
                Send
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}