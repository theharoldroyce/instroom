"use client"

import { useState, useEffect, useRef } from "react"
import {
  IconMail,
  IconSearch,
  IconX,
  IconSend,
  IconMessageCircle,
  IconInbox,
  IconStar,
  IconStarFilled,
  IconArrowLeft,
  IconDotsVertical,
} from "@tabler/icons-react"
import jsonData from "@/app/dashboard/data.json"

type Email = {
  id: number
  influencerId: number
  name: string
  handle: string
  avatar: string
  subject: string
  preview: string
  message: string
  date: string
  timestamp: string
  status: "ONBOARDED" | "IN CONVERSATION" | "REACHED_OUT" | "PROSPECT"
  read: boolean
  starred: boolean
  replies?: { sender: string; message: string; timestamp: string; isUser?: boolean }[]
}

// Generate emails based on influencer data (only 10 samples)
const generateEmails = (influencers: any[]): Email[] => {
  const statusMap: { [key: string]: "ONBOARDED" | "IN CONVERSATION" | "REACHED_OUT" | "PROSPECT" } = {
    "Onboarded": "ONBOARDED",
    "In Conversation": "IN CONVERSATION",
    "Reached Out": "REACHED_OUT",
    "Prospect": "PROSPECT"
  }

  // Take only first 10 influencers
  const sampleInfluencers = influencers.slice(0, 10)
  const emails: Email[] = []
  
  sampleInfluencers.forEach((influencer, index) => {
    const status = statusMap[influencer.pipelineStatus] || "PROSPECT"
    
    const daysAgo = Math.floor(Math.random() * 14)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    
    const replies = []
    if (status === "IN CONVERSATION" || status === "ONBOARDED") {
      replies.push({
        sender: influencer.influencer,
        message: `Hi! Thanks for reaching out. I'm definitely interested in collaborating!`,
        timestamp: new Date(date.getTime() + 86400000).toISOString(),
        isUser: false
      })
      if (status === "ONBOARDED") {
        replies.push({
          sender: "You",
          message: `Great to hear! Let me share more details with you.`,
          timestamp: new Date(date.getTime() + 172800000).toISOString(),
          isUser: true
        })
      }
    }
    
    emails.push({
      id: index + 1,
      influencerId: influencer.id,
      name: influencer.influencer,
      handle: influencer.instagramHandle,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.influencer)}&background=1FAE5B&color=fff&bold=true`,
      subject: "Collaboration Opportunity",
      preview: "We would love to work with you!",
      message: `Hi ${influencer.influencer.split(' ')[0]}! We've been following your content and we're huge fans. We'd love to discuss a potential collaboration opportunity with you. Looking forward to hearing your thoughts!\n\nBest regards,\nMarketing Team`,
      date: daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`,
      timestamp: date.toISOString(),
      status: status,
      read: daysAgo > 3,
      starred: daysAgo % 3 === 0,
      replies: replies,
    })
  })
  
  return emails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [openCompose, setOpenCompose] = useState(false)
  const [reply, setReply] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (jsonData && Array.isArray(jsonData)) {
      setEmails(generateEmails(jsonData))
    }
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedEmail?.replies])

  const filteredEmails = emails.filter(email => {
    const matchesSearch = searchQuery === "" || 
      email.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.handle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const toggleStar = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, starred: !email.starred } : email
    ))
  }

  const markAsRead = (id: number) => {
    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, read: true } : email
    ))
  }

  const sendReply = () => {
    if (!reply.trim() || !selectedEmail) return
    
    const newReply = {
      sender: "You",
      message: reply.trim(),
      timestamp: new Date().toISOString(),
      isUser: true
    }
    
    setEmails(prev => prev.map(email => 
      email.id === selectedEmail.id 
        ? { 
            ...email, 
            replies: [...(email.replies || []), newReply]
          }
        : email
    ))
    
    setSelectedEmail(prev => prev ? {
      ...prev,
      replies: [...(prev.replies || []), newReply]
    } : null)
    
    setReply("")
    
    setTimeout(() => {
      replyTextareaRef.current?.focus()
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendReply()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return formatTime(timestamp)
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex h-screen bg-white">
      {/* LEFT PANEL - Fixed Contact List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50 flex-shrink-0">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <button
              onClick={() => setOpenCompose(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <IconMail size={20} className="text-[#1FAE5B]" />
            </button>
          </div>
          
          <div className="relative">
            <IconSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg outline-none focus:ring-2 focus:ring-[#1FAE5B]/20 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Contact List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <IconInbox size={40} stroke={1.5} />
              <p className="mt-2 text-sm">No conversations</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email)
                  markAsRead(email.id)
                }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 transition ${
                  selectedEmail?.id === email.id ? "bg-gray-100" : ""
                } ${!email.read ? "bg-blue-50/30" : ""}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={email.avatar}
                    alt={email.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {!email.read && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#1FAE5B] rounded-full ring-2 ring-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-medium text-sm truncate ${!email.read ? "text-gray-900" : "text-gray-700"}`}>
                      {email.name}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDate(email.timestamp)}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${!email.read ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                    {email.preview}
                  </p>
                </div>
                
                <button
                  onClick={(e) => toggleStar(email.id, e)}
                  className="flex-shrink-0"
                >
                  {email.starred ? (
                    <IconStarFilled size={16} className="text-yellow-500" />
                  ) : (
                    <IconStar size={16} className="text-gray-300" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedEmail ? (
          <div className="flex flex-col h-full">
            {/* CHAT HEADER - Fixed */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="lg:hidden p-2 rounded-full hover:bg-gray-100"
                >
                  <IconArrowLeft size={20} />
                </button>
                <img
                  src={selectedEmail.avatar}
                  alt={selectedEmail.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedEmail.name}</h2>
                  <p className="text-xs text-gray-500">{selectedEmail.handle}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-full hover:bg-gray-100 transition">
                  <IconDotsVertical size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* MESSAGES AREA - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="max-w-3xl mx-auto">
                {/* Original Message */}
                <div className="flex gap-3 mb-6">
                  <img
                    src={selectedEmail.avatar}
                    alt={selectedEmail.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{selectedEmail.name}</span>
                      <span className="text-xs text-gray-400">{formatTime(selectedEmail.timestamp)}</span>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedEmail.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {selectedEmail.replies?.map((reply, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-3 mb-6 ${reply.isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {!reply.isUser && (
                      <img
                        src={selectedEmail.avatar}
                        alt={selectedEmail.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    {reply.isUser && (
                      <div className="w-8 h-8 rounded-full bg-[#1FAE5B] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        ME
                      </div>
                    )}
                    <div className={`flex-1 max-w-[70%] ${reply.isUser ? 'items-end' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${reply.isUser ? 'justify-end' : ''}`}>
                        <span className="text-sm font-medium text-gray-900">{reply.sender}</span>
                        <span className="text-xs text-gray-400">{formatTime(reply.timestamp)}</span>
                      </div>
                      <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                        reply.isUser 
                          ? 'bg-[#1FAE5B] text-white rounded-tr-none' 
                          : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* MESSAGE INPUT - Fixed at bottom */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
              <div className="flex gap-3 items-end">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#1FAE5B] flex items-center justify-center text-white text-xs font-medium">
                    ME
                  </div>
                </div>
                <div className="flex-1 relative">
                  <textarea
                    ref={replyTextareaRef}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedEmail.name.split(' ')[0]}...`}
                    rows={1}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#1FAE5B]/20 focus:border-[#1FAE5B] resize-none text-sm bg-white"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim()}
                    className="absolute right-2 bottom-2 p-1.5 rounded-full bg-[#1FAE5B] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0F6B3E] transition"
                  >
                    <IconSend size={16} />
                  </button>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <span className="text-xs text-gray-400">
                  Press Enter to send
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <IconMessageCircle size={48} stroke={1.5} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Select a conversation</p>
            <p className="text-xs mt-1 text-gray-400">Choose from the list to start messaging</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {openCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenCompose(false)}
          />
          <div className="relative w-[500px] bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-xl text-gray-900">New Message</h2>
              <button
                onClick={() => setOpenCompose(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <IconX size={20} />
              </button>
            </div>

            <input
              placeholder="To"
              className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#1FAE5B]"
            />
            <textarea
              placeholder="Message"
              rows={4}
              className="w-full mt-4 outline-none resize-none p-3 border border-gray-200 rounded-xl focus:border-[#1FAE5B]"
            />
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpenCompose(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="bg-[#1FAE5B] text-white px-4 py-2 rounded-xl hover:bg-[#0F6B3E] flex items-center gap-2">
                <IconSend size={16} />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}