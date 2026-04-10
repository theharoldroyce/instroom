"use client"

import { useState, useEffect, useCallback } from "react"
import TierSettingsModal from "./TierSettingsModal"
import AddPartnerModal from "./AddPartnerModal"
import NewCampaignModal from "./NewCampaignModal"
import InfluencerProfileSidebar from "@/components/InfluencerProfileSidebar"
import { IconSearch, IconFilter } from "@tabler/icons-react"
import { ReactNode } from "react"
import { IconBrandInstagram, IconBrandYoutube, IconBrandTiktok } from "@tabler/icons-react"

// Types
interface MonthlyData {
  month: string
  posts: number
  clicks: number
  rev: number
  eng: number
  sales: number
}

interface ProductSend {
  date: string
  product: string
  cost: number
  reason: string
}

interface Partner {
  id: number
  handle: string
  firstName: string
  lastName: string
  birthday: string
  plat: string
  niche: string
  gend: string
  loc: string
  tier: string
  tierOverride: string | null
  onRet: boolean
  retFee: number
  defComm: number
  commSt: string
  clicks: number
  cvr: number
  sales: number
  aov: number
  rev: number
  fol: number
  eng: number
  avgV: number
  gmv: number
  added: Date
  prods: ProductSend[]
  prodCost: number
  feesPaid: number
  commPaid: number
  totalSpend: number
  roi_val: number
  roas_val: number
  monthly: MonthlyData[]
  ppm: number
  hClicks: number
  hSales: number
  hRev: number
  hCVR: number
  hPosts: number
}

interface Deliverable {
  name: string
  posted: boolean
}

interface CampaignPartner {
  pid: number
  payStatus: number
  deliverables: Deliverable[]
  fee: number
  productCost: number
  commPaid: number
  revenue: number
  views: number
  likes: number
  engRate: number
}

interface Campaign {
  id: number
  name: string
  status: string
  start: string
  end: string
  budget: number
  type: string
  notes: string
  partners: CampaignPartner[]
}

interface FilterState {
  tier: string
  platform: string
  niche: string
  location: string
  comm: string
}

interface TierSettings {
  bronzeMin: number
  bronzeMax: number
  silverMin: number
  silverMax: number
  goldMin: number
}

const PLATFORMS = ["Instagram", "YouTube", "TikTok"]
export const PLATFORM_ICONS: Record<string, ReactNode> = {
  Instagram: (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
      alt="Instagram"
      className="w-4 h-4"
    />
  ),

  TikTok: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.89 2.89 2.896 2.896 0 0 1-2.889-2.89 2.896 2.896 0 0 1 2.89-2.889c.302 0 .595.05.872.137V9.257a6.339 6.339 0 0 0-5.053 2.212 6.339 6.339 0 0 0-1.33 5.52 6.34 6.34 0 0 0 5.766 4.731 6.34 6.34 0 0 0 6.34-6.34V8.898a7.756 7.756 0 0 0 4.422 1.393V6.825a4.8 4.8 0 0 1-2.443-.139z" />
    </svg>
  ),

  YouTube: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
}
const NICHES = ["Beauty", "Fitness", "Lifestyle", "Food", "Tech"]
const LOCATIONS = ["Philippines", "Singapore", "United States", "Australia", "United Kingdom", "Malaysia"]
const COMMUNITY_STATUS = ["Pending", "Invited", "Joined", "Not Interested", "Left"]
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
const GENDERS = ["Female", "Male", "Non-binary"]
const PAY_STATUS = ["Waiting for Invoice", "Invoice Received", "Payment Sent", "Done"]
const PAY_CLASSES = ["pw", "pr", "ps", "pd"]

const HANDLES = [
  "@glossqueen", "@fitwithjay", "@chefmaria", "@lifestylelux", "@techrealmph",
  "@beautybyjess", "@gymratanna", "@foodiefren", "@cozyvibesph", "@gadgetguru",
  "@skincaresophie", "@strongbysam", "@homechefking", "@aestheticliv", "@devdaddyph"
]
const FIRST_NAMES = ["Grace", "Jay", "Maria", "Lux", "Rex", "Jess", "Anna", "Fren", "Cozy", "Guru", "Sophie", "Sam", "King", "Liv", "Dev"]
const LAST_NAMES = ["Santos", "Cruz", "Reyes", "Lim", "Garcia", "Torres", "Dela Cruz", "Bautista", "Villanueva", "Mendoza", "Castillo", "Flores", "Rivera", "Ocampo", "Ramos"]
const BIRTHDAYS = ["1995-03-12", "1992-07-24", "1998-11-05", "1990-01-30", "1996-09-18", "1993-04-07", "1997-12-22", "1994-06-15", "1991-08-03", "1999-02-28", "1996-05-11", "1993-10-19", "1990-07-04", "1997-03-25", "1994-11-08"]

function formatMoney(value: number): string {
  return "$" + Math.round(value).toLocaleString()
}

function formatROAS(rev: number, spend: number): string {
  return spend > 0 ? (rev / spend).toFixed(1) + "x" : "—"
}

function formatROI(rev: number, spend: number): string {
  return spend > 0 ? ((rev - spend) / spend * 100).toFixed(1) + "%" : "—"
}

function formatFollowers(fol: number): string {
  return fol >= 1000 ? (fol / 1000).toFixed(1) + "K" : String(fol)
}

function createRng(seed: number) {
  let x = seed
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280 }
}

const R = createRng(1234)
function ri(a: number, b: number) { return Math.floor(R() * (b - a + 1)) + a }
function rf(a: number, b: number) { return parseFloat((R() * (b - a) + a).toFixed(2)) }

let tierBronzeMax = 2000
let tierSilverMax = 10000

function autoTier(rev: number): string {
  if (rev >= tierSilverMax + 1) return "Gold"
  if (rev >= tierBronzeMax + 1) return "Silver"
  return "Bronze"
}

const generatePartners = (): Partner[] => {
  return Array.from({ length: 15 }, (_, i) => {
    const plat = PLATFORMS[Math.floor(R() * 3)]
    const niche = NICHES[Math.floor(R() * 5)]
    const onRet = R() < 0.45
    const retFee = onRet ? ri(200, 800) : 0
    const defComm = ri(8, 20)
    const commSt = COMMUNITY_STATUS[ri(0, 4)]
    const clicks = ri(800, 12000)
    const sales = Math.round(clicks * rf(0.015, 0.065))
    const cvr = parseFloat((sales / clicks * 100).toFixed(2))
    const aov = ri(35, 150)
    const rev = sales * aov
    const fol = ri(5000, 500000)
    const eng = rf(1.5, 8.5)
    const avgV = ri(1000, 80000)
    const gmv = ri(5000, 80000)
    const gend = GENDERS[Math.floor(R() * 3)]
    const loc = LOCATIONS[Math.floor(R() * 6)]
    const dA = ri(10, 300)
    const added = new Date(new Date("2026-04-01").getTime() - dA * 86400000)

    const prods: ProductSend[] = Array.from({ length: ri(2, 5) }, () => ({
      date: `2026-0${ri(1, 3)}-${String(ri(1, 28)).padStart(2, "0")}`,
      product: ["Serum Bundle", "Gift Set", "Launch Kit", "Giveaway Pack", "Trial Pack"][ri(0, 4)],
      cost: ri(30, 200),
      reason: ["Product Launch", "Refill", "Giveaway", "New Trial"][ri(0, 3)]
    }))
    const prodCost = prods.reduce((a, x) => a + x.cost, 0)
    const feesPaid = onRet ? retFee * 6 : 0
    const commPaid = Math.round(rev * defComm / 100)
    const totalSpend = prodCost + feesPaid + commPaid
    const roi_val = totalSpend > 0 ? parseFloat(((rev - totalSpend) / totalSpend * 100).toFixed(1)) : 0
    const roas_val = totalSpend > 0 ? parseFloat((rev / totalSpend).toFixed(1)) : 0

    const monthly: MonthlyData[] = MONTHS.map(m => ({
      month: m, posts: ri(1, 6), clicks: ri(100, 2000), rev: ri(200, 3000), eng: rf(1.5, 8.5), sales: ri(1, 50)
    }))
    const ppm = parseFloat((monthly.reduce((a, x) => a + x.posts, 0) / 6).toFixed(1))
    const hClicks = clicks + ri(200, 3000)
    const hSales = sales + ri(5, 80)
    const hRev = rev + ri(500, 5000)
    const hCVR = parseFloat((hSales / hClicks * 100).toFixed(2))
    const hPosts = Math.round(ppm * 12) + ri(2, 10)

    return {
      id: i, handle: HANDLES[i], firstName: FIRST_NAMES[i], lastName: LAST_NAMES[i],
      birthday: BIRTHDAYS[i], plat, niche, gend, loc, tier: "", tierOverride: null,
      onRet, retFee, defComm, commSt, clicks, cvr, sales, aov, rev, fol, eng, avgV, gmv,
      added, prods, prodCost, feesPaid, commPaid, totalSpend, roi_val, roas_val,
      monthly, ppm, hClicks, hSales, hRev, hCVR, hPosts
    }
  })
}

const generateCampaigns = (partners: Partner[]): Campaign[] => [
  {
    id: 0, name: "Black Friday 2025", status: "Completed", start: "2025-11-15", end: "2025-11-30", budget: 5000, type: "Paid", notes: "",
    partners: [0, 1, 3, 6, 8].map(pid => ({
      pid, payStatus: 3,
      deliverables: [{ name: "1x IG Reel", posted: true }, { name: "3x IG Stories", posted: true }],
      fee: ri(300, 800), productCost: ri(40, 150), commPaid: ri(100, 500),
      views: ri(5000, 50000), likes: ri(200, 3000), engRate: rf(1.5, 6.0), revenue: ri(1000, 15000)
    }))
  },
  {
    id: 1, name: "Valentine's Day 2026", status: "Completed", start: "2026-02-01", end: "2026-02-14", budget: 3000, type: "Gifting", notes: "",
    partners: [2, 4, 7, 11].map(pid => ({
      pid, payStatus: 2,
      deliverables: [{ name: "1x TikTok Video", posted: true }, { name: "2x IG Stories", posted: false }],
      fee: ri(0, 500), productCost: ri(50, 200), commPaid: 0,
      views: ri(3000, 30000), likes: ri(100, 2000), engRate: rf(1.5, 6.0), revenue: ri(500, 8000)
    }))
  },
  {
    id: 2, name: "Spring Launch 2026", status: "Active", start: "2026-03-01", end: "", budget: 4000, type: "Paid", notes: "Open-ended",
    partners: [0, 5, 9, 12, 14].map(pid => ({
      pid, payStatus: 1,
      deliverables: [{ name: "1x YouTube Review", posted: pid === 0 }, { name: "1x IG Post", posted: false }],
      fee: ri(200, 700), productCost: ri(40, 150), commPaid: ri(50, 300),
      views: ri(2000, 25000), likes: ri(100, 1500), engRate: rf(1.5, 6.0), revenue: ri(300, 6000)
    }))
  },
  {
    id: 3, name: "Summer Drop 2026", status: "Draft", start: "2026-06-01", end: "2026-06-30", budget: 6000, type: "Affiliate", notes: "",
    partners: [1, 3, 6, 10, 13].map(pid => ({
      pid, payStatus: 0,
      deliverables: [{ name: "1x IG Reel", posted: false }, { name: "1x TikTok", posted: false }],
      fee: 0, productCost: ri(40, 150), commPaid: 0,
      views: 0, likes: 0, engRate: 0, revenue: 0
    }))
  },
]

// ─── Main Page Component ────────────────────────────────────────────────────
export default function BrandPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>({ tier: "all", platform: "all", niche: "all", location: "all", comm: "all" })
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [sortCol, setSortCol] = useState("roas")
  const [sortAsc, setSortAsc] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const [showTierModal, setShowTierModal] = useState(false)
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [showCampaignDetail, setShowCampaignDetail] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    const initialPartners = generatePartners().map(p => ({ ...p, tier: autoTier(p.rev) }))
    setPartners(initialPartners)
    setCampaigns(generateCampaigns(initialPartners))
  }, [])

  const getDisplayTier = useCallback((partner: Partner): string => {
    return partner.tierOverride || autoTier(partner.rev)
  }, [])

  const handleTierSave = (settings: TierSettings) => {
    tierBronzeMax = settings.bronzeMax
    tierSilverMax = settings.silverMax
    setPartners(prev => prev.map(p => ({ ...p, tier: p.tierOverride || autoTier(p.rev) })))
  }

  const handleAddPartner = (newPartnerData: any) => {
    const newPartner: Partner = {
      id: Date.now(), handle: newPartnerData.handle,
      firstName: newPartnerData.firstName || newPartnerData.handle.replace("@", "").slice(0, 6),
      lastName: newPartnerData.lastName || "", birthday: "", plat: newPartnerData.platform,
      niche: newPartnerData.niche, gend: "", loc: newPartnerData.location, tier: "",
      tierOverride: newPartnerData.tierOverride || null, onRet: false, retFee: 0, defComm: 0,
      commSt: newPartnerData.communityStatus || "Pending",
      clicks: 0, cvr: 0, sales: 0, aov: 0, rev: 0, fol: 0, eng: 0, avgV: 0, gmv: 0,
      added: new Date(), prods: [], prodCost: 0, feesPaid: 0, commPaid: 0, totalSpend: 0,
      roi_val: 0, roas_val: 0,
      monthly: MONTHS.map(m => ({ month: m, posts: 0, clicks: 0, rev: 0, eng: 0, sales: 0 })),
      ppm: 0, hClicks: 0, hSales: 0, hRev: 0, hCVR: 0, hPosts: 0,
    }
    setPartners(prev => [...prev, newPartner])
  }

  const handleCreateCampaign = (campaignData: {
    name: string; type: string; startDate: string; endDate: string; budget: number; notes: string; partnerIds: number[]
  }) => {
    const newCampaign: Campaign = {
      id: campaigns.length, name: campaignData.name, type: campaignData.type, status: "Draft",
      start: campaignData.startDate, end: campaignData.endDate, budget: campaignData.budget, notes: campaignData.notes,
      partners: campaignData.partnerIds.map(pid => ({
        pid, payStatus: 0, deliverables: [], fee: 0, productCost: 0, commPaid: 0, revenue: 0, views: 0, likes: 0, engRate: 0
      })),
    }
    setCampaigns(prev => [...prev, newCampaign])
    setActiveTab(1)
  }

  const getFilteredPartners = useCallback(() => {
    let filtered = [...partners]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => `${p.handle} ${p.niche} ${p.plat} ${p.firstName} ${p.lastName} ${p.loc}`.toLowerCase().includes(q))
    }
    if (filters.tier !== "all") filtered = filtered.filter(p => getDisplayTier(p) === filters.tier)
    if (filters.platform !== "all") filtered = filtered.filter(p => p.plat === filters.platform)
    if (filters.niche !== "all") filtered = filtered.filter(p => p.niche === filters.niche)
    if (filters.location !== "all") filtered = filtered.filter(p => p.loc === filters.location)
    if (filters.comm !== "all") filtered = filtered.filter(p => p.commSt === filters.comm)

    const tierOrder: Record<string, number> = { Gold: 0, Silver: 1, Bronze: 2 }
    filtered.sort((a, b) => {
      let v = 0
      switch (sortCol) {
        case "roas": v = a.roas_val - b.roas_val; break
        case "revenue": v = a.rev - b.rev; break
        case "clicks": v = a.clicks - b.clicks; break
        case "cvr": v = a.cvr - b.cvr; break
        case "sales": v = a.sales - b.sales; break
        case "spend": v = a.totalSpend - b.totalSpend; break
        case "alpha": v = a.handle.localeCompare(b.handle); break
        case "tier": v = tierOrder[getDisplayTier(a)] - tierOrder[getDisplayTier(b)]; break
        case "retainer": v = a.retFee - b.retFee; break
        case "platform": v = a.plat.localeCompare(b.plat); break
        case "niche": v = a.niche.localeCompare(b.niche); break
        case "location": v = a.loc.localeCompare(b.loc); break
        default: v = 0
      }
      return sortAsc ? v : -v
    })
    return filtered
  }, [partners, searchQuery, filters, sortCol, sortAsc, getDisplayTier])

  const filteredPartners = getFilteredPartners()
  const totalPages = Math.max(1, Math.ceil(filteredPartners.length / rowsPerPage))
  const paginatedPartners = filteredPartners.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const goldCount = partners.filter(p => getDisplayTier(p) === "Gold").length
  const silverCount = partners.filter(p => getDisplayTier(p) === "Silver").length
  const bronzeCount = partners.filter(p => getDisplayTier(p) === "Bronze").length

  const handleSort = (col: string) => {
    if (sortCol === col) { setSortAsc(!sortAsc) } else { setSortCol(col); setSortAsc(false) }
    setCurrentPage(1)
  }

  // Campaign detail
  const renderCampaignDetail = (c: Campaign) => {
    const campRev = c.partners.reduce((a, p) => a + (p.revenue || 0), 0)
    const campSpend = c.partners.reduce((a, p) => a + (p.fee || 0) + (p.productCost || 0) + (p.commPaid || 0), 0)
    const campCOGS = c.partners.reduce((a, p) => a + (p.productCost || 0), 0)
    const campFees = c.partners.reduce((a, p) => a + (p.fee || 0), 0)
    const campComm = c.partners.reduce((a, p) => a + (p.commPaid || 0), 0)
    const totalViews = c.partners.reduce((a, p) => a + (p.views || 0), 0)
    const totalLikes = c.partners.reduce((a, p) => a + (p.likes || 0), 0)
    const avgEng = c.partners.length > 0 ? (c.partners.reduce((a, p) => a + (p.engRate || 0), 0) / c.partners.length).toFixed(2) : "0"
    const tp = c.partners.reduce((a, p) => a + p.deliverables.length, 0)
    const dp = c.partners.reduce((a, p) => a + p.deliverables.filter(d => d.posted).length, 0)
    const isProfitable = campRev > campSpend

    return (
      <div>
        <div style={{ background: "#fff", borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "10px 20px" }}>
          <button style={{ fontSize: 12, color: "#1FAE5B", background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: "pointer" }} onClick={() => setShowCampaignDetail(false)}>← Back to Campaigns</button>
        </div>
        <div className="content">
          <div className="cd-section">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{c.name}</div>
              <span className={`cs c-${c.status.toLowerCase()}`}>{c.status}</span>
              {campSpend > 0 && <span className={`profit-pill ${isProfitable ? "profit-yes" : "profit-no"}`}>{isProfitable ? "✓ Profitable" : "✗ Loss"}</span>}
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{c.start} → {c.end || "Open-ended"} · {c.type}{c.budget ? ` · Budget: ${formatMoney(c.budget)}` : ""}</div>
          </div>

          <div className="cd-section">
            <div className="cd-section-title">Performance summary</div>
            <div className="kpi-grid-4">
              <div className="kpi-card"><div className="kpi-l">Total revenue</div><div className="kpi-v g">{formatMoney(campRev)}</div></div>
              <div className="kpi-card"><div className="kpi-l">Total spend</div><div className="kpi-v">{formatMoney(campSpend)}</div><div className="spend-breakdown">{formatMoney(campCOGS)} COGS · {formatMoney(campFees)} fees · {formatMoney(campComm)} comm</div></div>
              <div className="kpi-card"><div className="kpi-l">ROAS</div><div className={`kpi-v ${campSpend > 0 && campRev / campSpend >= 1 ? "g" : "r"}`}>{formatROAS(campRev, campSpend)}</div></div>
              <div className="kpi-card"><div className="kpi-l">ROI</div><div className={`kpi-v ${campRev > campSpend ? "g" : "r"}`}>{formatROI(campRev, campSpend)}</div></div>
            </div>
            <div className="kpi-grid-4" style={{ marginTop: 8 }}>
              <div className="kpi-card"><div className="kpi-l">Posts done</div><div className={`kpi-v ${dp === tp ? "g" : ""}`}>{dp}/{tp}</div></div>
              <div className="kpi-card"><div className="kpi-l">Total views</div><div className="kpi-v">{totalViews.toLocaleString()}</div></div>
              <div className="kpi-card"><div className="kpi-l">Total likes</div><div className="kpi-v">{totalLikes.toLocaleString()}</div></div>
              <div className="kpi-card"><div className="kpi-l">Avg eng. rate</div><div className="kpi-v">{avgEng}%</div></div>
            </div>
          </div>

          <div className="cd-section">
            <div className="cd-section-title">Creator breakdown</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                    <th className="cd-th">Creator</th>
                    <th className="cd-th" style={{ textAlign: "right" }}>COGS</th>
                    <th className="cd-th" style={{ textAlign: "right" }}>Fee</th>
                    <th className="cd-th" style={{ textAlign: "right" }}>Commission</th>
                    <th className="cd-th" style={{ textAlign: "right" }}>Total spend</th>
                    <th className="cd-th" style={{ textAlign: "right" }}>Revenue</th>
                    <th className="cd-th" style={{ textAlign: "right" }}>ROAS / ROI</th>
                    <th className="cd-th">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {c.partners.map(cp => {
                    const p = partners.find(x => x.id === cp.pid)
                    const cSpend = (cp.fee || 0) + (cp.productCost || 0) + (cp.commPaid || 0)
                    const cRoasNum = cSpend > 0 ? cp.revenue / cSpend : 0
                    const cRoiNum = cSpend > 0 ? (cp.revenue - cSpend) / cSpend * 100 : 0
                    return (
                      <tr key={cp.pid} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                        <td style={{ padding: 10, verticalAlign: "top" }}>
                          <div style={{ fontWeight: 500 }}>{p?.handle || "—"}</div>
                          <div style={{ fontSize: 10, color: "#888" }}>{p?.plat} · {p?.niche}</div>
                          <div style={{ marginTop: 4 }}>
                            {cp.deliverables.map((dd, di) => (
                              <div key={di} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: dd.posted ? "#1E1E1E" : "#888" }}>
                                {dd.posted ? "✅" : "⏳"} {dd.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: 10, textAlign: "right", verticalAlign: "top" }}>{cp.productCost > 0 ? formatMoney(cp.productCost) : <span style={{ color: "#ccc" }}>—</span>}</td>
                        <td style={{ padding: 10, textAlign: "right", verticalAlign: "top" }}>{cp.fee > 0 ? formatMoney(cp.fee) : <span style={{ color: "#ccc" }}>—</span>}</td>
                        <td style={{ padding: 10, textAlign: "right", verticalAlign: "top" }}>{cp.commPaid > 0 ? formatMoney(cp.commPaid) : <span style={{ color: "#ccc" }}>—</span>}</td>
                        <td style={{ padding: 10, textAlign: "right", verticalAlign: "top", fontWeight: 600 }}>{formatMoney(cSpend)}</td>
                        <td style={{ padding: 10, textAlign: "right", verticalAlign: "top", fontWeight: 600, color: "#1FAE5B" }}>{formatMoney(cp.revenue || 0)}</td>
                        <td style={{ padding: 10, textAlign: "right", verticalAlign: "top" }}>
                          <div className={cRoasNum >= 1 ? "roas-pos" : "roas-neg"}>{formatROAS(cp.revenue, cSpend)}</div>
                          <div style={{ fontSize: 10, color: "#888" }}>{cRoiNum >= 0 ? "+" : ""}{cRoiNum.toFixed(1)}% ROI</div>
                        </td>
                        <td style={{ padding: 10, verticalAlign: "top" }}><span className={`pay-badge ${PAY_CLASSES[cp.payStatus]}`}>{PAY_STATUS[cp.payStatus]}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f7f9f8", minHeight: "100vh" }}>
      {/* Top Bar */}
      <div className="topbar">
        <div>
          <div className="topbar-sub">{partners.length} total · {goldCount} Gold · {silverCount} Silver · {bronzeCount} Bronze</div>
        </div>
        <div className="topbar-actions">
          <button className="btn-outline" onClick={() => setShowTierModal(true)}>⚙ Tier Settings</button>
          <button className="btn-outline" onClick={() => setShowCampaignModal(true)}>+ New Campaign</button>
          <button className="btn-primary" onClick={() => setShowAddPartnerModal(true)}>+ Add Partner</button>
        </div>
      </div>

      {/* Tab Bar + Search */}
      {!showCampaignDetail && (
        <div className="tab-search-row">
          <div className="tab-bar">
            {["Partner List", "Campaigns"].map((tab, idx) => (
              <div key={idx} className={`tab ${activeTab === idx ? "active" : ""}`} onClick={() => setActiveTab(idx)}>{tab}</div>
            ))}
          </div>
          <div className="sfg">
            <div className="sw relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="sb pl-9" placeholder="Search creators..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="fw">
              <button onClick={() => setShowFilterPanel(!showFilterPanel)} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 border border-[#0F6B3E]/20">
                <IconFilter size={16} />
                Filters
              </button>
              {showFilterPanel && (
                <div className="fp open">
                  <div className="fp-title">Filter by</div>
                  <div className="fg">
                    <div>
                      <label>Tier</label>
                      <select value={filters.tier} onChange={(e) => setFilters((p) => ({ ...p, tier: e.target.value }))}>
                        <option value="all">All</option>
                        <option value="Gold">🥇 Gold</option>
                        <option value="Silver">🥈 Silver</option>
                        <option value="Bronze">🥉 Bronze</option>
                      </select>
                    </div>
                    <div>
                      <label>Platform</label>
                      <select value={filters.platform} onChange={(e) => setFilters((p) => ({ ...p, platform: e.target.value }))}>
                        <option value="all">All</option>
                        {PLATFORMS.map((p) => (<option key={p}>{p}</option>))}
                      </select>
                    </div>
                    <div>
                      <label>Niche</label>
                      <select value={filters.niche} onChange={(e) => setFilters((p) => ({ ...p, niche: e.target.value }))}>
                        <option value="all">All</option>
                        {NICHES.map((n) => (<option key={n}>{n}</option>))}
                      </select>
                    </div>
                    <div>
                      <label>Location</label>
                      <select value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}>
                        <option value="all">All</option>
                        {LOCATIONS.map((l) => (<option key={l}>{l}</option>))}
                      </select>
                    </div>
                    <div>
                      <label>Community</label>
                      <select value={filters.comm} onChange={(e) => setFilters((p) => ({ ...p, comm: e.target.value }))}>
                        <option value="all">All</option>
                        {COMMUNITY_STATUS.map((c) => (<option key={c}>{c}</option>))}
                      </select>
                    </div>
                  </div>
                  <div className="fa">
                    <button className="fc-btn" onClick={() => setFilters({ tier: "all", platform: "all", niche: "all", location: "all", comm: "all" })}>Clear all</button>
                    <button className="fa-btn" onClick={() => setShowFilterPanel(false)}>Apply</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Partner List ── */}
      {activeTab === 0 && !showCampaignDetail && (
        <div className="content">
          <div className="tw">
            <table className="pt">
              <thead>
                <tr>
                  <th style={{ width: 28, color: "#bbb" }}>#</th>
                  <th><div className="thi" onClick={() => handleSort("alpha")}><span className="cl">Creator</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("platform")}><span className="cl">Platform</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("niche")}><span className="cl">Niche</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("location")}><span className="cl">Location</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("tier")}><span className="cl">Tier</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("retainer")}><span className="cl">Retainer</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("spend")}><span className="cl">Total spend</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("clicks")}><span className="cl">Clicks</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("cvr")}><span className="cl">CVR</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("sales")}><span className="cl">Sales</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("revenue")}><span className="cl">Revenue</span><span className="sa">↕</span></div></th>
                  <th><div className="thi" onClick={() => handleSort("roas")}><span className="cl">ROAS / ROI</span><span className="sa">↕</span></div></th>
                  <th style={{ color: "#888", fontSize: 11 }}>Community</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginatedPartners.map((p, idx) => {
                  const tier = getDisplayTier(p)
                  const tierClass = tier === "Gold" ? "tg" : tier === "Silver" ? "ts" : "tbr"
                  const tierIcon = tier === "Gold" ? "🥇" : tier === "Silver" ? "🥈" : "🥉"
                  const commClass = `comm-${p.commSt.toLowerCase().replace(/ /g, "")}`
                  return (
                    <tr key={p.id} className="dr" onClick={() => { setSelectedPartner(p); setShowProfilePanel(true) }}>
                      <td style={{ color: "#bbb", fontSize: 11 }}>{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                      <td style={{ fontWeight: 500, fontSize: 12 }}>{p.handle}</td>
                      <td><div className="flex justify-center items-center">{PLATFORM_ICONS[p.plat]}</div></td>
                      <td style={{ fontSize: 11, color: "#888" }}>{p.niche}</td>
                      <td style={{ fontSize: 11, color: "#888" }}>{p.loc}</td>
                      <td><div className="flex justify-center"><span className={`tb ${tierClass}`}>{tierIcon}</span></div></td>
                      <td style={{ fontSize: 11, color: p.onRet ? "#0F6B3E" : "#ccc", fontWeight: p.onRet ? 500 : 400 }}>{p.onRet ? formatMoney(p.retFee) + "/mo" : "—"}</td>
                      <td>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{formatMoney(p.totalSpend)}</div>
                        <div style={{ fontSize: 10, color: "#888" }}>{formatMoney(p.prodCost)} COGS + {formatMoney(p.feesPaid)} fees</div>
                      </td>
                      <td style={{ fontSize: 12 }}>{p.clicks.toLocaleString()}</td>
                      <td><span className="cvr">{p.cvr}%</span></td>
                      <td style={{ fontSize: 12 }}>{p.sales.toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: "#1FAE5B" }}>{formatMoney(p.rev)}</td>
                      <td>
                        <div className={p.roas_val >= 1 ? "roas-pos" : "roas-neg"}>{formatROAS(p.rev, p.totalSpend)}</div>
                        <div style={{ fontSize: 10, color: "#888" }}>{p.roi_val >= 0 ? "+" : ""}{p.roi_val}% ROI</div>
                      </td>
                      <td><span className={`comm-badge ${commClass}`}>{p.commSt}</span></td>
                      <td><button className="abt" onClick={(e) => { e.stopPropagation(); setSelectedPartner(p); setShowProfilePanel(true) }}>View →</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="pgbar">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#888" }}>Rows:</span>
                <select className="rs" value={rowsPerPage} onChange={e => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1) }}>
                  <option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
                </select>
              </div>
              <div style={{ fontSize: 11, color: "#888" }}>{(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredPartners.length)} of {filteredPartners.length}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button className="pb" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`pb ${n === currentPage ? "pb-active" : ""}`} onClick={() => setCurrentPage(n)}>{n}</button>
                ))}
                <button className="pb" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Campaigns List ── */}
      {activeTab === 1 && !showCampaignDetail && (
        <div className="content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="slbl" style={{ marginBottom: 0 }}>All campaigns</div>
            <button className="btn-primary" onClick={() => setShowCampaignModal(true)}>+ New Campaign</button>
          </div>
          {campaigns.map(c => {
            const tp = c.partners.reduce((a, p) => a + p.deliverables.length, 0)
            const dp = c.partners.reduce((a, p) => a + p.deliverables.filter(d => d.posted).length, 0)
            const campRev = c.partners.reduce((a, p) => a + p.revenue, 0)
            const campSpend = c.partners.reduce((a, p) => a + (p.fee || 0) + (p.productCost || 0) + (p.commPaid || 0), 0)
            return (
              <div key={c.id} className="camp-card" onClick={() => { setSelectedCampaign(c); setShowCampaignDetail(true) }}>
                <div className="cc-header">
                  <div>
                    <div className="cc-name">{c.name} <span style={{ fontSize: 10, fontWeight: 400, color: "#888" }}>{c.type}</span></div>
                    <div className="cc-meta">{c.start} → {c.end || "Open-ended"}{c.budget ? ` · Budget: ${formatMoney(c.budget)}` : ""}</div>
                  </div>
                  <span className={`cs c-${c.status.toLowerCase()}`}>{c.status}</span>
                </div>
                <div className="cc-stats">
                  <div><div className="csv">{c.partners.length}</div><div className="csl">creators</div></div>
                  <div><div className="csv">{dp}/{tp}</div><div className="csl">posts done</div></div>
                  <div><div className="csv" style={{ color: "#1FAE5B" }}>{formatMoney(campRev)}</div><div className="csl">revenue</div></div>
                  <div><div className="csv">{campSpend > 0 ? (campRev / campSpend).toFixed(1) + "x" : "—"}</div><div className="csl">ROAS</div></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Campaign Detail ── */}
      {showCampaignDetail && selectedCampaign && renderCampaignDetail(selectedCampaign)}

      {/* ── Modals ── */}
      <TierSettingsModal isOpen={showTierModal} onClose={() => setShowTierModal(false)} onSave={handleTierSave} initialSettings={{ bronzeMin: 0, bronzeMax: tierBronzeMax, silverMin: tierBronzeMax + 1, silverMax: tierSilverMax, goldMin: tierSilverMax + 1 }} />
      <AddPartnerModal isOpen={showAddPartnerModal} onClose={() => setShowAddPartnerModal(false)} onAdd={handleAddPartner} />
      <NewCampaignModal isOpen={showCampaignModal} onClose={() => setShowCampaignModal(false)} onCreate={handleCreateCampaign} partners={partners} />

      {/* ── Profile Sidebar (shared component) ── */}
      {showProfilePanel && selectedPartner && (
        <InfluencerProfileSidebar
          partner={selectedPartner}
          campaigns={campaigns}
          allPartners={partners}
          onClose={() => setShowProfilePanel(false)}
        />
      )}

      <style jsx>{`
        .topbar { background: #fff; border-bottom: 0.5px solid rgba(0,0,0,0.08); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .topbar-sub { font-size: 11px; color: #888; margin-top: 2px; }
        .topbar-actions { display: flex; gap: 8px; }
        .btn-primary { background: #1FAE5B; color: #fff; border: none; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 500; font-family: 'Inter', sans-serif; }
        .btn-primary:hover { background: #0F6B3E; }
        .btn-outline { background: transparent; border: 0.5px solid rgba(0,0,0,0.2); padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 500; color: #555; font-family: 'Inter', sans-serif; }
        .tab-search-row { background: #fff; border-bottom: 0.5px solid rgba(0,0,0,0.08); padding: 0 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .tab-bar { display: flex; }
        .tab { padding: 10px 16px; cursor: pointer; font-size: 12px; font-weight: 500; color: #888; border-bottom: 2px solid transparent; white-space: nowrap; }
        .tab.active { color: #1FAE5B; border-bottom-color: #1FAE5B; }
        .tab:hover:not(.active) { color: #1E1E1E; }
        .sfg { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
        .sw { position: relative; }
        .sb { font-size: 12px; padding: 6px 10px 6px 28px; border-radius: 8px; border: 0.5px solid rgba(0,0,0,0.15); background: #f7f9f8; color: #1E1E1E; font-family: 'Inter', sans-serif; width: 200px; }
        .fw { position: relative; }
        .fp { position: absolute; top: calc(100% + 6px); right: 0; z-index: 200; background: #fff; border: 0.5px solid rgba(0,0,0,0.12); border-radius: 10px; padding: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); width: 360px; }
        .fp-title { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
        .fg { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .fg label { font-size: 11px; color: #888; display: block; margin-bottom: 4px; }
        .fg select { width: 100%; font-size: 12px; padding: 5px 8px; border-radius: 7px; border: 0.5px solid rgba(0,0,0,0.15); background: #f7f9f8; color: #1E1E1E; font-family: 'Inter', sans-serif; }
        .fa { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 0.5px solid rgba(0,0,0,0.06); }
        .fc-btn { font-size: 11px; padding: 5px 10px; border-radius: 7px; border: 0.5px solid rgba(0,0,0,0.15); background: transparent; color: #888; cursor: pointer; font-family: 'Inter', sans-serif; }
        .fa-btn { font-size: 11px; padding: 5px 12px; border-radius: 7px; border: none; background: #1FAE5B; color: #fff; cursor: pointer; font-family: 'Inter', sans-serif; }
        .content { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
        .slbl { font-size: 10px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #888; margin-bottom: 8px; }
        .tw { background: #fff; border: 0.5px solid rgba(0,0,0,0.08); border-radius: 10px; overflow: hidden; }
        .pt { width: 100%; border-collapse: collapse; font-size: 12px; }
        .pt thead { background: #fafaf9; }
        .pt th { padding: 9px 10px; font-weight: 500; font-size: 11px; border-bottom: 0.5px solid rgba(0,0,0,0.08); white-space: nowrap; user-select: none; }
        .pt td { padding: 9px 10px; border-bottom: 0.5px solid rgba(0,0,0,0.05); color: #1E1E1E; vertical-align: middle; }
        .pt tr:last-child td { border-bottom: none; }
        .dr:hover td { background: #fafaf9; cursor: pointer; }
        .thi { display: flex; align-items: center; gap: 3px; cursor: pointer; }
        .thi:hover .cl { color: #1E1E1E; }
        .cl { font-size: 11px; color: #888; }
        .sa { font-size: 10px; color: #ccc; }
        .tb { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
        .tg { background: #fff8e1; color: #854F0B; }
        .ts { background: #f0f0f0; color: #444; }
        .tbr { background: #fdf0e8; color: #7a3e1a; }
        .cvr { font-size: 12px; color: #2C8EC4; font-weight: 500; }
        .roas-pos { color: #1FAE5B; font-weight: 600; font-size: 11px; }
        .roas-neg { color: #E24B4A; font-weight: 600; font-size: 11px; }
        .comm-badge { display: inline-block; font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 6px; }
        .comm-invited, .comm-pending { background: #fff8e1; color: #854F0B; }
        .comm-joined { background: #e6f9ee; color: #0F6B3E; }
        .comm-notinterested { background: #fdecea; color: #a32d2d; }
        .comm-left { background: #f0f0ee; color: #888; }
        .abt { font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 0.5px solid rgba(0,0,0,0.15); background: transparent; color: #555; cursor: pointer; }
        .pgbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #fafaf9; border-top: 0.5px solid rgba(0,0,0,0.06); flex-wrap: wrap; gap: 8px; }
        .pb { font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 0.5px solid rgba(0,0,0,0.15); background: #fff; color: #555; cursor: pointer; }
        .pb:disabled { color: #ccc; cursor: not-allowed; }
        .pb-active { background: #1FAE5B; color: #fff; border-color: #1FAE5B; }
        .rs { font-size: 11px; padding: 4px 8px; border-radius: 6px; border: 0.5px solid rgba(0,0,0,0.15); background: #fff; color: #555; cursor: pointer; font-family: 'Inter', sans-serif; }
        .camp-card { background: #fff; border: 0.5px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; cursor: pointer; }
        .camp-card:hover { border-color: #1FAE5B; }
        .cc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .cc-name { font-size: 14px; font-weight: 600; color: #1E1E1E; }
        .cc-meta { font-size: 11px; color: #888; margin-top: 2px; }
        .cc-stats { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
        .csv { font-size: 15px; font-weight: 600; color: #1E1E1E; }
        .csl { font-size: 10px; color: #888; }
        .cs { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
        .c-draft { background: #f0f0ee; color: #888; }
        .c-active { background: #e6f9ee; color: #0F6B3E; }
        .c-completed { background: #e6f1fb; color: #185FA5; }
        .cd-section { background: #fff; border: 0.5px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
        .cd-section-title { font-size: 11px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .cd-th { text-align: left; padding: 8px 10px; font-size: 10px; color: #888; font-weight: 500; border-bottom: 0.5px solid rgba(0,0,0,0.08); }
        .kpi-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .kpi-card { background: #fff; border: 0.5px solid rgba(0,0,0,0.08); border-radius: 10px; padding: 12px 14px; }
        .kpi-l { font-size: 10px; color: #888; }
        .kpi-v { font-size: 17px; font-weight: 600; color: #1E1E1E; margin-top: 2px; }
        .kpi-v.g { color: #1FAE5B; }
        .kpi-v.r { color: #E24B4A; }
        .spend-breakdown { font-size: 11px; color: #888; margin-top: 3px; }
        .profit-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 20px; }
        .profit-yes { background: #e6f9ee; color: #0F6B3E; }
        .profit-no { background: #fdecea; color: #a32d2d; }
        .pay-badge { display: inline-block; font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 6px; }
        .pw { background: #fff8e1; color: #854F0B; }
        .pr { background: #e6f1fb; color: #185FA5; }
        .ps { background: #e6f9ee; color: #0F6B3E; }
        .pd { background: #f0f0ee; color: #444; }
      `}</style>
    </div>
  )
}