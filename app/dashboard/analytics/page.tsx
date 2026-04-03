"use client"

import { useState, useEffect, useRef } from "react"
import jsonData from "@/app/dashboard/data.json"
import { Info, Calendar, ChevronDown, ChevronRight, BarChart3, PieChart, TrendingUp, Users, DollarSign, Eye, ChevronUp, Filter, X, CalendarDays, Download, Check } from "lucide-react"

// Helper functions
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatMoney = (num: number) => {
  return num === 0 ? '$0' : '$' + num.toLocaleString()
}

const formatPercent = (value: number, total: number) => {
  if (total === 0) return '—'
  return Math.round((value / total) * 100) + '%'
}

// Metric Card Component
function MetricCard({ label, value, subLabel, isGreen = false }: { label: string; value: string | number; subLabel?: string; isGreen?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${isGreen ? 'text-green-600' : 'text-gray-900'}`}>{value}</div>
      {subLabel && <div className="text-xs text-gray-400 mt-1">{subLabel}</div>}
    </div>
  )
}

// Funnel Step Component
function FunnelStep({ name, value, total, color, dropOff }: { name: string; value: number; total: number; color: string; dropOff?: string }) {
  const percentage = total === 0 ? 0 : (value / total) * 100
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{name}</span>
        <div className="flex gap-2">
          <span className="text-gray-400">{formatPercent(value, total)}</span>
          <span className="font-semibold text-gray-900">{value}</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
      {dropOff && <div className="text-xs text-red-500 mt-1">{dropOff}</div>}
    </div>
  )
}

// Reason Row Component
function ReasonRow({ name, count, total, color }: { name: string; count: number; total: number; color: string }) {
  const maxCount = Math.max(count, 1)
  const percentage = total === 0 ? 0 : (count / total) * 100
  
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-gray-600 flex-1">{name}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold text-gray-900 min-w-[30px] text-right">{count}</span>
      <span className="text-xs text-gray-400 min-w-[40px] text-right">{formatPercent(count, total)}</span>
    </div>
  )
}

// Platform Row Component
function PlatformRow({ platform, posted, received, color, icon, iconBg }: { platform: string; posted: number; received: number; color: string; icon: string; iconBg: string }) {
  const rate = received === 0 ? 0 : (posted / received) * 100
  
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-900 flex-1">{platform}</span>
        <span className="text-xs text-gray-500">{posted} posted / {received} received</span>
        <span className="text-sm font-semibold text-green-600 min-w-[40px] text-right">{Math.round(rate)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// EMV Row Component
function EMVRow({ platform, views, emv, color, icon, iconBg, rate }: { platform: string; views: number; emv: number; color: string; icon: string; iconBg: string; rate: number }) {
  const maxEmv = Math.max(emv, 1)
  const percentage = (emv / maxEmv) * 100
  
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">{platform}</span>
          <span className="text-xs text-gray-500">${rate}/1k views</span>
        </div>
        <div className="text-xs text-gray-500 mb-1">{formatNumber(views)} views</div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
        </div>
      </div>
      <div className="text-sm font-semibold text-green-600 min-w-[70px] text-right">${emv.toLocaleString()}</div>
    </div>
  )
}

// Pipeline Item Component
function PipelineItem({ status, count, total, color, agingData }: { status: string; count: number; total: number; color: string; agingData?: any[] }) {
  const percentage = total === 0 ? 0 : (count / total) * 100
  
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm text-gray-600 flex-1">{status}</span>
        <span className="text-sm font-semibold text-gray-900">{count}</span>
        <span className="text-xs text-gray-400 min-w-[40px] text-right">{Math.round(percentage)}%</span>
      </div>
      {agingData && agingData.length > 0 && (
        <div className="ml-6 mt-1 space-y-1">
          {agingData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-md">
              <span className="text-xs text-gray-600 flex-1">{item.label}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
              </div>
              <span className="text-xs font-semibold text-gray-900 min-w-[30px] text-right">{item.count}</span>
              <span className="text-xs text-gray-400 min-w-[35px] text-right">{item.percent}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Tab Component
function Tab({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
        isActive 
          ? 'text-green-600 border-green-600' 
          : 'text-gray-500 border-transparent hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  )
}

// Inline Filter Panel Component
function InlineFilterPanel({ 
  isOpen, 
  filters, 
  onFilterChange,
  platformOptions,
  dateOptions,
  nicheOptions,
  locationOptions,
  onReset
}: { 
  isOpen: boolean; 
  filters: any; 
  onFilterChange: (key: string, value: string) => void;
  platformOptions: any[];
  dateOptions: any[];
  nicheOptions: any[];
  locationOptions: any[];
  onReset: () => void;
}) {
  if (!isOpen) return null

  return (
    <div className="flex items-center gap-3 animate-slideIn">
      <div className="h-8 w-px bg-gray-300" />
      <select
        value={filters.platform}
        onChange={(e) => onFilterChange('platform', e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {platformOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      
      <select
        value={filters.dateRange}
        onChange={(e) => onFilterChange('dateRange', e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {dateOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      
      <select
        value={filters.niche}
        onChange={(e) => onFilterChange('niche', e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {nicheOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      
      <select
        value={filters.location}
        onChange={(e) => onFilterChange('location', e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {locationOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      
      <button
        onClick={onReset}
        className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Reset
      </button>
    </div>
  )
}

export default function AnalyticsPage() {
  const [influencers, setInfluencers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [filters, setFilters] = useState({
    platform: "all",
    niche: "all",
    location: "all",
    dateRange: "all"
  })
  const [showFilters, setShowFilters] = useState(false)
  const filterContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (jsonData && Array.isArray(jsonData)) {
      setInfluencers(jsonData)
    }
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      platform: "all",
      niche: "all",
      location: "all",
      dateRange: "all"
    })
  }

  const hasActiveFilters = filters.platform !== "all" || filters.niche !== "all" || filters.location !== "all" || filters.dateRange !== "all"

  // Filter influencers
  const getFilteredInfluencers = () => {
    let filtered = [...influencers]
    
    if (filters.platform !== "all") {
      filtered = filtered.filter(i => {
        if (filters.platform === "Instagram") return i.instagramHandle?.startsWith('@')
        if (filters.platform === "TikTok") return i.instagramHandle?.includes('tiktok') || i.niche === 'TikTok'
        if (filters.platform === "YouTube") return i.platform === "YouTube"
        if (filters.platform === "Facebook") return i.platform === "Facebook"
        return true
      })
    }
    
    if (filters.niche !== "all") {
      filtered = filtered.filter(i => i.niche === filters.niche)
    }
    
    if (filters.location !== "all") {
      filtered = filtered.filter(i => i.location === filters.location)
    }
    
    // Date filtering logic
    if (filters.dateRange !== "all") {
      const now = new Date()
      filtered = filtered.filter(influencer => {
        const influencerDate = influencer.createdAt || influencer.date || influencer.addedDate
        if (!influencerDate) return true
        
        const itemDate = new Date(influencerDate)
        
        switch (filters.dateRange) {
          case "7": {
            const weekAgo = new Date(now.setDate(now.getDate() - 7))
            return itemDate >= weekAgo
          }
          case "30": {
            const monthAgo = new Date(now.setDate(now.getDate() - 30))
            return itemDate >= monthAgo
          }
          case "90": {
            const ninetyAgo = new Date(now.setDate(now.getDate() - 90))
            return itemDate >= ninetyAgo
          }
          case "month": {
            return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
          }
          default:
            return true
        }
      })
    }
    
    return filtered
  }
  
  const filteredInfluencers = getFilteredInfluencers()

  // Calculate metrics
  const calculateMetrics = () => {
    const dataToUse = filteredInfluencers
    
    const totalOutreach = dataToUse.length
    const responded = dataToUse.filter(i => i.pipelineStatus === "In Conversation" || i.pipelineStatus === "Onboarded").length
    const closed = dataToUse.filter(i => i.pipelineStatus === "Onboarded").length
    const notInterested = dataToUse.filter(i => i.pipelineStatus === "Rejected").length
    
    const responseRate = totalOutreach > 0 ? (responded / totalOutreach) * 100 : 0
    const closingRate = responded > 0 ? (closed / responded) * 100 : 0
    
    // Not interested breakdown
    const reasonsBreakdown = {
      "Paid only": dataToUse.filter(i => i.rejectionReason === "Paid only").length,
      "No creative freedom": dataToUse.filter(i => i.rejectionReason === "No creative freedom").length,
      "No usage rights": dataToUse.filter(i => i.rejectionReason === "No usage rights").length,
      "Brand conflict": dataToUse.filter(i => i.rejectionReason === "Brand conflict").length,
      "Values mismatch": dataToUse.filter(i => i.rejectionReason === "Values mismatch").length,
      "Fully booked": dataToUse.filter(i => i.rejectionReason === "Fully booked").length,
      "Others": dataToUse.filter(i => i.rejectionReason && !["Paid only", "No creative freedom", "No usage rights", "Brand conflict", "Values mismatch", "Fully booked"].includes(i.rejectionReason)).length
    }
    
    // Pipeline stats
    const noOrderYet = dataToUse.filter(i => i.pipelineStatus === "Prospect" || i.pipelineStatus === "Reached Out").length
    const inTransit = dataToUse.filter(i => i.pipelineStatus === "In Transit").length
    const deliveryProblem = dataToUse.filter(i => i.pipelineStatus === "Delivery Problem").length
    const noPost = dataToUse.filter(i => i.pipelineStatus === "Content Pending").length
    const posted = dataToUse.filter(i => i.pipelineStatus === "Posted").length
    
    const closedCollaborations = closed
    const receivedProduct = noPost + posted
    const postRate = receivedProduct > 0 ? (posted / receivedProduct) * 100 : 0
    
    // Platform breakdown
    const platformStats = {
      Instagram: { posted: 0, received: 0, views: 0, likes: 0, comments: 0 },
      TikTok: { posted: 0, received: 0, views: 0, likes: 0, comments: 0 },
      YouTube: { posted: 0, received: 0, views: 0, likes: 0, comments: 0 }
    }
    
    dataToUse.forEach(i => {
      const platform = i.platform || (i.instagramHandle?.startsWith('@') ? 'Instagram' : i.niche === 'TikTok' ? 'TikTok' : 'YouTube')
      if (platform === 'Instagram' || platform === 'TikTok' || platform === 'YouTube') {
        const p = platform as keyof typeof platformStats
        if (i.pipelineStatus === 'Posted') {
          platformStats[p].posted++
          platformStats[p].views += i.views || 0
          platformStats[p].likes += i.likes || 0
          platformStats[p].comments += i.comments || 0
        }
        if (i.pipelineStatus === 'Posted' || i.pipelineStatus === 'Content Pending') {
          platformStats[p].received++
        }
      }
    })
    
    // EMV calculation
    const emvRates = { Instagram: 10, TikTok: 6, YouTube: 18 }
    const totalViews = Object.values(platformStats).reduce((sum, p) => sum + p.views, 0)
    const totalLikes = Object.values(platformStats).reduce((sum, p) => sum + p.likes, 0)
    const totalComments = Object.values(platformStats).reduce((sum, p) => sum + p.comments, 0)
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0
    
    const platformEMV = {
      Instagram: (platformStats.Instagram.views / 1000) * emvRates.Instagram,
      TikTok: (platformStats.TikTok.views / 1000) * emvRates.TikTok,
      YouTube: (platformStats.YouTube.views / 1000) * emvRates.YouTube
    }
    const totalEMV = Object.values(platformEMV).reduce((sum, v) => sum + v, 0)
    
    // Conversion metrics
    const totalClicks = dataToUse.reduce((sum, i) => sum + (i.clicks || 0), 0)
    const totalSalesQty = dataToUse.reduce((sum, i) => sum + (i.salesQty || 0), 0)
    const totalRevenue = dataToUse.reduce((sum, i) => sum + (i.salesAmt || 0), 0)
    const conversionRate = totalClicks > 0 ? (totalSalesQty / totalClicks) * 100 : 0
    const aov = totalSalesQty > 0 ? totalRevenue / totalSalesQty : 0
    const avgSalePerInfluencer = posted > 0 ? totalRevenue / posted : 0
    const influencersWithSales = dataToUse.filter(i => (i.salesQty || 0) > 0).length
    const totalProductCost = dataToUse.reduce((sum, i) => sum + (i.prodCost || 0), 0)
    
    // UGC metrics
    const usageRights = dataToUse.filter(i => i.usageRights).length
    const contentSaved = dataToUse.filter(i => i.contentSaved).length
    const adCodesGiven = dataToUse.filter(i => i.adCode).length
    
    return {
      totalOutreach,
      responded,
      closed,
      notInterested,
      responseRate,
      closingRate,
      reasonsBreakdown,
      noOrderYet,
      inTransit,
      deliveryProblem,
      noPost,
      posted,
      closedCollaborations,
      receivedProduct,
      postRate,
      platformStats,
      platformEMV,
      totalViews,
      totalLikes,
      totalComments,
      engagementRate,
      totalEMV,
      totalClicks,
      totalSalesQty,
      totalRevenue,
      conversionRate,
      aov,
      avgSalePerInfluencer,
      influencersWithSales,
      totalProductCost,
      usageRights,
      contentSaved,
      adCodesGiven
    }
  }
  
  const metrics = calculateMetrics()
  
  // Platform icons and colors
  const platformConfig = {
    Instagram: { icon: "📸", bg: "#fce4ec", color: "#1FAE5B" },
    TikTok: { icon: "♪", bg: "#e8f5e9", color: "#222" },
    YouTube: { icon: "▶", bg: "#ffebee", color: "#E24B4A" }
  }
  
  const reasonColors = ["#E24B4A", "#F4B740", "#2C8EC4", "#888780", "#B4B2A9", "#1FAE5B", "#D3D1C7"]
  
  const agingData = metrics.noPost > 0 ? [
    { label: "≤ 7 days", count: Math.floor(metrics.noPost * 0.3), color: "#1FAE5B", percent: "30%" },
    { label: "8–14 days", count: Math.floor(metrics.noPost * 0.25), color: "#F4B740", percent: "25%" },
    { label: "15–30 days", count: Math.floor(metrics.noPost * 0.25), color: "#E24B4A", percent: "25%" },
    { label: "30+ days", count: Math.floor(metrics.noPost * 0.2), color: "#A32D2D", percent: "20%" }
  ] : []

  const exportCSV = () => {
    const headers = ['Platform', 'Niche', 'Location', 'Date Added', 'Pipeline Status', 'Views', 'Likes', 'Comments', 'Web Clicks', 'Sales (Units)', 'Revenue ($)', 'Usage Rights', 'Content Saved', 'Ad Code Given']
    const rows = filteredInfluencers.map(i => [
      i.platform || (i.instagramHandle?.startsWith('@') ? 'Instagram' : i.niche === 'TikTok' ? 'TikTok' : 'YouTube'),
      i.niche || 'General',
      i.location || 'PH',
      i.createdAt || i.date || i.addedDate || '',
      i.pipelineStatus || '',
      i.views || 0,
      i.likes || 0,
      i.comments || 0,
      i.clicks || 0,
      i.salesQty || 0,
      i.salesAmt || 0,
      i.usageRights ? 'Yes' : 'No',
      i.contentSaved ? 'Yes' : 'No',
      i.adCode ? 'Yes' : 'No'
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'instroom_analytics.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filter options
  const platformOptions = [
    { value: "all", label: "All platforms" },
    { value: "Instagram", label: "Instagram" },
    { value: "YouTube", label: "YouTube" },
    { value: "TikTok", label: "TikTok" }
  ]

  const dateOptions = [
    { value: "all", label: "All time" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "month", label: "This month" }
  ]

  const nicheOptions = [
    { value: "all", label: "All niches" },
    { value: "Beauty", label: "Beauty" },
    { value: "Fitness", label: "Fitness" },
    { value: "Lifestyle", label: "Lifestyle" },
    { value: "Food", label: "Food" },
    { value: "Tech", label: "Tech" }
  ]

  const locationOptions = [
    { value: "all", label: "All locations" },
    { value: "PH", label: "Philippines" },
    { value: "SG", label: "Singapore" },
    { value: "US", label: "United States" },
    { value: "AU", label: "Australia" }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-end gap-3">
          <div className="flex items-center gap-3" ref={filterContainerRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                hasActiveFilters 
                  ? 'bg-green-50 border-green-300 text-green-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>
            
            <InlineFilterPanel
              isOpen={showFilters}
              filters={filters}
              onFilterChange={handleFilterChange}
              platformOptions={platformOptions}
              dateOptions={dateOptions}
              nicheOptions={nicheOptions}
              locationOptions={locationOptions}
              onReset={resetFilters}
            />
          </div>
          
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          <Tab label="Campaign Summary" isActive={activeTab === 0} onClick={() => setActiveTab(0)} />
          <Tab label="Post Summary" isActive={activeTab === 1} onClick={() => setActiveTab(1)} />
          <Tab label="Post Reach & Impression Summary" isActive={activeTab === 2} onClick={() => setActiveTab(2)} />
          <Tab label="Conversion & UGC Summary" isActive={activeTab === 3} onClick={() => setActiveTab(3)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Tab 0: Campaign Summary */}
        {activeTab === 0 && (
          <div className="space-y-4">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <MetricCard 
                label="Total outreach" 
                value={metrics.totalOutreach} 
                subLabel="influencers contacted"
              />
              <MetricCard 
                label="Responded" 
                value={metrics.responded} 
                subLabel={`of ${metrics.totalOutreach} reached out`}
              />
              <MetricCard 
                label="Response rate" 
                value={`${Math.round(metrics.responseRate)}%`} 
                subLabel={`${metrics.responded} responded`}
                isGreen
              />
              <MetricCard 
                label="Closed collaborations" 
                value={metrics.closed} 
                subLabel="agreed to work"
              />
              <MetricCard 
                label="Closing rate" 
                value={`${Math.round(metrics.closingRate)}%`} 
                subLabel={`of ${metrics.responded} who responded`}
                isGreen
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Campaign Funnel */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Campaign funnel</h3>
                <FunnelStep name="Reached out" value={metrics.totalOutreach} total={metrics.totalOutreach} color="#1FAE5B" />
                <FunnelStep 
                  name="Responded" 
                  value={metrics.responded} 
                  total={metrics.totalOutreach} 
                  color="#1FAE5B"
                  dropOff={`▼ ${Math.round((1 - metrics.responded / metrics.totalOutreach) * 100)}% drop-off`}
                />
                <FunnelStep 
                  name="Closed collaboration" 
                  value={metrics.closed} 
                  total={metrics.responded} 
                  color="#5BC98A"
                  dropOff={`▼ ${Math.round((1 - metrics.closed / metrics.responded) * 100)}% closing drop-off`}
                />
                <FunnelStep name="Not interested" value={metrics.notInterested} total={metrics.responded} color="#E24B4A" />
              </div>

              {/* Reasons not interested */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Reasons not interested</h3>
                {Object.entries(metrics.reasonsBreakdown).map(([reason, count], idx) => (
                  <ReasonRow
                    key={reason}
                    name={reason}
                    count={count}
                    total={metrics.notInterested}
                    color={reasonColors[idx % reasonColors.length]}
                  />
                ))}
                <p className="text-xs text-gray-400 italic mt-3">
                  {metrics.notInterested > 0 
                    ? `${metrics.notInterested} not interested — % is of total not interested.`
                    : 'No rejections in current filter.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Post Summary */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard 
                label="Closed collaborations" 
                value={metrics.closedCollaborations} 
                subLabel="agreed to work"
              />
              <MetricCard 
                label="Received product" 
                value={metrics.receivedProduct} 
                subLabel={`posted (${metrics.posted}) + no post (${metrics.noPost})`}
              />
              <MetricCard 
                label="Posted" 
                value={metrics.posted} 
                subLabel={`of ${metrics.receivedProduct} who received`}
                isGreen
              />
              <MetricCard 
                label="Post rate" 
                value={`${Math.round(metrics.postRate)}%`} 
                subLabel="posted ÷ received product"
                isGreen
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Pipeline Status Breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline status breakdown</h3>
                <PipelineItem status="No Order Yet" count={metrics.noOrderYet} total={metrics.closedCollaborations} color="#B4B2A9" />
                <PipelineItem status="In Transit" count={metrics.inTransit} total={metrics.closedCollaborations} color="#2C8EC4" />
                <PipelineItem status="Delivery Problem" count={metrics.deliveryProblem} total={metrics.closedCollaborations} color="#E24B4A" />
                <PipelineItem 
                  status="No Post" 
                  count={metrics.noPost} 
                  total={metrics.closedCollaborations} 
                  color="#F4B740"
                  agingData={agingData}
                />
                <PipelineItem status="Posted" count={metrics.posted} total={metrics.closedCollaborations} color="#1FAE5B" />
                <p className="text-xs text-gray-400 italic mt-3">
                  % is of closed collaborations. Post rate uses received (Posted + No Post) as base.
                </p>
              </div>

              {/* Post Rate by Platform */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Post rate by platform
                  <span className="text-xs font-normal text-gray-500 ml-2">Posted ÷ Received</span>
                </h3>
                {Object.entries(metrics.platformStats).map(([platform, stats]) => (
                  <PlatformRow
                    key={platform}
                    platform={platform}
                    posted={stats.posted}
                    received={stats.received}
                    color={platformConfig[platform as keyof typeof platformConfig].color}
                    icon={platformConfig[platform as keyof typeof platformConfig].icon}
                    iconBg={platformConfig[platform as keyof typeof platformConfig].bg}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Post Reach & Impression Summary */}
        {activeTab === 2 && (
          <div className="space-y-4">
            {/* Reach Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{formatNumber(metrics.totalViews)}</div>
                <div className="text-xs text-gray-500 mt-1">Total views / impressions</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{formatNumber(metrics.totalLikes)}</div>
                <div className="text-xs text-gray-500 mt-1">Total likes</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{formatNumber(metrics.totalComments)}</div>
                <div className="text-xs text-gray-500 mt-1">Total comments</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{formatMoney(Math.round(metrics.totalEMV))}</div>
                <div className="text-xs text-gray-500 mt-1">Total EMV</div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* EMV by Platform */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  EMV by platform
                  <span className="text-xs font-normal text-gray-500 ml-2">(Estimated Media Value)</span>
                </h3>
                {Object.entries(metrics.platformEMV).map(([platform, emv]) => (
                  <EMVRow
                    key={platform}
                    platform={platform}
                    views={metrics.platformStats[platform as keyof typeof metrics.platformStats].views}
                    emv={Math.round(emv)}
                    color={platformConfig[platform as keyof typeof platformConfig].color}
                    icon={platformConfig[platform as keyof typeof platformConfig].icon}
                    iconBg={platformConfig[platform as keyof typeof platformConfig].bg}
                    rate={platform === 'Instagram' ? 10 : platform === 'TikTok' ? 6 : 18}
                  />
                ))}
                <p className="text-xs text-gray-400 italic mt-3">
                  Rates: Instagram $10 · TikTok $6 · YouTube $18 per 1,000 views
                </p>
              </div>

              {/* Engagement Breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Engagement breakdown</h3>
                <div className="grid grid-cols-1 gap-3">
                  <MetricCard 
                    label="Engagement rate" 
                    value={`${metrics.engagementRate.toFixed(2)}%`} 
                    subLabel="(likes + comments) ÷ views"
                    isGreen
                  />
                  <MetricCard 
                    label="Avg views / influencer" 
                    value={metrics.posted > 0 ? formatNumber(Math.round(metrics.totalViews / metrics.posted)) : '—'} 
                    subLabel={`${metrics.posted} posted`}
                  />
                  <MetricCard 
                    label="Total EMV" 
                    value={formatMoney(Math.round(metrics.totalEMV))} 
                    subLabel="all platforms combined"
                    isGreen
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Conversion & UGC Summary */}
        {activeTab === 3 && (
          <div className="space-y-4">
            {/* Conversion Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{metrics.totalClicks.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Web clicks</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{metrics.totalSalesQty}</div>
                <div className="text-xs text-gray-500 mt-1">Total sales (units)</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{formatMoney(metrics.totalRevenue)}</div>
                <div className="text-xs text-gray-500 mt-1">Total revenue</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{metrics.conversionRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 mt-1">Conversion rate</div>
              </div>
            </div>

            {/* Additional Conversion Metrics */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Additional conversion metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard 
                  label="Avg order value (AOV)" 
                  value={formatMoney(Math.round(metrics.aov))} 
                  subLabel="revenue ÷ units sold"
                  isGreen
                />
                <MetricCard 
                  label="Avg sale per influencer" 
                  value={formatMoney(Math.round(metrics.avgSalePerInfluencer))} 
                  subLabel="revenue ÷ all who posted"
                  isGreen
                />
                <MetricCard 
                  label="Influencers with sales" 
                  value={`${metrics.influencersWithSales} (${formatPercent(metrics.influencersWithSales, metrics.posted)})`} 
                  subLabel="of those who posted"
                  isGreen
                />
                <MetricCard 
                  label="Product cost (total)" 
                  value={formatMoney(metrics.totalProductCost)} 
                  subLabel="cost of products sent"
                />
              </div>
            </div>

            {/* UGC Overview */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">UGC overview</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-green-600">{metrics.usageRights}</div>
                  <div className="text-xs text-gray-500 mt-1">Usage rights granted</div>
                  <div className="text-xs text-gray-400 mt-1">{formatPercent(metrics.usageRights, metrics.posted)} of those who posted</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-green-600">{metrics.contentSaved}</div>
                  <div className="text-xs text-gray-500 mt-1">Content saved</div>
                  <div className="text-xs text-gray-400 mt-1">{formatPercent(metrics.contentSaved, metrics.usageRights)} of usage rights granted</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-green-600">{metrics.adCodesGiven}</div>
                  <div className="text-xs text-gray-500 mt-1">Ad codes given</div>
                  <div className="text-xs text-gray-400 mt-1">{formatPercent(metrics.adCodesGiven, metrics.posted)} of those who posted</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 italic mt-2">
                Content saved ({metrics.contentSaved}) is always ≤ usage rights granted ({metrics.usageRights}). 
                You can only save content you have the rights to use.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="text-xs text-gray-400 font-normal text-right">
          Showing {metrics.totalOutreach} influencer{metrics.totalOutreach !== 1 ? 's' : ''}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}