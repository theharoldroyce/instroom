// C:\Users\reyme\Videos\instroom\components\InfluencerProfileSidebar.tsx

"use client"

import { useState } from "react"

// ─── Types ──────────────────────────────────────────────────────────────────
interface MonthlyData {
  month: string; posts: number; clicks: number; rev: number; eng: number; sales: number
}
interface ProductSend {
  date: string; product: string; cost: number; reason: string
}

export interface Partner {
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
  clicks: number; cvr: number; sales: number; aov: number; rev: number
  fol: number; eng: number; avgV: number; gmv: number
  added: Date
  prods: ProductSend[]
  prodCost: number; feesPaid: number; commPaid: number; totalSpend: number
  roi_val: number; roas_val: number
  monthly: MonthlyData[]
  ppm: number; hClicks: number; hSales: number; hRev: number; hCVR: number; hPosts: number
  // ── From Influencer DB table ──
  avg_likes?: number | null
  avg_comments?: number | null
  avg_views?: number | null
  follower_count?: number | null
  engagement_rate?: number | null
}

interface Deliverable { name: string; posted: boolean }
interface CampaignPartner {
  pid: number; payStatus: number; deliverables: Deliverable[]
  fee: number; productCost: number; commPaid: number
  revenue: number; views: number; likes: number; engRate: number
}
export interface Campaign {
  id: number; name: string; status: string; start: string; end: string
  budget: number; type: string; notes: string; partners: CampaignPartner[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatMoney(v: number) { return "$" + Math.round(v).toLocaleString() }
function formatROAS(rev: number, spend: number) { return spend > 0 ? (rev / spend).toFixed(1) + "x" : "—" }
function autoTier(rev: number) { return rev >= 10001 ? "Gold" : rev >= 2001 ? "Silver" : "Bronze" }

// Safely format a numeric metric from the DB
function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—"
  const num = Number(n)
  if (isNaN(num)) return "—"
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M"
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K"
  return String(num)
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function InfluencerProfileSidebar({
  partner, campaigns, allPartners, onClose,
}: {
  partner: Partner; campaigns: Campaign[]; allPartners: Partner[]; onClose: () => void
}) {
  const [profileTab, setProfileTab] = useState(0)
  const [pipelineStatus, setPipelineStatus] = useState("Agreed")
  const [partnerType, setPartnerType] = useState("Paid")
  const [orderData, setOrderData] = useState({
    firstName: partner.firstName, lastName: partner.lastName, contactNumber: "",
    productName: "", orderNumber: "", productCost: "",
    discountCode: "CODE" + partner.firstName.toUpperCase(),
    affiliateLink: "https://instroom.io/ref/" + partner.firstName.toLowerCase(),
    shippingAddress: "", trackingLink: "",
  })
  const [postData, setPostData] = useState({
    postLink: "", likes: "", sales: "", driveLink: "",
    comments: "", amount: "", usageRights: "", views: "", clicks: "",
  })

  const tier = partner.tierOverride || autoTier(partner.rev)
  const postCVR = postData.clicks && parseFloat(postData.clicks) > 0
    ? ((parseFloat(postData.sales || "0") / parseFloat(postData.clicks)) * 100).toFixed(2) + "%" : ""

  const now = new Date("2026-04-01")
  const bday = partner.birthday ? new Date(partner.birthday) : null
  let bdayPill = ""
  if (bday) {
    const nb = new Date(now.getFullYear(), bday.getMonth(), bday.getDate())
    if (nb < now) nb.setFullYear(now.getFullYear() + 1)
    const du = Math.ceil((nb.getTime() - now.getTime()) / 86400000)
    if (du <= 30) bdayPill = `in ${du}d`
  }

  const bestMonth = partner.monthly.reduce((a, x) => (x.rev > a.rev ? x : a), partner.monthly[0])
  const campCount = campaigns.filter(c => c.partners.some(cp => cp.pid === partner.id)).length

  // ── Resolve DB metrics — prefer explicit DB fields, fall back to legacy props ──
  const avgLikes    = fmt(partner.avg_likes)
  const avgComments = fmt(partner.avg_comments)
  const avgViews    = fmt(partner.avg_views ?? partner.avgV)
  const followers   = fmt(partner.follower_count ?? partner.fol)
  const engRate     = partner.engagement_rate != null ? `${partner.engagement_rate}%`
                    : partner.eng != null ? `${partner.eng}%` : "—"

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:400, cursor:"pointer" }} />

      <div className="pp">
        {/* ── Header ── */}
        <div className="pph">
          <div className="ppt">Influencer Profile</div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
            <div className="pav">{partner.firstName ? partner.firstName[0] : partner.handle[1]?.toUpperCase()}</div>
            <div style={{ flex:1 }}>
              <div className="pnm">{partner.firstName} {partner.lastName}</div>
              <div className="phd">{partner.handle}</div>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <span style={{ fontSize:9, fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em" }}>Pipeline</span>
                <select className="ssel" value={pipelineStatus} onChange={e => setPipelineStatus(e.target.value)}>
                  <option>For Outreach</option><option>In Conversation</option>
                  <option>Agreed</option><option>Posted</option><option>Not Interested</option>
                </select>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <span style={{ fontSize:9, fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em" }}>Type</span>
                <select className="tsel" value={partnerType} onChange={e => setPartnerType(e.target.value)}>
                  <option>Gifting</option><option>Paid</option><option>Affiliate</option>
                </select>
              </div>
              <button onClick={onClose} title="Close" className="close-btn">✕</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button className="atag plat">{partner.plat}</button>
            <button className="atag">Send Email</button>
            <button className="atag">Send DM</button>
            <button className="atag">Follow up</button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="pit-bar">
          {["Basic","Order","Post","Stats"].map((tab,idx) => (
            <div key={idx} className={`pit ${profileTab===idx?"active":""}`} onClick={() => setProfileTab(idx)}>{tab}</div>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="ppb">

          {/* ════════ BASIC TAB ════════ */}
          {profileTab === 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Stat strip — 4 cols */}
              <div className="sr4">
                <div className="sbox"><div className="slb">Followers</div><div className="svl">{followers}</div></div>
                <div className="sbox"><div className="slb">Eng Rate</div><div className="svl" style={{ color:"#2c8ec4" }}>{engRate}</div></div>
                <div className="sbox"><div className="slb">Avg Views</div><div className="svl">{avgViews}</div></div>
                <div className="sbox"><div className="slb">GMV</div><div className="svl" style={{ color:"#1fae5b" }}>{formatMoney(partner.gmv)}</div></div>
              </div>

              {/* ── Avg Metrics — from Influencer DB table ── */}
              <div>
                <div className="section-label">Avg Metrics</div>
                <div className="avg-row">
                  <div className="avg-card">
                    <div className="avg-val">{avgLikes}</div>
                    <div className="avg-lbl">Avg Likes</div>
                  </div>
                  <div className="avg-card">
                    <div className="avg-val">{avgComments}</div>
                    <div className="avg-lbl">Avg Comments</div>
                  </div>
                  <div className="avg-card">
                    <div className="avg-val">{avgViews}</div>
                    <div className="avg-lbl">Avg Views</div>
                  </div>
                </div>
              </div>

              {/* Profile field grid */}
              <div className="fgrd">
                <div className="frow"><div className="flbl">Location</div><div className="fval">{partner.loc || "—"}</div></div>
                <div className="frow"><div className="flbl">Niche</div><div className="fval">{partner.niche || "—"}</div></div>
                <div className="frow"><div className="flbl">Gender</div><div className="fval">{partner.gend || "—"}</div></div>
                <div className="frow"><div className="flbl">Platform</div><div className="fval">{partner.plat}</div></div>
                <div className="frow">
                  <div className="flbl">Birthday</div>
                  <div className="fval">{partner.birthday || "—"}{bdayPill && <span className="bp">{bdayPill}</span>}</div>
                </div>
                <div className="frow"><div className="flbl">Commission</div><div className="fval">{partner.defComm > 0 ? partner.defComm + "%" : "—"}</div></div>
                <div className="frow"><div className="flbl">Tier</div><div className="fval">{tier}</div></div>
                <div className="frow"><div className="flbl">Community</div><div className="fval">{partner.commSt}</div></div>
              </div>

              <div>
                <div style={{ fontSize:10, color:"#888", marginBottom:6 }}>Notes</div>
                <textarea className="pfi" style={{ minHeight:80, resize:"vertical" }} placeholder="Add notes..." />
              </div>
            </div>
          )}

          {/* ════════ ORDER TAB ════════ */}
          {profileTab === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div className="pfr">
                <div className="pfg"><div className="pfl">First name</div><input className="pfi" value={orderData.firstName} onChange={e => setOrderData(d => ({ ...d, firstName:e.target.value }))} /></div>
                <div className="pfg"><div className="pfl">Last name</div><input className="pfi" value={orderData.lastName} onChange={e => setOrderData(d => ({ ...d, lastName:e.target.value }))} /></div>
              </div>
              <div className="pfg"><div className="pfl">Contact Number</div><input className="pfi" value={orderData.contactNumber} onChange={e => setOrderData(d => ({ ...d, contactNumber:e.target.value }))} placeholder="Contact Number" /></div>
              <div className="pfg"><div className="pfl">Product Name</div><input className="pfi" value={orderData.productName} onChange={e => setOrderData(d => ({ ...d, productName:e.target.value }))} placeholder="Product Name" /></div>
              <div className="pfg"><div className="pfl">Order Number</div><input className="pfi" value={orderData.orderNumber} onChange={e => setOrderData(d => ({ ...d, orderNumber:e.target.value }))} placeholder="Order Number" /></div>
              <div className="pfr">
                <div className="pfg"><div className="pfl">Product Cost</div><input className="pfi" value={orderData.productCost} onChange={e => setOrderData(d => ({ ...d, productCost:e.target.value }))} /></div>
                <div className="pfg"><div className="pfl">Discount Code</div><input className="pfi" value={orderData.discountCode} onChange={e => setOrderData(d => ({ ...d, discountCode:e.target.value }))} /></div>
              </div>
              <div className="pfg"><div className="pfl">Affiliate Link</div><input className="pfi" value={orderData.affiliateLink} onChange={e => setOrderData(d => ({ ...d, affiliateLink:e.target.value }))} /></div>
              <div className="pfg"><div className="pfl">Shipping Address</div><input className="pfi" value={orderData.shippingAddress} onChange={e => setOrderData(d => ({ ...d, shippingAddress:e.target.value }))} placeholder="Shipping Address" /></div>
              <div className="pfg"><div className="pfl">Tracking Link</div><input className="pfi" value={orderData.trackingLink} onChange={e => setOrderData(d => ({ ...d, trackingLink:e.target.value }))} placeholder="Tracking Link" /></div>
              <div style={{ display:"flex", justifyContent:"flex-end" }}><button className="btn-primary">Save</button></div>
            </div>
          )}

          {/* ════════ POST TAB ════════ */}
          {profileTab === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div className="pfr">
                <div className="pfg"><div className="pfl">Post Link</div><input className="pfi" value={postData.postLink} onChange={e => setPostData(d => ({ ...d, postLink:e.target.value }))} placeholder="Post Link" /></div>
                <div className="pfg"><div className="pfl">Likes</div><input className="pfi" value={postData.likes} onChange={e => setPostData(d => ({ ...d, likes:e.target.value }))} /></div>
              </div>
              <div className="pfr">
                <div className="pfg"><div className="pfl">Sales</div><input className="pfi" value={postData.sales} onChange={e => setPostData(d => ({ ...d, sales:e.target.value }))} /></div>
                <div className="pfg"><div className="pfl">Drive Link</div><input className="pfi" value={postData.driveLink} onChange={e => setPostData(d => ({ ...d, driveLink:e.target.value }))} /></div>
              </div>
              <div className="pfr">
                <div className="pfg"><div className="pfl">Comments</div><input className="pfi" value={postData.comments} onChange={e => setPostData(d => ({ ...d, comments:e.target.value }))} /></div>
                <div className="pfg"><div className="pfl">Amount ($)</div><input className="pfi" value={postData.amount} onChange={e => setPostData(d => ({ ...d, amount:e.target.value }))} /></div>
              </div>
              <div className="pfr">
                <div className="pfg"><div className="pfl">Usage Rights</div>
                  <select className="pfi" value={postData.usageRights} onChange={e => setPostData(d => ({ ...d, usageRights:e.target.value }))}>
                    <option value="">Select...</option><option>Granted</option><option>Not Granted</option><option>Pending</option>
                  </select>
                </div>
                <div className="pfg"><div className="pfl">Views</div><input className="pfi" value={postData.views} onChange={e => setPostData(d => ({ ...d, views:e.target.value }))} /></div>
              </div>
              <div className="pfr">
                <div className="pfg"><div className="pfl">Clicks</div><input className="pfi" value={postData.clicks} onChange={e => setPostData(d => ({ ...d, clicks:e.target.value }))} /></div>
                <div className="pfg"><div className="pfl">CVR (auto)</div><input className="pfi" readOnly style={{ background:"#f0fdf4", color:"#1fae5b", fontWeight:600 }} value={postCVR || "—"} /></div>
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end" }}><button className="btn-primary">Save</button></div>
            </div>
          )}

          {/* ════════ STATS TAB ════════ */}
          {profileTab === 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              <div className="stit">Performance — all campaigns combined</div>
              <div className="skg">
                <div className="skc"><div className="skv-dark">{(partner.hClicks||0).toLocaleString()}</div><div className="skl">Total clicks</div></div>
                <div className="skc"><div className="skv-blue">{partner.hCVR||0}%</div><div className="skl">CVR</div></div>
                <div className="skc"><div className="skv-dark">{(partner.hSales||0).toLocaleString()}</div><div className="skl">Total sales</div></div>
                <div className="skc"><div className="skv-green">{formatMoney(partner.hRev||0)}</div><div className="skl">Total revenue</div></div>
                <div className="skc"><div className="skv-green">{formatMoney(partner.totalSpend||0)}</div><div className="skl">Total spend</div></div>
                <div className="skc"><div className={partner.roas_val>=1?"skv-green":"skv-red"}>{formatROAS(partner.rev,partner.totalSpend)}</div><div className="skl">ROAS</div></div>
              </div>
              <div className="breakdown-box">
                <strong>Spend breakdown:</strong>{" "}
                {formatMoney(partner.prodCost)} product COGS + {formatMoney(partner.feesPaid)} fees + {formatMoney(partner.commPaid)} commission
              </div>

              <div className="stit">Engagement</div>
              <div className="skg">
                <div className="skc"><div className="skv-dark">{followers}</div><div className="skl">Followers</div></div>
                <div className="skc"><div className="skv-blue">{engRate}</div><div className="skl">Eng. rate</div></div>
                <div className="skc"><div className="skv-dark">{avgViews}</div><div className="skl">Avg views/post</div></div>
                <div className="skc"><div className="skv-dark">{partner.ppm||0}</div><div className="skl">Posts/month</div></div>
                <div className="skc"><div className="skv-green">{formatMoney(partner.gmv||0)}</div><div className="skl">GMV</div></div>
                <div className="skc"><div className="skv-dark">{campCount}</div><div className="skl">Campaigns</div></div>
              </div>

              {/* ── Avg Metrics from DB ── */}
              <div className="stit">Avg Metrics</div>
              <div className="skg">
                <div className="skc"><div className="skv-dark">{avgLikes}</div><div className="skl">Avg Likes</div></div>
                <div className="skc"><div className="skv-dark">{avgComments}</div><div className="skl">Avg Comments</div></div>
                <div className="skc"><div className="skv-dark">{avgViews}</div><div className="skl">Avg Views</div></div>
              </div>

              <div className="stit">Monthly breakdown</div>
              <div className="mg">
                {partner.monthly.map(m => (
                  <div key={m.month} className={`mc2 ${m.month===bestMonth.month?"best":""}`}>
                    <div className="mn">{m.month}</div>
                    <div className={`mv ${m.month===bestMonth.month?"mv-best":""}`}>{formatMoney(m.rev)}</div>
                    <div className="ms-txt">{m.posts} posts</div>
                    <div className="ms-txt">{m.sales} sales</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          /* ── Shell ── */
          .pp { position:fixed; top:0; right:0; width:520px; max-width:100vw; height:100%; background:#fff; box-shadow:-8px 0 40px rgba(0,0,0,0.14); z-index:500; display:flex; flex-direction:column; font-family:"Inter",system-ui,sans-serif; }

          /* ── Header ── */
          .pph { padding:16px 20px; border-bottom:1px solid #f0f0f0; }
          .ppt { font-size:11px; font-weight:600; color:#9ca3af; letter-spacing:.1em; text-transform:uppercase; margin-bottom:12px; }
          .pav { width:44px; height:44px; border-radius:50%; background:#1fae5b; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; color:#fff; flex-shrink:0; box-shadow:0 0 0 3px #dcfce7; }
          .pnm { font-size:15px; font-weight:700; color:#111827; }
          .phd { font-size:12px; color:#6b7280; margin-top:2px; }
          .ssel,.tsel { font-size:11px; padding:5px 10px; border-radius:8px; border:.5px solid #f4b740; background:#fffbeb; color:#854f0b; cursor:pointer; font-family:inherit; font-weight:500; }
          .close-btn { width:30px; height:30px; border-radius:50%; border:1.5px solid #e5e7eb; background:#f9fafb; color:#374151; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; flex-shrink:0; line-height:1; margin-top:14px; transition:background .15s,border-color .15s,color .15s; }
          .close-btn:hover { background:#fee2e2; color:#dc2626; border-color:#fca5a5; }
          .atag { font-size:12px; font-weight:500; padding:6px 14px; border-radius:20px; cursor:pointer; border:1px solid #e5e7eb; background:#f9fafb; color:#555; }
          .atag.plat { background:#1fae5b; color:#fff; border-color:#1fae5b; }

          /* ── Tabs ── */
          .pit-bar { display:flex; gap:0; padding:0 20px; border-bottom:1px solid #f0f0f0; }
          .pit { font-size:12px; font-weight:600; padding:11px 16px; cursor:pointer; color:#9ca3af; border-bottom:2px solid transparent; white-space:nowrap; transition:color .15s; }
          .pit.active { color:#1fae5b; border-bottom-color:#1fae5b; }
          .ppb { flex:1; overflow-y:auto; padding:18px 20px; }

          /* ── Stat strip ── */
          .sr4 { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; background:linear-gradient(135deg,#f0fdf4 0%,#f9fafb 100%); border-radius:12px; padding:14px; margin-bottom:4px; border:1px solid #dcfce7; }
          .sbox { text-align:center; }
          .slb { font-size:9px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.07em; }
          .svl { font-size:16px; font-weight:700; color:#111827; margin-top:3px; }

          /* ── Section label ── */
          .section-label { font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.08em; margin-bottom:8px; padding-top:12px; border-top:1px solid #f3f4f6; }

          /* ── Avg Metrics cards ── */
          .avg-row { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
          .avg-card { background:#fff; border:1.5px solid #e5e7eb; border-radius:10px; padding:12px 8px; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,.05); }
          .avg-val { font-size:18px; font-weight:700; color:#111827; }
          .avg-lbl { font-size:9px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:.07em; margin-top:3px; }

          /* ── Field grid ── */
          .fgrd { display:grid; grid-template-columns:1fr 1fr; }
          .frow { padding:8px 0; border-bottom:.5px solid rgba(0,0,0,.05); }
          .flbl { font-size:9px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em; margin-bottom:2px; }
          .fval { font-size:13px; color:#111827; font-weight:500; }
          .bp { display:inline-block; font-size:10px; padding:1px 7px; border-radius:6px; background:#fce4ec; color:#880e4f; margin-left:6px; }

          /* ── Form fields ── */
          .pfr { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
          .pfg { display:flex; flex-direction:column; gap:4px; margin-bottom:10px; }
          .pfl { font-size:10px; font-weight:600; color:#6b7280; }
          .pfi { width:100%; font-size:12px; padding:8px 10px; border-radius:8px; border:1.5px solid #e5e7eb; background:#f9fafb; color:#111827; font-family:inherit; box-sizing:border-box; outline:none; transition:border-color .15s,background .15s; }
          .pfi:focus { border-color:#1fae5b; background:#fff; }
          .pfi::placeholder { color:#c4c4c4; }
          textarea.pfi { resize:vertical; min-height:70px; }

          /* ── Stats tab ── */
          .stit { font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.08em; padding:12px 0 8px; border-bottom:1px solid #f3f4f6; margin-bottom:10px; }
          .skg { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:14px; }
          .skc { background:#f9fafb; border-radius:10px; padding:10px 12px; text-align:center; border:1px solid #f3f4f6; }
          .skl { font-size:9px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em; margin-top:3px; }
          .skv-green { font-size:16px; font-weight:700; color:#1fae5b; }
          .skv-dark  { font-size:16px; font-weight:700; color:#111827; }
          .skv-blue  { font-size:16px; font-weight:700; color:#2c8ec4; }
          .skv-red   { font-size:16px; font-weight:700; color:#e24b4a; }
          .breakdown-box { background:#f9fafb; border-radius:8px; padding:10px; margin-bottom:14px; font-size:11px; color:#888; border:1px solid #f3f4f6; }
          .mg { display:grid; grid-template-columns:repeat(6,1fr); gap:6px; }
          .mc2 { background:#f9fafb; border-radius:6px; padding:8px 6px; text-align:center; border:1px solid #f3f4f6; }
          .mc2.best { background:#f0fdf4; border-color:#dcfce7; }
          .mn { font-size:10px; color:#888; }
          .mv { font-size:12px; font-weight:600; color:#1e1e1e; margin-top:2px; }
          .mv-best { color:#1fae5b; }
          .ms-txt { font-size:10px; color:#888; }

          .btn-primary { background:#1fae5b; color:#fff; border:none; padding:8px 18px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600; font-family:inherit; transition:background .15s; }
          .btn-primary:hover { background:#0f6b3e; }
        `}</style>
      </div>
    </>
  )
}