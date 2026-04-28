"use client"

import { useState, useEffect, useCallback } from "react"

interface AddPartnerModalProps {
  isOpen: boolean
  onClose: () => void
  brandId: string
  onAdded: () => void
}

interface GlobalInfluencer {
  id: string
  handle: string
  platform: string
  full_name: string | null
  niche: string | null
  location: string | null
  follower_count: number
  engagement_rate: number
}

export default function AddPartnerModal({ isOpen, onClose, brandId, onAdded }: AddPartnerModalProps) {
  const [mode, setMode] = useState<"search" | "manual">("search")

  // Search mode
  const [searchQuery, setSearchQuery]     = useState("")
  const [results, setResults]             = useState<GlobalInfluencer[]>([])
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set())
  const [searching, setSearching]         = useState(false)
  const [searchNotes, setSearchNotes]     = useState("")

  // Manual mode
  const [handle,   setHandle]   = useState("")
  const [platform, setPlatform] = useState("")
  const [niche,    setNiche]    = useState("")
  const [location, setLocation] = useState("")
  const [email,    setEmail]    = useState("")
  const [notes,    setNotes]    = useState("")

  // Status
  const [saving,   setSaving]   = useState(false)
  const [errMsg,   setErrMsg]   = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)

  // Reset on open
  useEffect(() => {
    if (!isOpen) return
    setMode("search")
    setSearchQuery(""); setResults([]); setSelectedIds(new Set()); setSearchNotes("")
    setHandle(""); setPlatform(""); setNiche(""); setLocation(""); setEmail(""); setNotes("")
    setSaving(false); setErrMsg(null); setSuccess(false)
  }, [isOpen])

  // Debounced search → real DB
  const doSearch = useCallback(async (q: string) => {
    setSearching(true)
    try {
      const p = new URLSearchParams({ exclude_brand_id: brandId, limit: "100" })
      if (q.trim()) p.set("search", q.trim())
      const res  = await fetch(`/api/influencers?${p}`)
      const json = await res.json()
      setResults(Array.isArray(json.data) ? json.data : [])
    } catch { setResults([]) }
    finally  { setSearching(false) }
  }, [brandId])

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => doSearch(searchQuery), searchQuery ? 300 : 0)
    return () => clearTimeout(t)
  }, [isOpen, searchQuery, doSearch])

  const toggle = (id: string) =>
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setErrMsg(null); setSaving(true)
    try {
      if (mode === "search") {
        if (selectedIds.size === 0) { setErrMsg("Select at least one influencer."); setSaving(false); return }
        const errs: string[] = []
        for (const influencer_id of Array.from(selectedIds)) {
          const res  = await fetch(`/api/brands/${brandId}/partners`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ influencer_id, notes: searchNotes || null }),
          })
          const json = await res.json()
          if (!res.ok && res.status !== 409) errs.push(json.error || "Failed")
        }
        if (errs.length) { setErrMsg(errs.join(" · ")); setSaving(false); return }

      } else {
        // Manual — /api/influencers/create handles find-or-create + brand link + limits
        if (!handle.trim() || !platform || !niche || !location) {
          setErrMsg("Handle, platform, niche and location are required.")
          setSaving(false); return
        }
        const res  = await fetch("/api/influencers/create", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handle: handle.trim(), platform: platform.toLowerCase(),
            email: email || null, niche: niche || null,
            location: location || null, notes: notes || null, brandId,
          }),
        })
        const json = await res.json()

        if (res.status === 403) { setErrMsg(json.error || "Influencer limit reached."); setSaving(false); return }

        // 409 = influencer already exists globally; /create linked them already
        // but if not yet linked to THIS brand, link now
        if (res.status === 409 && json.id) {
          const link = await fetch(`/api/brands/${brandId}/partners`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ influencer_id: json.id, notes: notes || null }),
          })
          const linkJson = await link.json()
          if (!link.ok && link.status !== 409) {
            setErrMsg(linkJson.error || "Failed to link influencer.")
            setSaving(false); return
          }
        } else if (!res.ok) {
          setErrMsg(json.error || `Error ${res.status}`)
          setSaving(false); return
        }
      }

      setSuccess(true)
      setTimeout(() => { onAdded(); onClose() }, 700)
    } catch (e: any) {
      setErrMsg(e.message || "Unexpected error.")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const fs: React.CSSProperties = {
    width: "100%", padding: "6px 10px", borderRadius: 7,
    border: "0.5px solid rgba(0,0,0,0.15)", fontSize: 12,
    fontFamily: "inherit", boxSizing: "border-box",
  }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:14,width:580,maxWidth:"90%",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 8px 40px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:"18px 20px 14px",borderBottom:"0.5px solid rgba(0,0,0,0.08)",display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:15,fontWeight:600 }}>Add Brand Partner</div>
            <div style={{ fontSize:11,color:"#888",marginTop:2 }}>Search the global list or add manually</div>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:20,color:"#888",cursor:"pointer" }}>×</button>
        </div>

        {/* Mode toggle */}
        <div style={{ padding:"12px 20px 0" }}>
          <div style={{ display:"flex",gap:8,background:"#f7f9f8",padding:4,borderRadius:10 }}>
            {(["search","manual"] as const).map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{ flex:1,padding:"8px 12px",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"inherit",background:mode===m?"#fff":"transparent",color:mode===m?"#1FAE5B":"#555",boxShadow:mode===m?"0 1px 3px rgba(0,0,0,0.1)":"none" }}>
                {m==="search"?"🔍 Search influencer list":"✏️ Add manually"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:20,overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:12 }}>

          {mode==="search" && (<>
            <div style={{ fontSize:12,color:"#888" }}>Select influencers from the global list — they'll be linked to this brand.</div>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#aaa" }}>🔍</span>
              <input style={{ ...fs,paddingLeft:30 }} placeholder="Search by handle, niche, location…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
            </div>
            <div style={{ border:"0.5px solid rgba(0,0,0,0.1)",borderRadius:8,maxHeight:240,overflowY:"auto" }}>
              {searching ? (
                <div style={{ padding:20,textAlign:"center",color:"#888",fontSize:12 }}>Searching…</div>
              ) : results.length===0 ? (
                <div style={{ padding:20,textAlign:"center",color:"#888",fontSize:12 }}>
                  {searchQuery?"No results found":"No influencers in system yet — add them manually first"}
                </div>
              ) : results.map(inf=>(
                <div key={inf.id} onClick={()=>toggle(inf.id)} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:"pointer",background:selectedIds.has(inf.id)?"#f0faf5":"transparent",borderBottom:"0.5px solid rgba(0,0,0,0.04)" }}>
                  <div style={{ width:18,height:18,borderRadius:4,flexShrink:0,border:`1.5px solid ${selectedIds.has(inf.id)?"#1FAE5B":"#ccc"}`,background:selectedIds.has(inf.id)?"#1FAE5B":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff" }}>
                    {selectedIds.has(inf.id)?"✓":""}
                  </div>
                  <div>
                    <div style={{ fontWeight:500,fontSize:12 }}>@{inf.handle}</div>
                    <div style={{ fontSize:11,color:"#888" }}>{inf.platform} · {inf.niche||"—"} · {inf.location||"—"}</div>
                    <div style={{ fontSize:10,color:"#aaa" }}>
                      {inf.follower_count>=1000?(inf.follower_count/1000).toFixed(1)+"K":inf.follower_count} followers
                      {inf.engagement_rate?` · ${inf.engagement_rate}% eng`:""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11,color:"#888" }}>{selectedIds.size} selected</div>
            <div>
              <div style={{ fontSize:11,color:"#555",fontWeight:500,marginBottom:4 }}>Notes <span style={{ color:"#aaa",fontWeight:400 }}>(optional)</span></div>
              <textarea style={{ ...fs,minHeight:50,resize:"vertical" }} placeholder="e.g. Proven performer…" value={searchNotes} onChange={e=>setSearchNotes(e.target.value)} />
            </div>
          </>)}

          {mode==="manual" && (<>
            <div style={{ fontSize:12,color:"#888" }}>Creates a new influencer record and links them to this brand.</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <div>
                <div style={{ fontSize:11,color:"#555",fontWeight:500,marginBottom:4 }}>Handle <span style={{ color:"#E24B4A",fontSize:10 }}>*</span></div>
                <input style={fs} placeholder="@creatorname" value={handle} onChange={e=>setHandle(e.target.value)} />
              </div>
              <div>
                <div style={{ fontSize:11,color:"#555",fontWeight:500,marginBottom:4 }}>Platform <span style={{ color:"#E24B4A",fontSize:10 }}>*</span></div>
                <select style={fs} value={platform} onChange={e=>setPlatform(e.target.value)}>
                  <option value="">Select…</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <div>
                <div style={{ fontSize:11,color:"#555",fontWeight:500,marginBottom:4 }}>Niche <span style={{ color:"#E24B4A",fontSize:10 }}>*</span></div>
                <select style={fs} value={niche} onChange={e=>setNiche(e.target.value)}>
                  <option value="">Select…</option>
                  {["Beauty","Fitness","Lifestyle","Food","Tech","Fashion","Travel","Gaming","Health","Finance","Parenting","Pets","Other"].map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:11,color:"#555",fontWeight:500,marginBottom:4 }}>Location <span style={{ color:"#E24B4A",fontSize:10 }}>*</span></div>
                <select style={fs} value={location} onChange={e=>setLocation(e.target.value)}>
                  <option value="">Select…</option>
                  {["Philippines","Singapore","United States","Australia","United Kingdom","Malaysia","Indonesia","Canada","UAE","Other"].map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={{ fontSize:11,color:"#555",fontWeight:500,marginBottom:4 }}>Email <span style={{ color:"#aaa",fontWeight:400,fontSize:10 }}>(optional)</span></div>
              <input type="email" style={fs} placeholder="creator@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize:11,color:"#555",fontWeight:500,marginBottom:4 }}>Notes <span style={{ color:"#aaa",fontWeight:400,fontSize:10 }}>(optional)</span></div>
              <textarea style={{ ...fs,minHeight:50,resize:"vertical" }} placeholder="Relationship context…" value={notes} onChange={e=>setNotes(e.target.value)} />
            </div>
          </>)}

          {errMsg  && <div style={{ padding:"8px 12px",background:"#fdecea",border:"0.5px solid #E24B4A",borderRadius:8,fontSize:12,color:"#a32d2d" }}>⚠ {errMsg}</div>}
          {success && <div style={{ padding:"8px 12px",background:"#e6f9ee",border:"0.5px solid #1FAE5B",borderRadius:8,fontSize:12,color:"#0F6B3E" }}>✓ Partner added successfully!</div>}
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 20px",borderTop:"0.5px solid rgba(0,0,0,0.08)",display:"flex",justifyContent:"flex-end",gap:8 }}>
          <button onClick={onClose} style={{ fontSize:11,padding:"6px 14px",borderRadius:8,border:"0.5px solid rgba(0,0,0,0.2)",background:"transparent",color:"#555",cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving||success} style={{ fontSize:11,padding:"6px 16px",borderRadius:8,border:"none",background:saving||success?"#aaa":"#1FAE5B",color:"#fff",cursor:saving||success?"not-allowed":"pointer",fontFamily:"inherit",fontWeight:500 }}>
            {saving?"Saving…":success?"✓ Saved!":"+ Add as Brand Partner"}
          </button>
        </div>
      </div>
    </div>
  )
}