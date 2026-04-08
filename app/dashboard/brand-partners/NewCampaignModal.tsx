"use client"

import { useState, useEffect } from "react"

interface Partner {
  id: number
  handle: string
  firstName: string
  lastName: string
  plat: string
  niche: string
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
  rev: number
  fol: number
  eng: number
  avgV: number
  gmv: number
  added: Date
  prodCost: number
  feesPaid: number
  commPaid: number
  totalSpend: number
  roi_val: number
  roas_val: number
  monthly: { month: string; posts: number; rev: number }[]
}

interface Deliverable {
  id: string
  name: string
}

interface PartnerFee {
  partnerId: number
  partnerHandle: string
  deliverables: string[]
  fee: number
}

interface NewCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (campaignData: {
    name: string
    type: string
    startDate: string
    endDate: string
    budget: number
    notes: string
    partnerIds: number[]
    deliverables: string[]
    partnerFees: PartnerFee[]
  }) => void
  partners: Partner[]
}

export default function NewCampaignModal({ isOpen, onClose, onCreate, partners }: NewCampaignModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  
  // Step 1: Campaign details
  const [campaignName, setCampaignName] = useState("")
  const [campaignType, setCampaignType] = useState("")
  const [campaignStartDate, setCampaignStartDate] = useState("")
  const [campaignEndDate, setCampaignEndDate] = useState("")
  const [campaignBudget, setCampaignBudget] = useState("")
  const [campaignNotes, setCampaignNotes] = useState("")
  
  // Step 3: Deliverables & fees
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [newDeliverable, setNewDeliverable] = useState("")
  const [partnerFees, setPartnerFees] = useState<Map<number, { deliverables: string[], fee: number }>>(new Map())

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setCurrentStep(0)
    setSelectedPartnerIds(new Set())
    setSearchQuery("")
    setCampaignName("")
    setCampaignType("")
    setCampaignStartDate("")
    setCampaignEndDate("")
    setCampaignBudget("")
    setCampaignNotes("")
    setDeliverables([])
    setNewDeliverable("")
    setPartnerFees(new Map())
  }

  const togglePartnerSelection = (partnerId: number) => {
    setSelectedPartnerIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(partnerId)) {
        newSet.delete(partnerId)
        // Remove from partnerFees as well
        setPartnerFees(prevFees => {
          const newFees = new Map(prevFees)
          newFees.delete(partnerId)
          return newFees
        })
      } else {
        newSet.add(partnerId)
        // Initialize partner fees
        setPartnerFees(prevFees => {
          const newFees = new Map(prevFees)
          newFees.set(partnerId, { deliverables: [], fee: 0 })
          return newFees
        })
      }
      return newSet
    })
  }

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setDeliverables(prev => [...prev, { id: Date.now().toString(), name: newDeliverable.trim() }])
      setNewDeliverable("")
    }
  }

  const removeDeliverable = (id: string) => {
    setDeliverables(prev => prev.filter(d => d.id !== id))
  }

  const updatePartnerDeliverable = (partnerId: number, deliverableName: string, checked: boolean) => {
    setPartnerFees(prev => {
      const newFees = new Map(prev)
      const current = newFees.get(partnerId) || { deliverables: [], fee: 0 }
      if (checked) {
        current.deliverables.push(deliverableName)
      } else {
        current.deliverables = current.deliverables.filter(d => d !== deliverableName)
      }
      newFees.set(partnerId, current)
      return newFees
    })
  }

  const updatePartnerFee = (partnerId: number, fee: number) => {
    setPartnerFees(prev => {
      const newFees = new Map(prev)
      const current = newFees.get(partnerId) || { deliverables: [], fee: 0 }
      current.fee = fee
      newFees.set(partnerId, current)
      return newFees
    })
  }

  const handleNext = () => {
    if (currentStep === 0) {
      if (!campaignName.trim() || !campaignType || !campaignStartDate) {
        alert("Please fill in all required fields (Campaign name, Type, and Start date)")
        return
      }
      setCurrentStep(1)
    } else if (currentStep === 1) {
      if (selectedPartnerIds.size === 0) {
        alert("Please select at least one partner")
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      handleCreate()
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleCreate = () => {
    // Convert partnerFees Map to array
    const partnerFeesArray = Array.from(partnerFees.entries()).map(([partnerId, data]) => {
      const partner = partners.find(p => p.id === partnerId)
      return {
        partnerId,
        partnerHandle: partner?.handle || "",
        deliverables: data.deliverables,
        fee: data.fee
      }
    })

    onCreate({
      name: campaignName,
      type: campaignType,
      startDate: campaignStartDate,
      endDate: campaignEndDate,
      budget: parseFloat(campaignBudget) || 0,
      notes: campaignNotes,
      partnerIds: Array.from(selectedPartnerIds),
      deliverables: deliverables.map(d => d.name),
      partnerFees: partnerFeesArray
    })

    resetForm()
    onClose()
  }

  const getFilteredPartners = () => {
    if (!searchQuery) return partners
    const query = searchQuery.toLowerCase()
    return partners.filter(p => 
      p.handle.toLowerCase().includes(query) || 
      p.niche.toLowerCase().includes(query) ||
      p.plat.toLowerCase().includes(query)
    )
  }

  if (!isOpen) return null

  const filteredPartners = getFilteredPartners()
  const selectedPartnersList = Array.from(selectedPartnerIds).map(id => partners.find(p => p.id === id)!)

  return (
    <div className="mo open" id="camp-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="md" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="mh">
          <div>
            <div className="mt">New Campaign</div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
              Saved as Draft
            </div>
          </div>
          <button className="mc" onClick={onClose}>×</button>
        </div>

        {/* STEP INDICATOR */}
        <div className="msteps">
          <div className={`mstep ${currentStep === 0 ? "active" : ""}`}>
            <div className="sc">1</div>
            <span>Details</span>
          </div>
          <div className="sdiv"></div>
          <div className={`mstep ${currentStep === 1 ? "active" : ""}`}>
            <div className="sc">2</div>
            <span>Select partners</span>
          </div>
          <div className="sdiv"></div>
          <div className={`mstep ${currentStep === 2 ? "active" : ""}`}>
            <div className="sc">3</div>
            <span>Deliverables & fees</span>
          </div>
        </div>

        <div className="mb">
          {/* STEP 1 - Campaign Details */}
          {currentStep === 0 && (
            <div className="msc active">
              <div className="fr">
                <div className="fg2">
                  <div className="fl">Campaign name <span className="req">*</span></div>
                  <input 
                    className="fi" 
                    placeholder="e.g. Black Friday 2026" 
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                <div className="fg2">
                  <div className="fl">Type <span className="req">*</span></div>
                  <select 
                    className="fi" 
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option>Gifting</option>
                    <option>Paid</option>
                    <option>Affiliate</option>
                    <option>Paid + Gifting</option>
                  </select>
                </div>
              </div>

              <div className="fr">
                <div className="fg2">
                  <div className="fl">Start date <span className="req">*</span></div>
                  <input 
                    className="fi" 
                    type="date" 
                    value={campaignStartDate}
                    onChange={(e) => setCampaignStartDate(e.target.value)}
                  />
                </div>
                <div className="fg2">
                  <div className="fl">End date <span className="opt">(blank = open-ended)</span></div>
                  <input 
                    className="fi" 
                    type="date" 
                    value={campaignEndDate}
                    onChange={(e) => setCampaignEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="fg2">
                <div className="fl">Budget <span className="opt">(optional)</span></div>
                <input 
                  className="fi" 
                  type="number" 
                  placeholder="0"
                  value={campaignBudget}
                  onChange={(e) => setCampaignBudget(e.target.value)}
                />
              </div>

              <div className="fg2">
                <div className="fl">Goals / notes <span className="opt">(optional)</span></div>
                <textarea 
                  className="fi" 
                  rows={3}
                  value={campaignNotes}
                  onChange={(e) => setCampaignNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 2 - Select Partners */}
          {currentStep === 1 && (
            <div className="msc active">
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "12px" }}>
                Select partners for this campaign.
              </div>

              <input 
                className="fi" 
                style={{ marginBottom: "12px" }}
                placeholder="Search partners" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="ppl" style={{ maxHeight: 300, overflowY: "auto" }}>
                {filteredPartners.map(p => (
                  <div 
                    key={p.id} 
                    className={`ppr ${selectedPartnerIds.has(p.id) ? "sel" : ""}`} 
                    onClick={() => togglePartnerSelection(p.id)}
                  >
                    <div className="pck">{selectedPartnerIds.has(p.id) ? "✓" : ""}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{p.handle}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{p.plat} · {p.niche}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: "11px", color: "#888", marginTop: "12px" }}>
                {selectedPartnerIds.size} selected
              </div>
            </div>
          )}

          {/* STEP 3 - Deliverables & Fees */}
          {currentStep === 2 && (
            <div className="msc active">
              <div style={{ marginBottom: "20px" }}>
                <div className="fl" style={{ marginBottom: "8px" }}>Deliverable template</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {deliverables.map(d => (
                    <span key={d.id} style={{ background: "#f0f0f0", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      {d.name}
                      <button onClick={() => removeDeliverable(d.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    className="fi" 
                    placeholder="e.g. 1x IG Reel" 
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addDeliverable()}
                  />
                  <button className="btn-outline" onClick={addDeliverable}>+ Add</button>
                </div>
              </div>

              <div>
                <div className="fl" style={{ marginBottom: "12px" }}>Per-creator fees</div>
                <table className="cft" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <th style={{ textAlign: "left", padding: "8px" }}>Creator</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Deliverables</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Agreed fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPartnersList.map(partner => {
                      const partnerData = partnerFees.get(partner.id)
                      return (
                        <tr key={partner.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <td style={{ padding: "8px", fontWeight: 500 }}>{partner.handle}</td>
                          <td style={{ padding: "8px" }}>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {deliverables.map(d => (
                                <label key={d.id} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                                  <input 
                                    type="checkbox" 
                                    checked={partnerData?.deliverables.includes(d.name) || false}
                                    onChange={(e) => updatePartnerDeliverable(partner.id, d.name, e.target.checked)}
                                  />
                                  {d.name}
                                </label>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input 
                              type="number" 
                              className="fi" 
                              style={{ width: "120px" }}
                              placeholder="Fee"
                              value={partnerData?.fee || 0}
                              onChange={(e) => updatePartnerFee(partner.id, parseFloat(e.target.value) || 0)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mf">
          {currentStep > 0 && (
            <button className="btn-outline" onClick={handleBack}>
              ← Back
            </button>
          )}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginLeft: "auto" }}>
            <span className="db" style={{ fontSize: "11px", color: "#888" }}>
              Will save as Draft
            </span>
            <button className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleNext}>
              {currentStep === 2 ? "Save Draft" : "Next →"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mo {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .md {
          background: #fff;
          border-radius: 14px;
          width: 700px;
          max-width: 90%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .mh {
          padding: 18px 24px;
          border-bottom: 0.5px solid rgba(0,0,0,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mt {
          font-size: 18px;
          font-weight: 600;
        }
        .mc {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #888;
        }
        .msteps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px 24px;
          background: #fafaf9;
          border-bottom: 0.5px solid rgba(0,0,0,0.08);
        }
        .mstep {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #aaa;
          font-size: 12px;
        }
        .mstep.active {
          color: #1FAE5B;
        }
        .sc {
          width: 28px;
          height: 28px;
          border-radius: 28px;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #666;
        }
        .mstep.active .sc {
          background: #1FAE5B;
          color: #fff;
        }
        .sdiv {
          width: 40px;
          height: 1px;
          background: #ddd;
        }
        .mb {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }
        .msc {
          display: none;
        }
        .msc.active {
          display: block;
        }
        .fr {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .fg2 {
          margin-bottom: 16px;
        }
        .fl {
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 6px;
          color: #333;
        }
        .req {
          color: #E24B4A;
        }
        .opt {
          font-size: 10px;
          font-weight: normal;
          color: #888;
        }
        .fi {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 0.5px solid rgba(0,0,0,0.15);
          font-size: 13px;
          font-family: inherit;
        }
        textarea.fi {
          resize: vertical;
        }
        .ppl {
          border: 0.5px solid rgba(0,0,0,0.1);
          border-radius: 8px;
          padding: 4px;
          max-height: 300px;
          overflow-y: auto;
        }
        .ppr {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 7px;
          cursor: pointer;
        }
        .ppr:hover {
          background: #f7f9f8;
        }
        .ppr.sel {
          background: #f0faf5;
        }
        .pck {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1.5px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        }
        .ppr.sel .pck {
          background: #1FAE5B;
          border-color: #1FAE5B;
          color: #fff;
        }
        .mf {
          padding: 16px 24px;
          border-top: 0.5px solid rgba(0,0,0,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-outline {
          background: transparent;
          border: 0.5px solid rgba(0,0,0,0.2);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        }
        .btn-primary {
          background: #1FAE5B;
          color: #fff;
          border: none;
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        }
        .cft {
          width: 100%;
          border-collapse: collapse;
        }
        .cft th, .cft td {
          padding: 10px 8px;
          text-align: left;
          border-bottom: 0.5px solid #eee;
        }
        .cft th {
          font-weight: 600;
          font-size: 11px;
          color: #666;
        }
        .db {
          font-size: 11px;
          color: #888;
        }
      `}</style>
    </div>
  )
}