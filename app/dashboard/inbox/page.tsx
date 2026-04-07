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
  IconChecklist,
  IconUserPlus,
  IconMessage,
  IconUserCheck,
  IconShoppingCart,
  IconTruck,
  IconPackage,
  IconPhoto,
  IconCircleCheck,
  IconX as IconReject,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import jsonData from "@/app/dashboard/data.json"

type PipelineStage = 
  | "PROSPECT" 
  | "REACHED_OUT" 
  | "IN_CONVERSATION" 
  | "ONBOARDED" 
  | "FOR_ORDER_CREATION" 
  | "IN_TRANSIT" 
  | "DELIVERED" 
  | "POSTED" 
  | "COMPLETED" 
  | "REJECTED"

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
  status: PipelineStage
  read: boolean
  starred: boolean
  orderId?: string
  trackingNumber?: string
  postedLink?: string
  rejectionReason?: string
  replies?: { sender: string; message: string; timestamp: string; isUser?: boolean }[]
}

type StageConfig = {
  id: PipelineStage
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  order: number
}

const stageConfigs: StageConfig[] = [
  { id: "PROSPECT", label: "Prospects", icon: <IconUserPlus size={18} />, color: "text-gray-600", bgColor: "bg-gray-100", order: 0 },
  { id: "REACHED_OUT", label: "Reached Out", icon: <IconMessage size={18} />, color: "text-blue-600", bgColor: "bg-blue-50", order: 1 },
  { id: "IN_CONVERSATION", label: "In Conversation", icon: <IconMessageCircle size={18} />, color: "text-purple-600", bgColor: "bg-purple-50", order: 2 },
  { id: "ONBOARDED", label: "Onboarded", icon: <IconUserCheck size={18} />, color: "text-indigo-600", bgColor: "bg-indigo-50", order: 3 },
  { id: "FOR_ORDER_CREATION", label: "For Order Creation", icon: <IconShoppingCart size={18} />, color: "text-orange-600", bgColor: "bg-orange-50", order: 4 },
  { id: "IN_TRANSIT", label: "In-Transit", icon: <IconTruck size={18} />, color: "text-yellow-600", bgColor: "bg-yellow-50", order: 5 },
  { id: "DELIVERED", label: "Delivered", icon: <IconPackage size={18} />, color: "text-teal-600", bgColor: "bg-teal-50", order: 6 },
  { id: "POSTED", label: "Posted", icon: <IconPhoto size={18} />, color: "text-pink-600", bgColor: "bg-pink-50", order: 7 },
  { id: "COMPLETED", label: "Completed", icon: <IconCircleCheck size={18} />, color: "text-green-600", bgColor: "bg-green-50", order: 8 },
  { id: "REJECTED", label: "Rejected", icon: <IconReject size={18} />, color: "text-red-600", bgColor: "bg-red-50", order: 9 },
]

// Generate enhanced emails with realistic pipeline progression
const generateEmails = (influencers: any[]): Email[] => {
  const stages: PipelineStage[] = [
    "PROSPECT", "REACHED_OUT", "IN_CONVERSATION", "ONBOARDED", 
    "FOR_ORDER_CREATION", "IN_TRANSIT", "DELIVERED", "POSTED", "COMPLETED", "REJECTED"
  ]
  
  const sampleInfluencers = influencers.slice(0, 30)
  const emails: Email[] = []
  
  sampleInfluencers.forEach((influencer, index) => {
    // Distribute influencers across different pipeline stages
    const stageIndex = index % stages.length
    const status = stages[stageIndex]
    
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    
    // Generate realistic replies based on stage
    const replies = []
    if (status !== "PROSPECT" && status !== "REJECTED") {
      replies.push({
        sender: influencer.influencer,
        message: `Hi! Thanks for reaching out. I'm interested in learning more!`,
        timestamp: new Date(date.getTime() + 86400000).toISOString(),
        isUser: false
      })
    }
    
    if (status === "IN_CONVERSATION" || status === "ONBOARDED" || status === "FOR_ORDER_CREATION") {
      replies.push({
        sender: "You",
        message: `Great! Let me share the campaign details with you.`,
        timestamp: new Date(date.getTime() + 172800000).toISOString(),
        isUser: true
      })
      replies.push({
        sender: influencer.influencer,
        message: `Sounds perfect! I'd love to collaborate.`,
        timestamp: new Date(date.getTime() + 259200000).toISOString(),
        isUser: false
      })
    }
    
    if (status === "IN_TRANSIT" || status === "DELIVERED") {
      replies.push({
        sender: "You",
        message: `Your package is on the way! Tracking #: 1Z${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        timestamp: new Date(date.getTime() + 345600000).toISOString(),
        isUser: true
      })
    }
    
    if (status === "POSTED") {
      replies.push({
        sender: influencer.influencer,
        message: `Just posted the content! Check it out: https://instagram.com/p/${Math.random().toString(36).substring(2, 10)}`,
        timestamp: new Date(date.getTime() + 432000000).toISOString(),
        isUser: false
      })
    }
    
    if (status === "COMPLETED") {
      replies.push({
        sender: "You",
        message: `Campaign completed successfully! Payment has been processed.`,
        timestamp: new Date(date.getTime() + 518400000).toISOString(),
        isUser: true
      })
    }
    
    if (status === "REJECTED") {
      replies.push({
        sender: influencer.influencer,
        message: `Thanks for the offer, but I'll have to pass at this time.`,
        timestamp: new Date(date.getTime() + 86400000).toISOString(),
        isUser: false
      })
    }
    
    const orderId = ["FOR_ORDER_CREATION", "IN_TRANSIT", "DELIVERED", "POSTED", "COMPLETED"].includes(status) 
      ? `ORD-${Math.floor(Math.random() * 10000)}` 
      : undefined
    
    const trackingNumber = ["IN_TRANSIT", "DELIVERED"].includes(status) 
      ? `1Z${Math.random().toString(36).substring(2, 15).toUpperCase()}` 
      : undefined
    
    const postedLink = status === "POSTED" 
      ? `https://instagram.com/p/${Math.random().toString(36).substring(2, 10)}`
      : undefined
    
    const rejectionReason = status === "REJECTED"
      ? ["Budget too low", "Schedule conflict", "Not interested in niche", "Already committed to competitor"][Math.floor(Math.random() * 4)]
      : undefined
    
    emails.push({
      id: index + 1,
      influencerId: influencer.id,
      name: influencer.influencer,
      handle: influencer.instagramHandle,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.influencer)}&background=1FAE5B&color=fff&bold=true`,
      subject: status === "FOR_ORDER_CREATION" ? "Order Creation Needed" : 
               status === "IN_TRANSIT" ? "Your Order Has Shipped" :
               status === "DELIVERED" ? "Package Delivered" :
               status === "POSTED" ? "Content Posted!" :
               status === "COMPLETED" ? "Campaign Complete" :
               "Collaboration Opportunity",
      preview: status === "REJECTED" ? "Declined collaboration" :
               status === "PROSPECT" ? "Potential collaboration opportunity" :
               status === "REACHED_OUT" ? "Initial outreach sent" :
               status === "IN_CONVERSATION" ? "Discussing details" :
               status === "ONBOARDED" ? "Ready to proceed" :
               status === "FOR_ORDER_CREATION" ? "Order pending creation" :
               status === "IN_TRANSIT" ? "Package in transit" :
               status === "DELIVERED" ? "Package delivered" :
               status === "POSTED" ? "Content live" :
               "Campaign completed successfully",
      message: `Hi ${influencer.influencer.split(' ')[0]}! We've been following your content and we're huge fans. We'd love to discuss a potential collaboration opportunity with you. Looking forward to hearing your thoughts!\n\nBest regards,\nMarketing Team`,
      date: daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`,
      timestamp: date.toISOString(),
      status: status,
      read: daysAgo > 3,
      starred: daysAgo % 5 === 0,
      orderId: orderId,
      trackingNumber: trackingNumber,
      postedLink: postedLink,
      rejectionReason: rejectionReason,
      replies: replies,
    })
  })
  
  return emails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedStage, setSelectedStage] = useState<PipelineStage | "ALL">("ALL")
  const [openCompose, setOpenCompose] = useState(false)
  const [reply, setReply] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [updateStageModal, setUpdateStageModal] = useState<{ open: boolean; email: Email | null }>({ open: false, email: null })
  
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
    const matchesStage = selectedStage === "ALL" || email.status === selectedStage
    const matchesSearch = searchQuery === "" || 
      email.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.handle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStage && matchesSearch
  })

  const getStageCount = (stage: PipelineStage | "ALL") => {
    if (stage === "ALL") return emails.length
    return emails.filter(e => e.status === stage).length
  }

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

  const updateEmailStage = (emailId: number, newStage: PipelineStage) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, status: newStage } : email
    ))
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(prev => prev ? { ...prev, status: newStage } : null)
    }
    setUpdateStageModal({ open: false, email: null })
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

  const getStatusBadge = (status: PipelineStage) => {
    const config = stageConfigs.find(s => s.id === status)
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config?.bgColor} ${config?.color}`}>
        {config?.icon}
        {config?.label}
      </span>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      {/* PIPELINE SIDEBAR - Collapsible */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} border-r border-gray-200 bg-gray-50 flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-white">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {!isSidebarCollapsed ? (
              <>
                <span className="text-sm font-semibold text-gray-700">Pipeline Stages</span>
                <IconChevronLeft size={16} className="text-gray-400" />
              </>
            ) : (
              <IconChevronRight size={16} className="text-gray-400 mx-auto" />
            )}
          </button>
        </div>

        {/* Stages List */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* ALL Inbox */}
          <button
            onClick={() => setSelectedStage("ALL")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 transition ${
              selectedStage === "ALL" 
                ? "bg-[#1FAE5B]/10 text-[#1FAE5B] border-r-2 border-[#1FAE5B]" 
                : "hover:bg-gray-100 text-gray-700"
            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? "All Conversations" : undefined}
          >
            <IconInbox size={18} />
            {!isSidebarCollapsed && (
              <>
                <span className="flex-1 text-left text-sm">All</span>
                <span className="text-xs text-gray-400">{getStageCount("ALL")}</span>
              </>
            )}
          </button>

          {/* Stage Buttons */}
          {stageConfigs.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition ${
                selectedStage === stage.id 
                  ? `${stage.bgColor} ${stage.color} border-r-2 border-current` 
                  : "hover:bg-gray-100 text-gray-600"
              } ${isSidebarCollapsed ? 'justify-center' : ''}`}
              title={isSidebarCollapsed ? stage.label : undefined}
            >
              {stage.icon}
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm">{stage.label}</span>
                  <span className="text-xs text-gray-400">{getStageCount(stage.id)}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Compose Button */}
        <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white">
          <button
            onClick={() => setOpenCompose(true)}
            className={`w-full bg-[#1FAE5B] text-white rounded-lg py-2 transition hover:bg-[#0F6B3E] flex items-center justify-center gap-2 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}
            title={isSidebarCollapsed ? "New Message" : undefined}
          >
            <IconMail size={18} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">New Message</span>}
          </button>
        </div>
      </div>

      {/* CONTACT LIST PANEL */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white flex-shrink-0">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedStage === "ALL" ? "Messages" : stageConfigs.find(s => s.id === selectedStage)?.label}
          </h1>
          
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

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <IconInbox size={40} stroke={1.5} />
              <p className="mt-2 text-sm">No conversations in this stage</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email)
                  markAsRead(email.id)
                }}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
                  selectedEmail?.id === email.id ? "bg-gray-50" : ""
                } ${!email.read ? "bg-blue-50/30" : ""}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={email.avatar}
                    alt={email.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {!email.read && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1FAE5B] rounded-full ring-2 ring-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${!email.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {email.name}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDate(email.timestamp)}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${!email.read ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                    {email.preview}
                  </p>
                  <div className="mt-1">
                    {getStatusBadge(email.status)}
                  </div>
                </div>
                
                <button
                  onClick={(e) => toggleStar(email.id, e)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {email.starred ? (
                    <IconStarFilled size={14} className="text-yellow-500" />
                  ) : (
                    <IconStar size={14} className="text-gray-300" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedEmail ? (
          <div className="flex flex-col h-full">
            {/* Chat Header */}
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
              
              <div className="flex items-center gap-2">
                {/* Current Stage Badge */}
                {getStatusBadge(selectedEmail.status)}
                
                <button
                  onClick={() => setUpdateStageModal({ open: true, email: selectedEmail })}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Update Stage
                </button>
                
                <button className="p-2 rounded-full hover:bg-gray-100 transition">
                  <IconDotsVertical size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Order/Status Info Bar */}
            {(selectedEmail.orderId || selectedEmail.trackingNumber || selectedEmail.postedLink || selectedEmail.rejectionReason) && (
              <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-6 py-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  {selectedEmail.orderId && (
                    <div className="flex items-center gap-2">
                      <IconShoppingCart size={16} className="text-gray-400" />
                      <span className="text-gray-600">Order:</span>
                      <span className="font-mono text-gray-900">{selectedEmail.orderId}</span>
                    </div>
                  )}
                  {selectedEmail.trackingNumber && (
                    <div className="flex items-center gap-2">
                      <IconTruck size={16} className="text-gray-400" />
                      <span className="text-gray-600">Tracking:</span>
                      <span className="font-mono text-gray-900">{selectedEmail.trackingNumber}</span>
                    </div>
                  )}
                  {selectedEmail.postedLink && (
                    <a href={selectedEmail.postedLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#1FAE5B] hover:underline">
                      <IconPhoto size={16} />
                      <span>View Post</span>
                    </a>
                  )}
                  {selectedEmail.rejectionReason && (
                    <div className="flex items-center gap-2">
                      <IconReject size={16} className="text-red-400" />
                      <span className="text-gray-600">Reason:</span>
                      <span className="text-red-600">{selectedEmail.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages Area */}
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

            {/* Reply Input */}
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
                    placeholder={`Reply to ${selectedEmail.name.split(' ')[0]}...`}
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
                <span className="text-xs text-gray-400">Press Enter to send</span>
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

      {/* Update Stage Modal */}
      {updateStageModal.open && updateStageModal.email && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setUpdateStageModal({ open: false, email: null })}
          />
          <div className="relative w-[400px] bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-xl text-gray-900">Update Pipeline Stage</h2>
              <button
                onClick={() => setUpdateStageModal({ open: false, email: null })}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <IconX size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Update stage for <span className="font-medium">{updateStageModal.email.name}</span>
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stageConfigs.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => updateEmailStage(updateStageModal.email!.id, stage.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                    updateStageModal.email?.status === stage.id
                      ? `${stage.bgColor} ${stage.color} ring-1 ring-current`
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {stage.icon}
                  <span className="flex-1 text-left text-sm">{stage.label}</span>
                  {updateStageModal.email?.status === stage.id && (
                    <IconCircleCheck size={16} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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