"use client"

import { useState, useEffect, useRef } from "react"
import { Filter, Download } from "lucide-react"

// ============================================================
// MOCK DATA GENERATOR (replace with actual data.json import)
// ============================================================
const generateMockData = () => {
  const platforms = ["Instagram", "YouTube", "TikTok"]
  const niches = ["Beauty", "Fitness", "Lifestyle", "Food", "Tech"]
  const locations = ["PH", "SG", "US", "AU"]
  
  // Expanded rejection reasons with hard/soft classification
  const rejectionReasons = [
    { r: 'Fee too low / unpaid', bucket: 'hard' },
    { r: 'Brief too scripted', bucket: 'hard' },
    { r: "Won't allow content reuse", bucket: 'hard' },
    { r: 'Working with a competitor', bucket: 'hard' },
    { r: "Product doesn't fit their brand", bucket: 'hard' },
    { r: 'Wrong audience fit', bucket: 'hard' },
    { r: 'Seen bad reviews about us', bucket: 'hard' },
    { r: 'Fully booked', bucket: 'soft' },
    { r: "Temporarily unavailable / can't shoot", bucket: 'soft' },
    { r: "Can't ship to their location", bucket: 'soft' },
    { r: 'Ghosted / no longer active', bucket: 'soft' },
    { r: 'Rate / deadline too tight', bucket: 'soft' },
    { r: 'Others', bucket: 'hard' },
  ]
  
  const pipelineStatuses = [
    "Prospect", "Reached Out", "In Conversation", "Onboarded", 
    "In Transit", "Delivery Problem", "Content Pending", "Posted", "Rejected"
  ]
  
  return Array.from({ length: 50 }, (_, i) => {
    const platform = platforms[Math.floor(Math.random() * platforms.length)]
    const pipelineStatus = pipelineStatuses[Math.floor(Math.random() * pipelineStatuses.length)]
    const isRejected = pipelineStatus === "Rejected"
    const isPosted = pipelineStatus === "Posted"
    const isContentPending = pipelineStatus === "Content Pending"
    const hasSales = isPosted && Math.random() > 0.4
    const rejection = isRejected ? rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)] : null
    
    return {
      id: i,
      platform: platform,
      instagramHandle: platform === "Instagram" ? `@influencer_${i}` : null,
      niche: niches[Math.floor(Math.random() * niches.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      pipelineStatus: pipelineStatus,
      rejectionReason: rejection?.r || null,
      rejectionBucket: rejection?.bucket || null,
      views: isPosted ? Math.floor(Math.random() * 100000) : 0,
      likes: isPosted ? Math.floor(Math.random() * 8000) : 0,
      comments: isPosted ? Math.floor(Math.random() * 800) : 0,
      clicks: isPosted ? Math.floor(Math.random() * 1000) : 0,
      salesQty: hasSales ? Math.floor(Math.random() * 40) : 0,
      salesAmt: hasSales ? Math.floor(Math.random() * 3000) : 0,
      prodCost: (pipelineStatus === "Onboarded" || isPosted || isContentPending) ? Math.floor(Math.random() * 1500) + 200 : 0,
      usageRights: isPosted && Math.random() > 0.45,
      contentSaved: isPosted && Math.random() > 0.6,
      adCode: isPosted && Math.random() > 0.7,
      deliveredDaysAgo: (pipelineStatus === "Content Pending" && Math.random() > 0.5) ? Math.floor(Math.random() * 45) + 1 : null,
    }
  })
}

const jsonData = generateMockData()
// ============================================================

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

// Tooltip component for rejection reasons
const ReasonTooltip = ({ reason }: { reason: string }) => {
  const tips: Record<string, string> = {
    'Fee too low / unpaid': 'Creator treats this as a business — your offer didn\'t meet their rate card or they require payment, not just gifting. Consider increasing your budget or adding a guaranteed fee on top of commission.',
    'Brief too scripted': 'Your creative brief left no room for the creator\'s own voice. Over-scripted content gets 30–40% lower engagement because followers can tell it\'s not authentic. Try giving a key message + full creative freedom.',
    "Won't allow content reuse": 'Creator won\'t let you repurpose their content for paid ads, emails, or other channels without extra compensation. Increasingly common as creators treat their content as a commercial asset. Build usage rights into your initial offer.',
    'Working with a competitor': 'Creator has an active exclusive deal with a direct competitor, or the brand category conflicts with an existing partner. Check their recent posts before outreach to spot competitor collabs.',
    "Product doesn't fit their brand": 'The product feels out of place in their content — their audience would notice the mismatch. Audit creator\'s feed before outreach. A beauty creator posting tech gadgets loses audience trust fast.',
    'Wrong audience fit': 'The creator\'s followers don\'t match your target customer — even if the niche looks right on paper. Ask for audience demographic data (age, gender, location) before outreach, not after.',
    'Seen bad reviews about us': 'Creator came across negative reviews, complaints, or callouts about your brand or product and doesn\'t want reputational risk. This is a signal worth escalating — if multiple creators cite this, it\'s a brand health issue, not a campaign issue.',
    'Fully booked': 'Content calendar is at capacity. Especially common in Q4 (Oct–Dec), Valentine\'s, and Mother\'s Day windows. Reach out 6–8 weeks earlier next time. This creator is worth re-approaching — they didn\'t say no to you, just to your timing.',
    "Temporarily unavailable / can't shoot": 'Creator is travelling, dealing with personal circumstances, or simply doesn\'t have time to shoot right now. Not a rejection — flag for follow-up next campaign. They\'re still warm.',
    "Can't ship to their location": 'Your product can\'t be delivered to where they are — wrong country, remote location, or they\'re travelling. Consider digital-only alternatives (commission link, e-gift) or add their location to your shipping coverage.',
    'Ghosted / no longer active': 'Stopped responding after initial contact — could be inbox overwhelm, platform inactivity, or they\'ve moved on from brand deals. Try a different contact channel (DM vs email) before writing them off.',
    'Rate / deadline too tight': 'Either the pay was below their rate, the posting deadline was too rushed, or both. Campaigns with less than 2 weeks\' notice see significantly higher decline rates. Build in more lead time.',
    'Others': 'Reason wasn\'t captured or doesn\'t fit any category. Try to get specifics before logging this — even a short note helps spot patterns over time.',
  }
  
  return (
    <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-3 w-64 shadow-lg">
      {tips[reason] || 'No additional context available for this rejection reason.'}
    </div>
  )
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

// Enhanced Reason Row with Tooltip
function ReasonRow({ name, count, total, color, bucket }: { name: string; count: number; total: number; color: string; bucket: string }) {
  const maxCount = Math.max(count, 1)
  
  return (
    <div className="group relative flex items-center gap-2 mb-2">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-gray-600 flex-1 cursor-help">
        {name}
        <span className="text-gray-400 ml-1">ⓘ</span>
      </span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold text-gray-900 min-w-[30px] text-right">{count}</span>
      <span className="text-xs text-gray-400 min-w-[40px] text-right">{formatPercent(count, total)}</span>
      <span className={`text-[9px] px-1.5 py-0.5 rounded ${bucket === 'hard' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
        {bucket === 'hard' ? 'Hard' : 'Soft'}
      </span>
      <ReasonTooltip reason={name} />
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

// Donut Chart Component
function DonutChart({ segments, centerLabel, centerSub, size = 130 }: { segments: { label: string; value: number; color: string }[]; centerLabel: string | number; centerSub: string; size?: number }) {
  const total = segments.reduce((a, s) => a + s.value, 0)
  if (total === 0) {
    return <div className="flex items-center justify-center h-[130px] text-gray-400 text-sm">No data</div>
  }
  
  const r = 44, cx = size / 2, cy = size / 2, stroke = 18
  let paths = '', offset = 0
  const circ = 2 * Math.PI * r
  
  segments.forEach(s => {
    if (s.value === 0) return
    const frac = s.value / total
    const dash = frac * circ
    const gap = circ - dash
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" stroke-dashoffset="${(-offset * circ).toFixed(2)}" stroke-linecap="butt" transform="rotate(-90 ${cx} ${cy})"/>`
    offset += frac
  })
  
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0ee" strokeWidth={stroke} />
        <g dangerouslySetInnerHTML={{ __html: paths }} />
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1E1E1E" fontFamily="Inter, sans-serif">{centerLabel}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#888" fontFamily="Inter, sans-serif">{centerSub}</text>
      </svg>
      <div className="flex flex-col gap-1">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-gray-600 min-w-[100px]">{s.label}</span>
            <span className="text-xs font-semibold text-gray-900">{s.value}</span>
            <span className="text-xs text-gray-400">{formatPercent(s.value, total)}</span>
          </div>
        ))}
      </div>
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

  const getFilteredInfluencers = () => {
    let filtered = [...influencers]
    
    if (filters.platform !== "all") {
      filtered = filtered.filter(i => i.platform === filters.platform)
    }
    if (filters.niche !== "all") {
      filtered = filtered.filter(i => i.niche === filters.niche)
    }
    if (filters.location !== "all") {
      filtered = filtered.filter(i => i.location === filters.location)
    }
    if (filters.dateRange !== "all") {
      const now = new Date()
      filtered = filtered.filter(influencer => {
        const influencerDate = influencer.createdAt
        if (!influencerDate) return true
        const itemDate = new Date(influencerDate)
        switch (filters.dateRange) {
          case "7": { const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7); return itemDate >= weekAgo }
          case "30": { const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30); return itemDate >= monthAgo }
          case "90": { const ninetyAgo = new Date(now); ninetyAgo.setDate(now.getDate() - 90); return itemDate >= ninetyAgo }
          case "month": return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
          default: return true
        }
      })
    }
    return filtered
  }
  
  const filteredInfluencers = getFilteredInfluencers()

  const calculateMetrics = () => {
    const dataToUse = filteredInfluencers
    
    const totalOutreach = dataToUse.length
    const responded = dataToUse.filter(i => i.pipelineStatus === "In Conversation" || i.pipelineStatus === "Onboarded").length
    const closed = dataToUse.filter(i => i.pipelineStatus === "Onboarded").length
    const notInterested = dataToUse.filter(i => i.pipelineStatus === "Rejected").length
    const responseRate = totalOutreach > 0 ? (responded / totalOutreach) * 100 : 0
    const closingRate = responded > 0 ? (closed / responded) * 100 : 0
    
    // Hard/Soft pass breakdown
    const hardPassReasons = [
      'Fee too low / unpaid', 'Brief too scripted', "Won't allow content reuse",
      'Working with a competitor', "Product doesn't fit their brand",
      'Wrong audience fit', 'Seen bad reviews about us', 'Others'
    ]
    const softPassReasons = ['Fully booked', "Temporarily unavailable / can't shoot", "Can't ship to their location", 'Ghosted / no longer active', 'Rate / deadline too tight']
    
    const reasonsBreakdown: Record<string, number> = {}
    const allReasons = [...hardPassReasons, ...softPassReasons]
    allReasons.forEach(r => { reasonsBreakdown[r] = 0 })
    
    dataToUse.filter(i => i.rejectionReason).forEach(i => {
      if (reasonsBreakdown[i.rejectionReason] !== undefined) reasonsBreakdown[i.rejectionReason]++
      else reasonsBreakdown['Others'] = (reasonsBreakdown['Others'] || 0) + 1
    })
    
    const hardTotal = hardPassReasons.reduce((sum, r) => sum + (reasonsBreakdown[r] || 0), 0)
    const softTotal = softPassReasons.reduce((sum, r) => sum + (reasonsBreakdown[r] || 0), 0)
    
    const noOrderYet = dataToUse.filter(i => i.pipelineStatus === "Prospect" || i.pipelineStatus === "Reached Out").length
    const inTransit = dataToUse.filter(i => i.pipelineStatus === "In Transit").length
    const deliveryProblem = dataToUse.filter(i => i.pipelineStatus === "Delivery Problem").length
    const noPost = dataToUse.filter(i => i.pipelineStatus === "Content Pending").length
    const posted = dataToUse.filter(i => i.pipelineStatus === "Posted").length
    const closedCollaborations = closed
    const receivedProduct = noPost + posted
    const postRate = receivedProduct > 0 ? (posted / receivedProduct) * 100 : 0
    
    const platformStats = { Instagram: { posted: 0, received: 0, views: 0, likes: 0, comments: 0 }, TikTok: { posted: 0, received: 0, views: 0, likes: 0, comments: 0 }, YouTube: { posted: 0, received: 0, views: 0, likes: 0, comments: 0 } }
    
    dataToUse.forEach(i => {
      const platform = i.platform
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
    
    const totalClicks = dataToUse.reduce((sum, i) => sum + (i.clicks || 0), 0)
    const totalSalesQty = dataToUse.reduce((sum, i) => sum + (i.salesQty || 0), 0)
    const totalRevenue = dataToUse.reduce((sum, i) => sum + (i.salesAmt || 0), 0)
    const conversionRate = totalClicks > 0 ? (totalSalesQty / totalClicks) * 100 : 0
    const aov = totalSalesQty > 0 ? totalRevenue / totalSalesQty : 0
    const avgSalePerInfluencer = posted > 0 ? totalRevenue / posted : 0
    const influencersWithSales = dataToUse.filter(i => (i.salesQty || 0) > 0).length
    const totalProductCost = dataToUse.reduce((sum, i) => sum + (i.prodCost || 0), 0)
    
    // Spend/ROI metrics
    const totalFeesPaid = posted * 300
    const totalCommPaid = Math.round(totalRevenue * 0.10)
    const totalSpend = totalProductCost + totalFeesPaid + totalCommPaid
    const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '—'
    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(1) + '%' : '—'
    const profit = totalRevenue - totalSpend
    
    const usageRights = dataToUse.filter(i => i.usageRights).length
    const contentSaved = dataToUse.filter(i => i.contentSaved).length
    const adCodesGiven = dataToUse.filter(i => i.adCode).length
    
    // Aging data for No Post
    const noPostItems = dataToUse.filter(i => i.pipelineStatus === 'Content Pending' && i.deliveredDaysAgo)
    const agingData = [
      { label: "≤ 7 days", count: noPostItems.filter(i => i.deliveredDaysAgo <= 7).length, color: "#1FAE5B", percent: "—", percentage: 25 },
      { label: "8–14 days", count: noPostItems.filter(i => i.deliveredDaysAgo > 7 && i.deliveredDaysAgo <= 14).length, color: "#F4B740", percent: "—", percentage: 25 },
      { label: "15–30 days", count: noPostItems.filter(i => i.deliveredDaysAgo > 14 && i.deliveredDaysAgo <= 30).length, color: "#E24B4A", percent: "—", percentage: 25 },
      { label: "30+ days", count: noPostItems.filter(i => i.deliveredDaysAgo > 30).length, color: "#A32D2D", percent: "—", percentage: 25 }
    ]
    
    return {
      totalOutreach, responded, closed, notInterested, responseRate, closingRate,
      reasonsBreakdown, hardTotal, softTotal, noOrderYet, inTransit, deliveryProblem,
      noPost, posted, closedCollaborations, receivedProduct, postRate, platformStats,
      platformEMV, totalViews, totalLikes, totalComments, engagementRate, totalEMV,
      totalClicks, totalSalesQty, totalRevenue, conversionRate, aov, avgSalePerInfluencer,
      influencersWithSales, totalProductCost, totalFeesPaid, totalCommPaid, totalSpend,
      roas, roi, profit, usageRights, contentSaved, adCodesGiven, agingData
    }
  }
  
  const metrics = calculateMetrics()
  
  const platformConfig = {
    Instagram: { icon: "📸", bg: "#fce4ec", color: "#1FAE5B" },
    TikTok: { icon: "♪", bg: "#e8f5e9", color: "#222" },
    YouTube: { icon: "▶", bg: "#ffebee", color: "#E24B4A" }
  }
  
  const reasonColors: Record<string, string> = {
    'Fee too low / unpaid': '#E24B4A', 'Brief too scripted': '#E8724A', "Won't allow content reuse": '#F4A240',
    'Working with a competitor': '#C97B3A', "Product doesn't fit their brand": '#888780', 'Wrong audience fit': '#6B7F7A',
    'Seen bad reviews about us': '#A32D2D', 'Fully booked': '#2C8EC4', "Temporarily unavailable / can't shoot": '#5BAFD4',
    "Can't ship to their location": '#7DC4E4', 'Ghosted / no longer active': '#B4B2A9', 'Rate / deadline too tight': '#F4B740',
    'Others': '#D3D1C7'
  }

  const exportCSV = () => {
    const headers = ['Platform', 'Niche', 'Location', 'Date Added', 'Pipeline Status', 'Rejection Reason', 'Views', 'Likes', 'Comments', 'Web Clicks', 'Sales (Units)', 'Revenue ($)', 'Usage Rights', 'Content Saved', 'Ad Code Given']
    const rows = filteredInfluencers.map(i => [
      i.platform || '', i.niche || 'General', i.location || 'PH', i.createdAt?.split('T')[0] || '',
      i.pipelineStatus || '', i.rejectionReason || '', i.views || 0, i.likes || 0, i.comments || 0,
      i.clicks || 0, i.salesQty || 0, i.salesAmt || 0, i.usageRights ? 'Yes' : 'No',
      i.contentSaved ? 'Yes' : 'No', i.adCode ? 'Yes' : 'No'
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

  const hardPassReasonsList = [
    'Fee too low / unpaid', 'Brief too scripted', "Won't allow content reuse",
    'Working with a competitor', "Product doesn't fit their brand",
    'Wrong audience fit', 'Seen bad reviews about us', 'Others'
  ]
  const softPassReasonsList = ['Fully booked', "Temporarily unavailable / can't shoot", "Can't ship to their location", 'Ghosted / no longer active', 'Rate / deadline too tight']

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mt-0.5">Showing {metrics.totalOutreach} influencer{metrics.totalOutreach !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3" ref={filterContainerRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                hasActiveFilters ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" />}
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
            
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 sticky top-[73px] z-10">
        <div className="flex gap-1 overflow-x-auto">
          <Tab label="Campaign Summary" isActive={activeTab === 0} onClick={() => setActiveTab(0)} />
          <Tab label="Post Summary" isActive={activeTab === 1} onClick={() => setActiveTab(1)} />
          <Tab label="Post Reach & Impression" isActive={activeTab === 2} onClick={() => setActiveTab(2)} />
          <Tab label="Conversion & UGC" isActive={activeTab === 3} onClick={() => setActiveTab(3)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Tab 0: Campaign Summary */}
        {activeTab === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <MetricCard label="Total outreach" value={metrics.totalOutreach} subLabel="influencers contacted" />
              <MetricCard label="Responded" value={metrics.responded} subLabel={`of ${metrics.totalOutreach} reached out`} />
              <MetricCard label="Response rate" value={`${Math.round(metrics.responseRate)}%`} subLabel={`${metrics.responded} responded`} isGreen />
              <MetricCard label="Closed collaborations" value={metrics.closed} subLabel="agreed to work" />
              <MetricCard label="Closing rate" value={`${Math.round(metrics.closingRate)}%`} subLabel={`of ${metrics.responded} who responded`} isGreen />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Campaign Funnel */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Campaign funnel</h3>
                <FunnelStep name="Reached out" value={metrics.totalOutreach} total={metrics.totalOutreach} color="#1FAE5B" />
                <FunnelStep name="Responded" value={metrics.responded} total={metrics.totalOutreach} color="#1FAE5B" 
                  dropOff={`▼ ${Math.round((1 - metrics.responded / metrics.totalOutreach) * 100)}% drop-off`} />
                <FunnelStep name="Closed collaboration" value={metrics.closed} total={metrics.responded} color="#5BC98A" 
                  dropOff={`▼ ${Math.round((1 - metrics.closed / metrics.responded) * 100)}% closing drop-off`} />
                <FunnelStep name="Not interested" value={metrics.notInterested} total={metrics.responded} color="#E24B4A" />
              </div>

              {/* Reasons not interested with Hard/Soft pass */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Reasons not interested 
                  <span className="text-xs font-normal text-gray-400 ml-2">· hover for context</span>
                </h3>
                
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-600">🚫 Hard pass</span>
                    <span className="text-xs text-gray-400">— don't reach out soon · {metrics.hardTotal} total</span>
                  </div>
                  {hardPassReasonsList.filter(r => (metrics.reasonsBreakdown[r] || 0) > 0).map(reason => (
                    <ReasonRow key={reason} name={reason} count={metrics.reasonsBreakdown[reason] || 0} total={metrics.notInterested} color={reasonColors[reason]} bucket="hard" />
                  ))}
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">🔁 Soft pass</span>
                    <span className="text-xs text-gray-400">— timing/logistics only, follow up next campaign · {metrics.softTotal} total</span>
                  </div>
                  {softPassReasonsList.filter(r => (metrics.reasonsBreakdown[r] || 0) > 0).map(reason => (
                    <ReasonRow key={reason} name={reason} count={metrics.reasonsBreakdown[reason] || 0} total={metrics.notInterested} color={reasonColors[reason]} bucket="soft" />
                  ))}
                </div>
                
                <p className="text-xs text-gray-400 italic mt-4">
                  {metrics.notInterested > 0 
                    ? `${metrics.notInterested} total declines — ${metrics.hardTotal} hard pass · ${metrics.softTotal} soft pass (re-approachable). % is of total not interested.`
                    : 'No rejections in current filter.'}
                </p>
              </div>
            </div>

            {/* Hard vs Soft Pass Donut */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Hard pass vs Soft pass</h3>
                <DonutChart 
                  segments={[
                    { label: 'Hard pass', value: metrics.hardTotal, color: '#E24B4A' },
                    { label: 'Soft pass (re-approachable)', value: metrics.softTotal, color: '#2C8EC4' }
                  ]}
                  centerLabel={metrics.notInterested}
                  centerSub="total declines"
                />
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Top rejection reasons</h3>
                <div className="space-y-2">
                  {Object.entries(metrics.reasonsBreakdown)
                    .filter(([_, count]) => count > 0)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([reason, count]) => (
                      <div key={reason} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: reasonColors[reason] || '#888' }} />
                          <span className="text-sm text-gray-700">{reason}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${hardPassReasonsList.includes(reason) ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            {hardPassReasonsList.includes(reason) ? 'Hard' : 'Soft'}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Post Summary */}
        {activeTab === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="Closed collaborations" value={metrics.closedCollaborations} subLabel="agreed to work" />
              <MetricCard label="Received product" value={metrics.receivedProduct} subLabel={`posted (${metrics.posted}) + no post (${metrics.noPost})`} />
              <MetricCard label="Posted" value={metrics.posted} subLabel={`of ${metrics.receivedProduct} who received`} isGreen />
              <MetricCard label="Post rate" value={`${Math.round(metrics.postRate)}%`} subLabel="posted ÷ received product" isGreen />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Pipeline status breakdown</h3>
                <PipelineItem status="No Order Yet" count={metrics.noOrderYet} total={metrics.closedCollaborations} color="#B4B2A9" />
                <PipelineItem status="In Transit" count={metrics.inTransit} total={metrics.closedCollaborations} color="#2C8EC4" />
                <PipelineItem status="Delivery Problem" count={metrics.deliveryProblem} total={metrics.closedCollaborations} color="#E24B4A" />
                <PipelineItem status="No Post" count={metrics.noPost} total={metrics.closedCollaborations} color="#F4B740" agingData={metrics.agingData} />
                <PipelineItem status="Posted" count={metrics.posted} total={metrics.closedCollaborations} color="#1FAE5B" />
                <p className="text-xs text-gray-400 italic mt-3">% is of closed collaborations. Post rate uses received (Posted + No Post) as base.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Post rate by platform <span className="text-xs font-normal text-gray-500 ml-2">Posted ÷ Received</span></h3>
                {Object.entries(metrics.platformStats).map(([platform, stats]) => (
                  <PlatformRow key={platform} platform={platform} posted={stats.posted} received={stats.received} 
                    color={platformConfig[platform as keyof typeof platformConfig].color} 
                    icon={platformConfig[platform as keyof typeof platformConfig].icon} 
                    iconBg={platformConfig[platform as keyof typeof platformConfig].bg} />
                ))}
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Posted vs Not Posted</h3>
              <DonutChart 
                segments={[
                  { label: 'Posted', value: metrics.posted, color: '#1FAE5B' },
                  { label: 'No Post', value: metrics.noPost, color: '#F4B740' },
                  { label: 'No Order Yet', value: metrics.noOrderYet, color: '#B4B2A9' },
                  { label: 'In Transit', value: metrics.inTransit, color: '#2C8EC4' },
                  { label: 'Delivery Problem', value: metrics.deliveryProblem, color: '#E24B4A' }
                ]}
                centerLabel={Math.round(metrics.postRate)} 
                centerSub="post rate"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Post Reach & Impression */}
        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{formatNumber(metrics.totalViews)}</div><div className="text-xs text-gray-500 mt-1">Total views</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{formatNumber(metrics.totalLikes)}</div><div className="text-xs text-gray-500 mt-1">Total likes</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{formatNumber(metrics.totalComments)}</div><div className="text-xs text-gray-500 mt-1">Total comments</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-600">{formatMoney(Math.round(metrics.totalEMV))}</div><div className="text-xs text-gray-500 mt-1">Total EMV</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">EMV by platform <span className="text-xs font-normal text-gray-500 ml-2">(Estimated Media Value)</span></h3>
                {Object.entries(metrics.platformEMV).map(([platform, emv]) => (
                  <EMVRow key={platform} platform={platform} views={metrics.platformStats[platform as keyof typeof metrics.platformStats].views} 
                    emv={Math.round(emv)} color={platformConfig[platform as keyof typeof platformConfig].color} 
                    icon={platformConfig[platform as keyof typeof platformConfig].icon} 
                    iconBg={platformConfig[platform as keyof typeof platformConfig].bg} 
                    rate={platform === 'Instagram' ? 10 : platform === 'TikTok' ? 6 : 18} />
                ))}
                <p className="text-xs text-gray-400 italic mt-3">Rates: Instagram $10 · TikTok $6 · YouTube $18 per 1,000 views</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Engagement breakdown</h3>
                <div className="grid grid-cols-1 gap-3">
                  <MetricCard label="Engagement rate" value={`${metrics.engagementRate.toFixed(2)}%`} subLabel="(likes + comments) ÷ views" isGreen />
                  <MetricCard label="Avg views / influencer" value={metrics.posted > 0 ? formatNumber(Math.round(metrics.totalViews / metrics.posted)) : '—'} subLabel={`${metrics.posted} posted`} />
                  <MetricCard label="Total EMV" value={formatMoney(Math.round(metrics.totalEMV))} subLabel="all platforms combined" isGreen />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Views share by platform</h3>
                <DonutChart 
                  segments={Object.entries(metrics.platformStats).map(([platform, stats]) => ({ label: platform, value: stats.views, color: platformConfig[platform as keyof typeof platformConfig].color }))}
                  centerLabel={formatNumber(metrics.totalViews)} centerSub="total views"
                />
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">EMV share by platform</h3>
                <DonutChart 
                  segments={Object.entries(metrics.platformEMV).map(([platform, emv]) => ({ label: platform, value: Math.round(emv), color: platformConfig[platform as keyof typeof platformConfig].color }))}
                  centerLabel={`$${Math.round(metrics.totalEMV / 1000)}K`} centerSub="total EMV"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Conversion & UGC */}
        {activeTab === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center"><div className="text-xl font-bold text-green-600">{metrics.totalClicks.toLocaleString()}</div><div className="text-xs text-gray-500 mt-1">Web clicks</div></div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center"><div className="text-xl font-bold text-green-600">{metrics.totalSalesQty}</div><div className="text-xs text-gray-500 mt-1">Total sales (units)</div></div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center"><div className="text-xl font-bold text-green-600">{formatMoney(metrics.totalRevenue)}</div><div className="text-xs text-gray-500 mt-1">Total revenue</div></div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center"><div className="text-xl font-bold text-green-600">{metrics.conversionRate.toFixed(1)}%</div><div className="text-xs text-gray-500 mt-1">Conversion rate</div></div>
            </div>

            {/* Campaign Spend & Return */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Campaign spend & return</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <MetricCard label="Total revenue" value={formatMoney(metrics.totalRevenue)} subLabel="from influencer-driven sales" isGreen />
                <MetricCard label="Total spend" value={formatMoney(metrics.totalSpend)} subLabel="COGS + fees + commission" />
                <MetricCard label="Net profit / loss" value={`${metrics.profit >= 0 ? '+' : ''}${formatMoney(metrics.profit)}`} subLabel={metrics.profit >= 0 ? 'profitable campaign' : 'loss-making campaign'} isGreen={metrics.profit >= 0} />
                <MetricCard label="ROAS" value={metrics.roas !== '—' ? `${metrics.roas}x` : '—'} subLabel="revenue ÷ total spend" isGreen={parseFloat(metrics.roas as string) >= 1} />
                <MetricCard label="ROI" value={metrics.roi} subLabel="net profit ÷ total spend" isGreen={metrics.profit >= 0} />
                <MetricCard label="Break-even" value={formatMoney(metrics.totalSpend)} subLabel="min revenue needed" />
              </div>
              
              <div className="border-t border-gray-100 pt-3 mt-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">🛍 Product cost (COGS)</span>
                    <span className="text-sm font-semibold">{formatMoney(metrics.totalProductCost)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">💸 Creator fees paid</span>
                    <span className="text-sm font-semibold">{formatMoney(metrics.totalFeesPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">🔗 Commission paid (10%)</span>
                    <span className="text-sm font-semibold">{formatMoney(metrics.totalCommPaid)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic mt-3">Total spend = product cost (COGS) + creator fees paid + commission paid</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Additional conversion metrics</h3>
                <div className="grid grid-cols-1 gap-3">
                  <MetricCard label="Avg order value (AOV)" value={formatMoney(Math.round(metrics.aov))} subLabel="revenue ÷ units sold" isGreen />
                  <MetricCard label="Avg sale per influencer" value={formatMoney(Math.round(metrics.avgSalePerInfluencer))} subLabel="revenue ÷ all who posted" isGreen />
                  <MetricCard label="Influencers with sales" value={`${metrics.influencersWithSales} (${formatPercent(metrics.influencersWithSales, metrics.posted)})`} subLabel="of those who posted" isGreen />
                  <MetricCard label="Product cost (total)" value={formatMoney(metrics.totalProductCost)} subLabel="cost of products sent" />
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Influencers with sales vs without</h3>
                <DonutChart 
                  segments={[
                    { label: 'With sales', value: metrics.influencersWithSales, color: '#1FAE5B' },
                    { label: 'No sales', value: metrics.posted - metrics.influencersWithSales, color: '#f0f0ee' }
                  ]}
                  centerLabel={formatPercent(metrics.influencersWithSales, metrics.posted)} 
                  centerSub="conversion rate"
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
              
              <div className="bg-white border border-gray-200 rounded-xl p-5 mt-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">UGC rights breakdown</h3>
                <DonutChart 
                  segments={[
                    { label: 'Usage rights granted', value: metrics.usageRights, color: '#1FAE5B' },
                    { label: 'Content saved', value: metrics.contentSaved, color: '#2C8EC4' },
                    { label: 'Ad code given', value: metrics.adCodesGiven, color: '#F4B740' },
                    { label: 'No rights', value: metrics.posted - metrics.usageRights, color: '#e0e0de' }
                  ]}
                  centerLabel={formatPercent(metrics.usageRights, metrics.posted)} 
                  centerSub="rights granted"
                />
                <p className="text-xs text-gray-400 italic mt-3">
                  Content saved ({metrics.contentSaved}) is always ≤ usage rights granted ({metrics.usageRights}). You can only save content you have the rights to use.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .group:hover .group-hover\\:block { display: block; }
      `}</style>
    </div>
  )
}