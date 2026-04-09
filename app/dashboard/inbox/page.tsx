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
  IconUserPlus,
  IconMessage,
  IconUserCheck,
  IconShoppingCart,
  IconTruck,
  IconPackage,
  IconPhoto,
  IconCircleCheck,
  IconX as IconReject,
  IconChevronUp,
  IconChevronDown,
  IconPhone,
  IconVideo,
  IconFlag,
  IconArchive,
  IconTrash,
  IconBell,
  IconUser,
  IconClock,
  IconCheck,
  IconMailForward,
  IconLayoutSidebar,
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
  activeBgColor: string
  hoverBgColor: string
  borderColor: string
  arrowColor: string
}

const stageConfigs: StageConfig[] = [
  { id: "PROSPECT", label: "Prospects", icon: <IconUserPlus size={16} />, color: "text-gray-700", bgColor: "bg-gray-100", activeBgColor: "bg-gray-600", hoverBgColor: "hover:bg-gray-500", borderColor: "border-gray-300", arrowColor: "#f3f4f6" },
  { id: "REACHED_OUT", label: "Reached Out", icon: <IconMessage size={16} />, color: "text-blue-700", bgColor: "bg-blue-100", activeBgColor: "bg-blue-600", hoverBgColor: "hover:bg-blue-500", borderColor: "border-blue-300", arrowColor: "#dbeafe" },
  { id: "IN_CONVERSATION", label: "In Conversation", icon: <IconMessageCircle size={16} />, color: "text-purple-700", bgColor: "bg-purple-100", activeBgColor: "bg-purple-600", hoverBgColor: "hover:bg-purple-500", borderColor: "border-purple-300", arrowColor: "#f3e8ff" },
  { id: "ONBOARDED", label: "Onboarded", icon: <IconUserCheck size={16} />, color: "text-indigo-700", bgColor: "bg-indigo-100", activeBgColor: "bg-indigo-600", hoverBgColor: "hover:bg-indigo-500", borderColor: "border-indigo-300", arrowColor: "#e0e7ff" },
  { id: "FOR_ORDER_CREATION", label: "For Order", icon: <IconShoppingCart size={16} />, color: "text-orange-700", bgColor: "bg-orange-100", activeBgColor: "bg-orange-600", hoverBgColor: "hover:bg-orange-500", borderColor: "border-orange-300", arrowColor: "#ffedd5" },
  { id: "IN_TRANSIT", label: "In-Transit", icon: <IconTruck size={16} />, color: "text-yellow-700", bgColor: "bg-yellow-100", activeBgColor: "bg-yellow-600", hoverBgColor: "hover:bg-yellow-500", borderColor: "border-yellow-300", arrowColor: "#fef9c3" },
  { id: "DELIVERED", label: "Delivered", icon: <IconPackage size={16} />, color: "text-teal-700", bgColor: "bg-teal-100", activeBgColor: "bg-teal-600", hoverBgColor: "hover:bg-teal-500", borderColor: "border-teal-300", arrowColor: "#ccfbf1" },
  { id: "POSTED", label: "Posted", icon: <IconPhoto size={16} />, color: "text-pink-700", bgColor: "bg-pink-100", activeBgColor: "bg-pink-600", hoverBgColor: "hover:bg-pink-500", borderColor: "border-pink-300", arrowColor: "#fce7f3" },
  { id: "COMPLETED", label: "Completed", icon: <IconCircleCheck size={16} />, color: "text-green-700", bgColor: "bg-green-100", activeBgColor: "bg-green-600", hoverBgColor: "hover:bg-green-500", borderColor: "border-green-300", arrowColor: "#dcfce7" },
  { id: "REJECTED", label: "Rejected", icon: <IconReject size={16} />, color: "text-red-700", bgColor: "bg-red-100", activeBgColor: "bg-red-600", hoverBgColor: "hover:bg-red-500", borderColor: "border-red-300", arrowColor: "#fee2e2" },
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
    const stageIndex = index % stages.length
    const status = stages[stageIndex]
    
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    
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
  const [updateStageModal, setUpdateStageModal] = useState<{ open: boolean; email: Email | null }>({ open: false, email: null })
  const [showPipelineBar, setShowPipelineBar] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (jsonData && Array.isArray(jsonData)) {
      setEmails(generateEmails(jsonData))
    }
    
    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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

  // Get current stage config for display
  const currentStageConfig = selectedStage !== "ALL" ? stageConfigs.find(s => s.id === selectedStage) : null

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* RESPONSIVE COLLAPSIBLE PIPELINE BAR */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm relative">
        {showPipelineBar ? (
          <>
            {/* Pipeline Bar Header for Mobile */}
            <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Pipeline Stages</span>
              <button
                onClick={() => setShowPipelineBar(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IconChevronUp size={18} className="text-gray-500" />
              </button>
            </div>
            
            {/* Pipeline Stages - Horizontal Scroll on Mobile */}
            <div className="overflow-x-auto overflow-y-hidden">
              <div className="flex min-w-max md:min-w-0">
                {/* ALL Inbox Option */}
                <button
                  onClick={() => setSelectedStage("ALL")}
                  className={`relative flex-1 min-w-[80px] md:min-w-[100px] px-3 md:px-4 py-2 md:py-3 text-center transition-all duration-200 ${
                    selectedStage === "ALL"
                      ? "bg-gray-700 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <div className="text-lg md:text-2xl font-bold">{getStageCount("ALL")}</div>
                  <div className="text-[10px] md:text-xs font-medium flex items-center justify-center gap-1 mt-0.5 md:mt-1">
                    <IconInbox size={12} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">All</span>
                  </div>
                </button>

                {/* Stage Buttons with Arrows */}
                {stageConfigs.map((stage, index) => {
                  const isActive = selectedStage === stage.id
                  const isLast = index === stageConfigs.length - 1
                  
                  return (
                    <div key={stage.id} className="relative flex-1 min-w-[80px] md:min-w-[100px]">
                      <button
                        onClick={() => setSelectedStage(stage.id)}
                        className={`w-full h-full px-3 md:px-4 py-2 md:py-3 text-center transition-all duration-200 ${
                          isActive
                            ? `${stage.activeBgColor} text-white shadow-md`
                            : `${stage.bgColor} ${stage.color} hover:${stage.hoverBgColor} hover:text-white`
                        }`}
                      >
                        <div className="text-lg md:text-2xl font-bold">{getStageCount(stage.id)}</div>
                        <div className="text-[10px] md:text-xs font-medium flex items-center justify-center gap-1 mt-0.5 md:mt-1">
                          {stage.icon}
                          <span className="hidden sm:inline">{stage.label}</span>
                        </div>
                      </button>
                      
                      {/* Arrow connector - Hide on mobile */}
                      {!isLast && !isMobile && (
                        <div 
                          className="absolute top-0 right-0 w-0 h-0 border-t-[40px] md:border-t-[44px] border-b-[40px] md:border-b-[44px] border-l-[12px] md:border-l-[16px] border-t-transparent border-b-transparent"
                          style={{ 
                            borderLeftColor: isActive 
                              ? stage.activeBgColor === 'bg-gray-600' ? '#4b5563' :
                                stage.activeBgColor === 'bg-blue-600' ? '#2563eb' :
                                stage.activeBgColor === 'bg-purple-600' ? '#9333ea' :
                                stage.activeBgColor === 'bg-indigo-600' ? '#4f46e5' :
                                stage.activeBgColor === 'bg-orange-600' ? '#ea580c' :
                                stage.activeBgColor === 'bg-yellow-600' ? '#ca8a04' :
                                stage.activeBgColor === 'bg-teal-600' ? '#0d9488' :
                                stage.activeBgColor === 'bg-pink-600' ? '#db2777' :
                                stage.activeBgColor === 'bg-green-600' ? '#16a34a' :
                                stage.activeBgColor === 'bg-red-600' ? '#dc2626' : '#6b7280'
                              : stage.arrowColor,
                            right: '-12px',
                            zIndex: 10
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Desktop Collapse Button */}
            <button
              onClick={() => setShowPipelineBar(false)}
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 transition-all shadow-md z-20"
            >
              <IconChevronUp size={14} className="text-gray-500" />
            </button>
          </>
        ) : (
          /* Collapsed View */
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPipelineBar(true)}
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                <IconLayoutSidebar size={14} />
                <span>Show Pipeline</span>
                <IconChevronDown size={12} />
              </button>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <IconInbox size={12} />
                <span>{getStageCount("ALL")} total</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="hidden sm:inline">Current:</span>
              <span className="font-medium text-gray-700">
                {selectedStage === "ALL" ? "All Messages" : currentStageConfig?.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA - Two columns: Contact List + Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* CONTACT LIST PANEL */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white flex-shrink-0 shadow-sm">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {selectedStage === "ALL" ? "All Messages" : currentStageConfig?.label}
              </h1>
              <button
                onClick={() => setOpenCompose(true)}
                className="p-2 rounded-lg bg-[#1FAE5B] text-white hover:bg-[#0F6B3E] transition-all duration-200 shadow-sm"
                title="New Message"
              >
                <IconMail size={18} />
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
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1FAE5B]/20 focus:border-[#1FAE5B] transition-all"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <IconInbox size={48} stroke={1.5} />
                <p className="mt-3 text-sm font-medium">No conversations</p>
                <p className="text-xs mt-1">No messages in this stage</p>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email)
                    markAsRead(email.id)
                  }}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150 ${
                    selectedEmail?.id === email.id ? "bg-gray-100 border-l-4 border-l-[#1FAE5B]" : "hover:bg-gray-50"
                  } ${!email.read ? "bg-blue-50/40" : ""}`}
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
                    <p className={`text-xs truncate mt-0.5 ${!email.read ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                      {email.preview}
                    </p>
                    <div className="mt-1.5">
                      {getStatusBadge(email.status)}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => toggleStar(email.id, e)}
                    className="flex-shrink-0 mt-0.5 transition-opacity hover:opacity-80"
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
              {/* REDESIGNED CHAT HEADER ACTION BAR */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200">
                {/* Main Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition"
                    >
                      <IconArrowLeft size={20} />
                    </button>
                    <img
                      src={selectedEmail.avatar}
                      alt={selectedEmail.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-gray-900 text-sm md:text-base">{selectedEmail.name}</h2>
                        <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                        <span className="text-xs text-gray-500 hidden sm:inline">{selectedEmail.handle}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {getStatusBadge(selectedEmail.status)}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <IconClock size={12} />
                          <span className="hidden sm:inline">Last active</span> {formatDate(selectedEmail.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Call">
                      <IconPhone size={18} className="text-gray-600" />
                    </button>
                    <button className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Video call">
                      <IconVideo size={18} className="text-gray-600" />
                    </button>
                    <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />
                    <button className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Archive">
                      <IconArchive size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Move to trash">
                      <IconTrash size={18} className="text-gray-600" />
                    </button>
                    <button className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Mark as unread">
                      <IconMail size={18} className="text-gray-600" />
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
                    <button 
                      onClick={() => setShowActions(!showActions)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                      title="More actions"
                    >
                      <IconDotsVertical size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Quick Action Bar - Responsive */}
                <div className="px-4 md:px-6 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => setUpdateStageModal({ open: true, email: selectedEmail })}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <IconUserCheck size={14} />
                    <span className="hidden sm:inline">Update Stage</span>
                  </button>
                  <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <IconBell size={14} />
                    <span className="hidden sm:inline">Reminder</span>
                  </button>
                  <button className="hidden sm:flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <IconFlag size={14} />
                    Label
                  </button>
                  <button className="hidden md:flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <IconMailForward size={14} />
                    Forward
                  </button>
                </div>

                {/* More Actions Dropdown */}
                {showActions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                    <div className="absolute right-4 md:right-6 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                        <IconUser size={14} />
                        View Profile
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                        <IconStar size={14} />
                        Star Conversation
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                        <IconCheck size={14} />
                        Mark as Read
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <IconTrash size={14} />
                        Delete Conversation
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Order/Status Info Bar - Responsive */}
              {(selectedEmail.orderId || selectedEmail.trackingNumber || selectedEmail.postedLink || selectedEmail.rejectionReason) && (
                <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 md:px-6 py-3">
                  <div className="flex flex-wrap gap-2 md:gap-4 text-sm">
                    {selectedEmail.orderId && (
                      <div className="flex items-center gap-2 bg-white px-2 md:px-3 py-1 rounded-full shadow-sm">
                        <IconShoppingCart size={14} className="text-gray-400" />
                        <span className="text-gray-600 text-xs hidden sm:inline">Order:</span>
                        <span className="font-mono text-gray-900 text-xs font-medium">{selectedEmail.orderId}</span>
                      </div>
                    )}
                    {selectedEmail.trackingNumber && (
                      <div className="flex items-center gap-2 bg-white px-2 md:px-3 py-1 rounded-full shadow-sm">
                        <IconTruck size={14} className="text-gray-400" />
                        <span className="text-gray-600 text-xs hidden sm:inline">Tracking:</span>
                        <span className="font-mono text-gray-900 text-xs font-medium">{selectedEmail.trackingNumber}</span>
                      </div>
                    )}
                    {selectedEmail.postedLink && (
                      <a href={selectedEmail.postedLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white px-2 md:px-3 py-1 rounded-full shadow-sm text-[#1FAE5B] hover:bg-green-50 transition text-xs">
                        <IconPhoto size={14} />
                        <span>View Post</span>
                      </a>
                    )}
                    {selectedEmail.rejectionReason && (
                      <div className="flex items-center gap-2 bg-red-50 px-2 md:px-3 py-1 rounded-full shadow-sm">
                        <IconReject size={14} className="text-red-400" />
                        <span className="text-gray-600 text-xs hidden sm:inline">Reason:</span>
                        <span className="text-red-600 text-xs font-medium">{selectedEmail.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                  {/* Original Message */}
                  <div className="flex gap-3 mb-6 animate-fadeIn">
                    <img
                      src={selectedEmail.avatar}
                      alt={selectedEmail.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{selectedEmail.name}</span>
                        <span className="text-xs text-gray-400">{formatTime(selectedEmail.timestamp)}</span>
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-none px-4 md:px-5 py-3 shadow-sm border border-gray-100">
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
                      className={`flex gap-3 mb-6 animate-fadeIn ${reply.isUser ? 'flex-row-reverse' : ''}`}
                    >
                      {!reply.isUser && (
                        <img
                          src={selectedEmail.avatar}
                          alt={selectedEmail.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      {reply.isUser && (
                        <div className="w-8 h-8 rounded-full bg-[#1FAE5B] flex items-center justify-center text-white text-xs font-medium flex-shrink-0 shadow-sm">
                          ME
                        </div>
                      )}
                      <div className={`flex-1 max-w-[85%] md:max-w-[70%] ${reply.isUser ? 'items-end' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 flex-wrap ${reply.isUser ? 'justify-end' : ''}`}>
                          <span className="text-sm font-medium text-gray-900">{reply.sender}</span>
                          <span className="text-xs text-gray-400">{formatTime(reply.timestamp)}</span>
                        </div>
                        <div className={`rounded-2xl px-4 md:px-5 py-3 shadow-sm ${
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
              <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3 md:p-4 shadow-lg">
                <div className="flex gap-3 items-end">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#1FAE5B] flex items-center justify-center text-white text-xs font-medium shadow-sm">
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
                      className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#1FAE5B]/20 focus:border-[#1FAE5B] resize-none text-sm bg-gray-50"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim()}
                      className="absolute right-2 bottom-2 p-1.5 rounded-full bg-[#1FAE5B] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0F6B3E] transition-all duration-200"
                    >
                      <IconSend size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-gray-400 hidden sm:inline">Press Enter to send • Shift+Enter for new line</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-4">
              <div className="bg-white rounded-full p-6 mb-4 shadow-md">
                <IconMessageCircle size={56} stroke={1.5} className="text-gray-300" />
              </div>
              <p className="text-base font-medium text-gray-500">Select a conversation</p>
              <p className="text-sm mt-1 text-gray-400 text-center">Choose from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Update Stage Modal */}
      {updateStageModal.open && updateStageModal.email && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setUpdateStageModal({ open: false, email: null })}
          />
          <div className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-6 animate-scaleIn">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-xl text-gray-900">Update Pipeline Stage</h2>
              <button
                onClick={() => setUpdateStageModal({ open: false, email: null })}
                className="p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <IconX size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Update stage for <span className="font-medium text-gray-900">{updateStageModal.email.name}</span>
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stageConfigs.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => updateEmailStage(updateStageModal.email!.id, stage.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    updateStageModal.email?.status === stage.id
                      ? `${stage.bgColor} ${stage.color} ring-2 ring-current`
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className={`p-1 rounded ${stage.bgColor} ${stage.color}`}>
                    {stage.icon}
                  </div>
                  <span className="flex-1 text-left text-sm font-medium">{stage.label}</span>
                  {updateStageModal.email?.status === stage.id && (
                    <IconCircleCheck size={18} className="text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {openCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenCompose(false)}
          />
          <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl p-6 animate-scaleIn">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-xl text-gray-900">New Message</h2>
              <button
                onClick={() => setOpenCompose(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <IconX size={20} />
              </button>
            </div>

            <input
              placeholder="To"
              className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#1FAE5B] transition"
            />
            <input
              placeholder="Subject"
              className="w-full border-b border-gray-200 py-2 mt-3 outline-none focus:border-[#1FAE5B] transition"
            />
            <textarea
              placeholder="Message"
              rows={5}
              className="w-full mt-4 outline-none resize-none p-3 border border-gray-200 rounded-xl focus:border-[#1FAE5B] transition"
            />
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpenCompose(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button className="bg-[#1FAE5B] text-white px-4 py-2 rounded-xl hover:bg-[#0F6B3E] transition-all duration-200 flex items-center gap-2 shadow-sm">
                <IconSend size={16} />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}