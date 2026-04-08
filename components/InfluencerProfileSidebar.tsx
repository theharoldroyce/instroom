"use client"

import { useState } from "react"

// ─── Types ──────────────────────────────────────────────────────────────────
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

export interface Campaign {
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

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatMoney(value: number): string {
  return "$" + Math.round(value).toLocaleString()
}

function formatROAS(rev: number, spend: number): string {
  return spend > 0 ? (rev / spend).toFixed(1) + "x" : "—"
}

function formatFollowers(fol: number): string {
  return fol >= 1000 ? (fol / 1000).toFixed(1) + "K" : String(fol)
}

function autoTier(rev: number): string {
  if (rev >= 10001) return "Gold"
  if (rev >= 2001) return "Silver"
  return "Bronze"
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function InfluencerProfileSidebar({
  partner,
  campaigns,
  allPartners,
  onClose,
}: {
  partner: Partner
  campaigns: Campaign[]
  allPartners: Partner[]
  onClose: () => void
}) {
  const [profileTab, setProfileTab] = useState(0)
  const [pipelineStatus, setPipelineStatus] = useState("Agreed")
  const [partnerType, setPartnerType] = useState("Paid")

  // Order tab state
  const [orderData, setOrderData] = useState({
    firstName: partner.firstName,
    lastName: partner.lastName,
    contactNumber: "",
    productName: "",
    orderNumber: "",
    productCost: "",
    discountCode: "CODE" + partner.firstName.toUpperCase(),
    affiliateLink: "https://instroom.io/ref/" + partner.firstName.toLowerCase(),
    shippingAddress: "",
    trackingLink: "",
  })

  // Post tab state
  const [postData, setPostData] = useState({
    postLink: "",
    likes: "",
    sales: "",
    driveLink: "",
    comments: "",
    amount: "",
    usageRights: "",
    views: "",
    clicks: "",
  })

  const tier = partner.tierOverride || autoTier(partner.rev)
  const postCVR =
    postData.clicks && parseFloat(postData.clicks) > 0
      ? ((parseFloat(postData.sales || "0") / parseFloat(postData.clicks)) * 100).toFixed(2) + "%"
      : ""

  // Birthday proximity
  const now = new Date("2026-04-01")
  const bday = partner.birthday ? new Date(partner.birthday) : null
  let bdayPill = ""
  if (bday) {
    const nb = new Date(now.getFullYear(), bday.getMonth(), bday.getDate())
    if (nb < now) nb.setFullYear(now.getFullYear() + 1)
    const du = Math.ceil((nb.getTime() - now.getTime()) / 86400000)
    if (du <= 30) bdayPill = `in ${du}d`
  }

  // Stats: best month
  const bestMonth = partner.monthly.reduce((a, x) => (x.rev > a.rev ? x : a), partner.monthly[0])

  // Campaign count for this partner
  const campCount = campaigns.filter((c) => c.partners.some((cp) => cp.pid === partner.id)).length

  const tabLabels = ["Basic", "Order", "Post", "Stats"]

  return (
    <>
      <div className="po open" onClick={onClose} />
      <div className="pp open">
        {/* Header */}
        <div className="pph">
          <div className="ppt">Influencer Profile</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div className="pav">
              {partner.firstName ? partner.firstName[0] : partner.handle[1].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div className="pnm">
                {partner.firstName} {partner.lastName}
              </div>
              <div className="phd">{partner.handle}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 10, color: "#888" }}>Pipeline</span>
                <select
                  className="ssel"
                  value={pipelineStatus}
                  onChange={(e) => setPipelineStatus(e.target.value)}
                >
                  <option>For Outreach</option>
                  <option>In Conversation</option>
                  <option>Agreed</option>
                  <option>Posted</option>
                  <option>Not Interested</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 10, color: "#888" }}>Type</span>
                <select
                  className="tsel"
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value)}
                >
                  <option>Gifting</option>
                  <option>Paid</option>
                  <option>Affiliate</option>
                </select>
              </div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  color: "#888",
                  cursor: "pointer",
                  alignSelf: "flex-end",
                  paddingBottom: 4,
                }}
                onClick={onClose}
              >
                ×
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="atag plat">{partner.plat}</button>
            <button className="atag">Send Email</button>
            <button className="atag">Send DM</button>
            <button className="atag">Follow up</button>
          </div>
        </div>

        {/* Inner Tabs */}
        <div className="pit-bar">
          {tabLabels.map((tab, idx) => (
            <div
              key={idx}
              className={`pit ${profileTab === idx ? "active" : ""}`}
              onClick={() => setProfileTab(idx)}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div className="ppb">
          {/* ── Basic Tab ── */}
          {profileTab === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="sr4">
                <div className="sbox">
                  <div className="slb-prof">Followers</div>
                  <div className="sval-prof">{formatFollowers(partner.fol)}</div>
                </div>
                <div className="sbox">
                  <div className="slb-prof">Eng Rate</div>
                  <div className="sval-prof">{partner.eng}%</div>
                </div>
                <div className="sbox">
                  <div className="slb-prof">Avg Views</div>
                  <div className="sval-prof">{formatFollowers(partner.avgV)}</div>
                </div>
                <div className="sbox">
                  <div className="slb-prof">GMV</div>
                  <div className="sval-prof">{formatMoney(partner.gmv)}</div>
                </div>
              </div>
              <div className="fgrd">
                <div className="frow">
                  <div className="flbl">Location</div>
                  <div className="fval">{partner.loc}</div>
                </div>
                <div className="frow">
                  <div className="flbl">Niche</div>
                  <div className="fval">{partner.niche}</div>
                </div>
                <div className="frow">
                  <div className="flbl">Gender</div>
                  <div className="fval">{partner.gend || "—"}</div>
                </div>
                <div className="frow">
                  <div className="flbl">Platform</div>
                  <div className="fval">{partner.plat}</div>
                </div>
                <div className="frow">
                  <div className="flbl">Birthday</div>
                  <div className="fval">
                    {partner.birthday || "—"}
                    {bdayPill && <span className="bp">{bdayPill}</span>}
                  </div>
                </div>
                <div className="frow">
                  <div className="flbl">Commission</div>
                  <div className="fval">{partner.defComm > 0 ? partner.defComm + "%" : "—"}</div>
                </div>
                <div className="frow">
                  <div className="flbl">Tier</div>
                  <div className="fval">{tier}</div>
                </div>
                <div className="frow">
                  <div className="flbl">Community</div>
                  <div className="fval">{partner.commSt}</div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>Notes</div>
                <textarea
                  className="pfi"
                  style={{ minHeight: 80, resize: "vertical" }}
                  placeholder="Add notes..."
                />
              </div>
            </div>
          )}

          {/* ── Order Tab ── */}
          {profileTab === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="pfr">
                <div className="pfg">
                  <div className="pfl">First name</div>
                  <input
                    className="pfi"
                    value={orderData.firstName}
                    onChange={(e) => setOrderData((d) => ({ ...d, firstName: e.target.value }))}
                  />
                </div>
                <div className="pfg">
                  <div className="pfl">Last name</div>
                  <input
                    className="pfi"
                    value={orderData.lastName}
                    onChange={(e) => setOrderData((d) => ({ ...d, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="pfg">
                <div className="pfl">Contact Number</div>
                <input
                  className="pfi"
                  value={orderData.contactNumber}
                  onChange={(e) => setOrderData((d) => ({ ...d, contactNumber: e.target.value }))}
                  placeholder="Contact Number"
                />
              </div>
              <div className="pfg">
                <div className="pfl">Product Name</div>
                <input
                  className="pfi"
                  value={orderData.productName}
                  onChange={(e) => setOrderData((d) => ({ ...d, productName: e.target.value }))}
                  placeholder="Product Name"
                />
              </div>
              <div className="pfg">
                <div className="pfl">Order Number</div>
                <input
                  className="pfi"
                  value={orderData.orderNumber}
                  onChange={(e) => setOrderData((d) => ({ ...d, orderNumber: e.target.value }))}
                  placeholder="Order Number"
                />
              </div>
              <div className="pfr">
                <div className="pfg">
                  <div className="pfl">Product Cost</div>
                  <input
                    className="pfi"
                    value={orderData.productCost}
                    onChange={(e) => setOrderData((d) => ({ ...d, productCost: e.target.value }))}
                    placeholder="Product Cost"
                  />
                </div>
                <div className="pfg">
                  <div className="pfl">Discount Code</div>
                  <input
                    className="pfi"
                    value={orderData.discountCode}
                    onChange={(e) => setOrderData((d) => ({ ...d, discountCode: e.target.value }))}
                  />
                </div>
              </div>
              <div className="pfg">
                <div className="pfl">Affiliate Link</div>
                <input
                  className="pfi"
                  value={orderData.affiliateLink}
                  onChange={(e) => setOrderData((d) => ({ ...d, affiliateLink: e.target.value }))}
                />
              </div>
              <div className="pfg">
                <div className="pfl">Shipping Address</div>
                <input
                  className="pfi"
                  value={orderData.shippingAddress}
                  onChange={(e) => setOrderData((d) => ({ ...d, shippingAddress: e.target.value }))}
                  placeholder="Shipping Address"
                />
              </div>
              <div className="pfg">
                <div className="pfl">Tracking Link</div>
                <input
                  className="pfi"
                  value={orderData.trackingLink}
                  onChange={(e) => setOrderData((d) => ({ ...d, trackingLink: e.target.value }))}
                  placeholder="Tracking Link"
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-primary" style={{ fontSize: 12 }}>
                  Save
                </button>
              </div>
            </div>
          )}

          {/* ── Post Tab ── */}
          {profileTab === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="pfr">
                <div className="pfg">
                  <div className="pfl">Post Link</div>
                  <input
                    className="pfi"
                    value={postData.postLink}
                    onChange={(e) => setPostData((d) => ({ ...d, postLink: e.target.value }))}
                    placeholder="Post Link"
                  />
                </div>
                <div className="pfg">
                  <div className="pfl">Likes</div>
                  <input
                    className="pfi"
                    value={postData.likes}
                    onChange={(e) => setPostData((d) => ({ ...d, likes: e.target.value }))}
                    placeholder="Likes"
                  />
                </div>
              </div>
              <div className="pfr">
                <div className="pfg">
                  <div className="pfl">Sales</div>
                  <input
                    className="pfi"
                    value={postData.sales}
                    onChange={(e) => setPostData((d) => ({ ...d, sales: e.target.value }))}
                    placeholder="Sales"
                  />
                </div>
                <div className="pfg">
                  <div className="pfl">Drive Link</div>
                  <input
                    className="pfi"
                    value={postData.driveLink}
                    onChange={(e) => setPostData((d) => ({ ...d, driveLink: e.target.value }))}
                    placeholder="Drive Link"
                  />
                </div>
              </div>
              <div className="pfr">
                <div className="pfg">
                  <div className="pfl">Comments</div>
                  <input
                    className="pfi"
                    value={postData.comments}
                    onChange={(e) => setPostData((d) => ({ ...d, comments: e.target.value }))}
                    placeholder="Comments"
                  />
                </div>
                <div className="pfg">
                  <div className="pfl">Amount</div>
                  <input
                    className="pfi"
                    value={postData.amount}
                    onChange={(e) => setPostData((d) => ({ ...d, amount: e.target.value }))}
                    placeholder="Amount ($)"
                  />
                </div>
              </div>
              <div className="pfr">
                <div className="pfg">
                  <div className="pfl">Usage Rights</div>
                  <select
                    className="pfi"
                    value={postData.usageRights}
                    onChange={(e) => setPostData((d) => ({ ...d, usageRights: e.target.value }))}
                  >
                    <option value="">Select...</option>
                    <option>Granted</option>
                    <option>Not Granted</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className="pfg">
                  <div className="pfl">Views</div>
                  <input
                    className="pfi"
                    value={postData.views}
                    onChange={(e) => setPostData((d) => ({ ...d, views: e.target.value }))}
                    placeholder="Views"
                  />
                </div>
              </div>
              <div className="pfr">
                <div className="pfg">
                  <div className="pfl">Clicks</div>
                  <input
                    className="pfi"
                    value={postData.clicks}
                    onChange={(e) => setPostData((d) => ({ ...d, clicks: e.target.value }))}
                    placeholder="Clicks"
                  />
                </div>
                <div className="pfg">
                  <div className="pfl">CVR (auto)</div>
                  <input
                    className="pfi"
                    readOnly
                    style={{ background: "#f7f9f8", color: "#2C8EC4" }}
                    value={postCVR}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-primary" style={{ fontSize: 12 }}>
                  Save
                </button>
              </div>
            </div>
          )}

          {/* ── Stats Tab ── */}
          {profileTab === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div className="stit">Performance — all campaigns combined</div>
              <div className="skg">
                <div className="skc nt">
                  <div className="skv-dark">{(partner.hClicks || 0).toLocaleString()}</div>
                  <div className="skl">Total clicks</div>
                </div>
                <div className="skc bl">
                  <div className="skv-blue">{partner.hCVR || 0}%</div>
                  <div className="skl">CVR</div>
                </div>
                <div className="skc nt">
                  <div className="skv-dark">{(partner.hSales || 0).toLocaleString()}</div>
                  <div className="skl">Total sales (units)</div>
                </div>
                <div className="skc">
                  <div className="skv-green">{formatMoney(partner.hRev || 0)}</div>
                  <div className="skl">Total revenue</div>
                </div>
                <div className="skc">
                  <div className="skv-green">{formatMoney(partner.totalSpend || 0)}</div>
                  <div className="skl">Total spend</div>
                </div>
                <div className="skc">
                  <div className={partner.roas_val >= 1 ? "skv-green" : "skv-red"}>
                    {formatROAS(partner.rev, partner.totalSpend)}
                  </div>
                  <div className="skl">ROAS</div>
                </div>
              </div>
              <div className="spend-breakdown-box">
                <strong style={{ color: "#555" }}>Spend breakdown:</strong>{" "}
                {formatMoney(partner.prodCost)} product COGS + {formatMoney(partner.feesPaid)} fees
                paid + {formatMoney(partner.commPaid)} commission paid
              </div>

              <div className="stit">Engagement</div>
              <div className="skg">
                <div className="skc nt">
                  <div className="skv-dark">{formatFollowers(partner.fol)}</div>
                  <div className="skl">Followers</div>
                </div>
                <div className="skc bl">
                  <div className="skv-blue">{partner.eng || 0}%</div>
                  <div className="skl">Eng. rate</div>
                </div>
                <div className="skc nt">
                  <div className="skv-dark">{formatFollowers(partner.avgV)}</div>
                  <div className="skl">Avg views/post</div>
                </div>
                <div className="skc nt">
                  <div className="skv-dark">{partner.ppm || 0}</div>
                  <div className="skl">Posts/month</div>
                </div>
                <div className="skc">
                  <div className="skv-green">{formatMoney(partner.gmv || 0)}</div>
                  <div className="skl">GMV (lifetime)</div>
                </div>
                <div className="skc nt">
                  <div className="skv-dark">{campCount}</div>
                  <div className="skl">Campaigns</div>
                </div>
              </div>

              <div className="stit">Monthly breakdown</div>
              <div className="mg">
                {partner.monthly.map((m) => (
                  <div
                    key={m.month}
                    className={`mc2 ${m.month === bestMonth.month ? "best" : ""}`}
                  >
                    <div className="mn">{m.month}</div>
                    <div className={`mv ${m.month === bestMonth.month ? "mv-best" : ""}`}>
                      {formatMoney(m.rev)}
                    </div>
                    <div className="ms-txt">{m.posts} posts</div>
                    <div className="ms-txt">{m.sales} sales</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          /* ── Overlay & Panel Shell ── */
          .po {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.3);
            z-index: 400;
          }
          .pp {
            position: fixed;
            top: 0;
            right: 0;
            width: 520px;
            max-width: 100vw;
            height: 100%;
            background: #fff;
            box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
            z-index: 500;
            display: flex;
            flex-direction: column;
          }

          /* ── Header ── */
          .pph {
            padding: 16px 20px;
            border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
          }
          .ppt {
            font-size: 15px;
            font-weight: 600;
            color: #1e1e1e;
            margin-bottom: 12px;
          }
          .pav {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: #1fae5b;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 700;
            color: #fff;
            flex-shrink: 0;
          }
          .pnm {
            font-size: 15px;
            font-weight: 600;
            color: #1e1e1e;
          }
          .phd {
            font-size: 12px;
            color: #888;
            margin-top: 2px;
          }
          .ssel,
          .tsel {
            font-size: 11px;
            padding: 5px 10px;
            border-radius: 8px;
            border: 0.5px solid #f4b740;
            background: #fffbeb;
            color: #854f0b;
            cursor: pointer;
            font-family: "Inter", sans-serif;
            font-weight: 500;
          }
          .atag {
            font-size: 12px;
            font-weight: 500;
            padding: 6px 14px;
            border-radius: 20px;
            cursor: pointer;
            border: 1px solid rgba(0, 0, 0, 0.15);
            background: #f7f9f8;
            color: #555;
          }
          .atag.plat {
            background: #1fae5b;
            color: #fff;
            border-color: #1fae5b;
          }

          /* ── Inner Tab Bar ── */
          .pit-bar {
            display: flex;
            gap: 0;
            padding: 0 20px;
            border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
          }
          .pit {
            font-size: 12px;
            font-weight: 500;
            padding: 10px 14px;
            cursor: pointer;
            color: #888;
            border-bottom: 2px solid transparent;
            white-space: nowrap;
          }
          .pit.active {
            color: #1fae5b;
            border-bottom-color: #1fae5b;
          }

          /* ── Scrollable Body ── */
          .ppb {
            flex: 1;
            overflow-y: auto;
            padding: 16px 20px;
          }

          /* ── Basic Tab — Stat Row ── */
          .sr4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            background: #f7f9f8;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 14px;
          }
          .sbox {
            text-align: center;
          }
          .slb-prof {
            font-size: 10px;
            color: #888;
          }
          .sval-prof {
            font-size: 15px;
            font-weight: 600;
            color: #1e1e1e;
            margin-top: 2px;
          }

          /* ── Basic Tab — Field Grid ── */
          .fgrd {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .frow {
            padding: 8px 0;
            border-bottom: 0.5px solid rgba(0, 0, 0, 0.05);
          }
          .flbl {
            font-size: 10px;
            color: #888;
            margin-bottom: 2px;
          }
          .fval {
            font-size: 12px;
            color: #1e1e1e;
            font-weight: 500;
          }
          .bp {
            display: inline-block;
            font-size: 10px;
            padding: 1px 7px;
            border-radius: 6px;
            background: #fce4ec;
            color: #880e4f;
            margin-left: 6px;
          }

          /* ── Order & Post Tabs — Form Fields ── */
          .pfr {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .pfg {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 10px;
          }
          .pfl {
            font-size: 10px;
            color: #888;
          }
          .pfi {
            width: 100%;
            font-size: 12px;
            padding: 8px 10px;
            border-radius: 8px;
            border: 0.5px solid rgba(0, 0, 0, 0.15);
            background: #fff;
            color: #1e1e1e;
            font-family: "Inter", sans-serif;
          }
          .pfi:focus {
            outline: none;
            border-color: #1fae5b;
          }
          .pfi::placeholder {
            color: #bbb;
          }
          textarea.pfi {
            resize: vertical;
            min-height: 70px;
          }

          /* ── Stats Tab — Section Title ── */
          .stit {
            font-size: 11px;
            font-weight: 600;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 10px 0 6px;
            border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
            margin-bottom: 10px;
          }

          /* ── Stats Tab — KPI Grid ── */
          .skg {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 16px;
          }
          .skc {
            background: #f7f9f8;
            border-radius: 8px;
            padding: 10px 12px;
            text-align: center;
          }
          .skl {
            font-size: 10px;
            color: #888;
            margin-top: 2px;
          }
          .skv-green {
            font-size: 16px;
            font-weight: 600;
            color: #1fae5b;
          }
          .skv-dark {
            font-size: 16px;
            font-weight: 600;
            color: #1e1e1e;
          }
          .skv-blue {
            font-size: 16px;
            font-weight: 600;
            color: #2c8ec4;
          }
          .skv-red {
            font-size: 16px;
            font-weight: 600;
            color: #e24b4a;
          }

          /* ── Stats Tab — Spend Breakdown ── */
          .spend-breakdown-box {
            background: #f7f9f8;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 16px;
            font-size: 11px;
            color: #888;
          }

          /* ── Stats Tab — Monthly Grid ── */
          .mg {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 6px;
          }
          .mc2 {
            background: #f7f9f8;
            border-radius: 6px;
            padding: 8px 6px;
            text-align: center;
          }
          .mc2.best {
            background: #e6f9ee;
          }
          .mn {
            font-size: 10px;
            color: #888;
          }
          .mv {
            font-size: 12px;
            font-weight: 600;
            color: #1e1e1e;
            margin-top: 2px;
          }
          .mv-best {
            color: #1fae5b;
          }
          .ms-txt {
            font-size: 10px;
            color: #888;
          }

          /* ── Shared Button ── */
          .btn-primary {
            background: #1fae5b;
            color: #fff;
            border: none;
            padding: 6px 14px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 500;
            font-family: "Inter", sans-serif;
          }
          .btn-primary:hover {
            background: #0f6b3e;
          }
        `}</style>
      </div>
    </>
  )
}