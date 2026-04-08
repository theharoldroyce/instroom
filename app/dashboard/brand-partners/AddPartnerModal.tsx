"use client"

import { useState, useEffect } from "react"

interface AddPartnerModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (partnerData: any) => void
  existingInfluencers?: any[] // List of existing influencers to search from
}

export default function AddPartnerModal({ 
  isOpen, 
  onClose, 
  onAdd,
  existingInfluencers = [] 
}: AddPartnerModalProps) {
  const [mode, setMode] = useState<"search" | "manual">("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<number>>(new Set())
  
  // Search mode form data
  const [searchFormData, setSearchFormData] = useState({
    tier: "",
    commission: "",
    notes: ""
  })
  
  // Manual mode form data
  const [manualFormData, setManualFormData] = useState({
    handle: "",
    platform: "",
    niche: "",
    location: "",
    email: "",
    tier: "",
    commission: "",
    notes: ""
  })

  // Mock influencer list (replace with actual data from your system)
  const mockInfluencers = [
    { id: 1, handle: "@glossqueen", platform: "Instagram", niche: "Beauty", location: "Philippines", revenue: 25000, followers: 150000 },
    { id: 2, handle: "@fitwithjay", platform: "YouTube", niche: "Fitness", location: "Singapore", revenue: 18000, followers: 89000 },
    { id: 3, handle: "@chefmaria", platform: "TikTok", niche: "Food", location: "Philippines", revenue: 32000, followers: 450000 },
    { id: 4, handle: "@lifestylelux", platform: "Instagram", niche: "Lifestyle", location: "United States", revenue: 45000, followers: 280000 },
    { id: 5, handle: "@techrealmph", platform: "YouTube", niche: "Tech", location: "Philippines", revenue: 12000, followers: 67000 },
  ]

  const influencers = existingInfluencers.length > 0 ? existingInfluencers : mockInfluencers

  useEffect(() => {
    if (isOpen) {
      // Reset all form data when modal opens
      setMode("search")
      setSearchQuery("")
      setSelectedInfluencers(new Set())
      setSearchFormData({ tier: "", commission: "", notes: "" })
      setManualFormData({
        handle: "",
        platform: "",
        niche: "",
        location: "",
        email: "",
        tier: "",
        commission: "",
        notes: ""
      })
    }
  }, [isOpen])

  const getFilteredInfluencers = () => {
    if (!searchQuery.trim()) return influencers
    const query = searchQuery.toLowerCase()
    return influencers.filter(inf => 
      inf.handle.toLowerCase().includes(query) ||
      inf.niche.toLowerCase().includes(query) ||
      inf.platform.toLowerCase().includes(query) ||
      inf.location.toLowerCase().includes(query)
    )
  }

  const toggleInfluencerSelection = (id: number) => {
    setSelectedInfluencers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSave = () => {
    if (mode === "search") {
      if (selectedInfluencers.size === 0) {
        alert("Please select at least one influencer to add.")
        return
      }
      
      const selectedInfos = Array.from(selectedInfluencers).map(id => 
        influencers.find(inf => inf.id === id)
      ).filter(Boolean)
      
      onAdd({
        type: "search",
        influencers: selectedInfos,
        tier: searchFormData.tier || null,
        commission: searchFormData.commission ? parseFloat(searchFormData.commission) : null,
        notes: searchFormData.notes
      })
    } else {
      // Manual mode validation
      if (!manualFormData.handle || !manualFormData.platform || !manualFormData.niche || 
          !manualFormData.location || !manualFormData.email) {
        alert("Please fill in all required fields (*).")
        return
      }
      
      onAdd({
        type: "manual",
        ...manualFormData,
        commission: manualFormData.commission ? parseFloat(manualFormData.commission) : null
      })
    }
    onClose()
  }

  const filteredInfluencers = getFilteredInfluencers()

  return (
    <div className={`mo ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="md md-sm" onClick={(e) => e.stopPropagation()}>
        <div className="mh">
          <div>
            <div className="mt">Add Brand Partner</div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
              Search from influencer list or add manually
            </div>
          </div>
          <button className="mc" onClick={onClose}>×</button>
        </div>

        <div className="mb" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Mode Toggle */}
          <div className="mt2">
            <button 
              className={`mb2 ${mode === "search" ? "active" : ""}`} 
              onClick={() => setMode("search")}
            >
              🔍 Search influencer list
            </button>
            <button 
              className={`mb2 ${mode === "manual" ? "active" : ""}`} 
              onClick={() => setMode("manual")}
            >
              ✏️ Add manually
            </button>
          </div>

          {/* Search Mode */}
          {mode === "search" && (
            <div id="ap-search">
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                Select from influencers already in your pipeline.
              </div>
              
              {/* Search Input */}
              <div style={{ position: "relative", marginBottom: "8px" }}>
                <span style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#888" }}>
                  🔍
                </span>
                <input 
                  style={{ width: "100%", fontSize: "12px", padding: "6px 10px 6px 28px", borderRadius: "8px", border: "0.5px solid rgba(0,0,0,0.15)", fontFamily: "'Inter', sans-serif" }}
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Influencer List */}
              <div className="ppl" style={{ maxHeight: "250px", overflowY: "auto" }}>
                {filteredInfluencers.map(inf => (
                  <div 
                    key={inf.id} 
                    className={`ppr ${selectedInfluencers.has(inf.id) ? "sel" : ""}`}
                    onClick={() => toggleInfluencerSelection(inf.id)}
                  >
                    <div className="pck">{selectedInfluencers.has(inf.id) ? "✓" : ""}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{inf.handle}</div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        {inf.platform} · {inf.niche} · {inf.location}
                      </div>
                      <div style={{ fontSize: "10px", color: "#aaa", marginTop: "2px" }}>
                        ${inf.revenue?.toLocaleString()} rev · {inf.followers?.toLocaleString()} followers
                      </div>
                    </div>
                  </div>
                ))}
                {filteredInfluencers.length === 0 && (
                  <div style={{ padding: "20px", textAlign: "center", color: "#888", fontSize: "12px" }}>
                    No influencers found
                  </div>
                )}
              </div>

              <div style={{ fontSize: "11px", color: "#888", marginTop: "6px" }}>
                {selectedInfluencers.size} selected
              </div>

              {/* Search Mode Form Fields */}
              <div className="fr" style={{ marginTop: "12px" }}>
                <div className="fg2">
                  <div className="fl">
                    Assign tier <span className="opt">(or auto-suggested)</span>
                  </div>
                  <select 
                    className="fi" 
                    value={searchFormData.tier}
                    onChange={(e) => setSearchFormData({ ...searchFormData, tier: e.target.value })}
                  >
                    <option value="">Auto (based on revenue)</option>
                    <option value="Bronze">🥉 Bronze</option>
                    <option value="Silver">🥈 Silver</option>
                    <option value="Gold">🥇 Gold</option>
                  </select>
                </div>
                <div className="fg2">
                  <div className="fl">
                    Commission % <span className="opt">(optional — affiliate only)</span>
                  </div>
                  <input 
                    className="fi" 
                    type="number" 
                    min="0" 
                    max="100" 
                    placeholder="e.g. 15"
                    value={searchFormData.commission}
                    onChange={(e) => setSearchFormData({ ...searchFormData, commission: e.target.value })}
                  />
                </div>
              </div>

              <div className="fg2">
                <div className="fl">
                  Notes <span className="opt">(optional)</span>
                </div>
                <textarea 
                  className="fi" 
                  style={{ minHeight: "55px" }}
                  placeholder="e.g. Proven performer..."
                  value={searchFormData.notes}
                  onChange={(e) => setSearchFormData({ ...searchFormData, notes: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Manual Mode */}
          {mode === "manual" && (
            <div id="ap-manual">
              <div className="fr">
                <div className="fg2">
                  <div className="fl">
                    Handle <span className="req">*</span>
                  </div>
                  <input 
                    className="fi" 
                    placeholder="@creatorname"
                    value={manualFormData.handle}
                    onChange={(e) => setManualFormData({ ...manualFormData, handle: e.target.value })}
                  />
                </div>
                <div className="fg2">
                  <div className="fl">
                    Platform <span className="req">*</span>
                  </div>
                  <select 
                    className="fi" 
                    value={manualFormData.platform}
                    onChange={(e) => setManualFormData({ ...manualFormData, platform: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option>Instagram</option>
                    <option>YouTube</option>
                    <option>TikTok</option>
                  </select>
                </div>
              </div>

              <div className="fr">
                <div className="fg2">
                  <div className="fl">
                    Niche <span className="req">*</span>
                  </div>
                  <select 
                    className="fi" 
                    value={manualFormData.niche}
                    onChange={(e) => setManualFormData({ ...manualFormData, niche: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option>Beauty</option>
                    <option>Fitness</option>
                    <option>Lifestyle</option>
                    <option>Food</option>
                    <option>Tech</option>
                  </select>
                </div>
                <div className="fg2">
                  <div className="fl">
                    Location <span className="req">*</span>
                  </div>
                  <select 
                    className="fi" 
                    value={manualFormData.location}
                    onChange={(e) => setManualFormData({ ...manualFormData, location: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option>Philippines</option>
                    <option>Singapore</option>
                    <option>United States</option>
                    <option>Australia</option>
                    <option>United Kingdom</option>
                    <option>Malaysia</option>
                  </select>
                </div>
              </div>

              <div className="fg2">
                <div className="fl">
                  Email <span className="req">*</span>
                </div>
                <input 
                  className="fi" 
                  type="email" 
                  placeholder="creator@email.com"
                  value={manualFormData.email}
                  onChange={(e) => setManualFormData({ ...manualFormData, email: e.target.value })}
                />
              </div>

              <div className="fr" style={{ marginTop: "4px" }}>
                <div className="fg2">
                  <div className="fl">
                    Tier <span className="opt">(auto-assigned if blank)</span>
                  </div>
                  <select 
                    className="fi" 
                    value={manualFormData.tier}
                    onChange={(e) => setManualFormData({ ...manualFormData, tier: e.target.value })}
                  >
                    <option value="">Auto</option>
                    <option value="Bronze">🥉 Bronze</option>
                    <option value="Silver">🥈 Silver</option>
                    <option value="Gold">🥇 Gold</option>
                  </select>
                </div>
                <div className="fg2">
                  <div className="fl">
                    Commission % <span className="opt">(optional)</span>
                  </div>
                  <input 
                    className="fi" 
                    type="number" 
                    min="0" 
                    max="100" 
                    placeholder="e.g. 15"
                    value={manualFormData.commission}
                    onChange={(e) => setManualFormData({ ...manualFormData, commission: e.target.value })}
                  />
                </div>
              </div>

              <div className="fg2" style={{ marginTop: "4px" }}>
                <div className="fl">
                  Notes <span className="opt">(optional)</span>
                </div>
                <textarea 
                  className="fi" 
                  style={{ minHeight: "55px" }}
                  placeholder="Relationship context..."
                  value={manualFormData.notes}
                  onChange={(e) => setManualFormData({ ...manualFormData, notes: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mf">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>+ Add as Brand Partner</button>
        </div>
      </div>

      <style jsx>{`
        .mo {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 600;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .mo.open {
          display: flex;
        }

        .md {
          background: #fff;
          border-radius: 14px;
          max-width: 90%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
        }

        .md-sm {
          width: 580px;
        }

        .mh {
          padding: 18px 20px 14px;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .mt {
          font-size: 15px;
          font-weight: 600;
          color: #1e1e1e;
        }

        .mc {
          background: none;
          border: none;
          font-size: 20px;
          color: #888;
          cursor: pointer;
        }

        .mb {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .mt2 {
          display: flex;
          gap: 8px;
          background: #f7f9f8;
          padding: 4px;
          border-radius: 10px;
        }

        .mb2 {
          flex: 1;
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .mb2.active {
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          color: #1fae5b;
        }

        .mf {
          padding: 14px 20px;
          border-top: 0.5px solid rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .btn-outline {
          font-size: 11px;
          padding: 6px 14px;
          border-radius: 8px;
          border: 0.5px solid rgba(0, 0, 0, 0.2);
          background: transparent;
          color: #555;
          cursor: pointer;
        }

        .btn-primary {
          font-size: 11px;
          padding: 6px 14px;
          border-radius: 8px;
          border: none;
          background: #1fae5b;
          color: #fff;
          cursor: pointer;
        }

        .btn-primary:hover {
          background: #0f6b3e;
        }

        .ppl {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border: 0.5px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 8px;
          max-height: 250px;
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
          background: #1fae5b;
          border-color: #1fae5b;
          color: #fff;
        }

        .fr {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .fg2 {
          flex: 1;
        }

        .fl {
          font-size: 11px;
          color: #555;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .req {
          color: #e24b4a;
          font-size: 10px;
        }

        .opt {
          color: #888;
          font-size: 10px;
          font-weight: normal;
        }

        .fi {
          width: 100%;
          padding: 6px 10px;
          border-radius: 7px;
          border: 0.5px solid rgba(0, 0, 0, 0.15);
          font-size: 12px;
          font-family: inherit;
        }

        .fi:focus {
          outline: none;
          border-color: #1fae5b;
        }

        textarea.fi {
          resize: vertical;
        }
      `}</style>
    </div>
  )
}