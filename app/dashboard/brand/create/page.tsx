"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type BizType = "dtc" | "saas" | "service" | "digital"

interface PipeStage {
  color: string
  name: string
  desc: string
  isExit?: boolean
  dotShape?: "circle" | "square"
}

interface PipeGroup {
  label: string
  stages: PipeStage[]
  exitStage?: PipeStage
}

// ─── Static data ──────────────────────────────────────────────────────────────

const BIZ_OPTIONS: {
  id: BizType
  icon: string
  name: string
  desc: string
  badge: string
  badgeMain?: boolean
  locked?: boolean
}[] = [
  {
    id: "dtc",
    icon: "📦",
    name: "DTC / E-commerce",
    desc: "Physical products with shipping & gifting",
    badge: "Main market",
    badgeMain: true,
  },
  {
    id: "saas",
    icon: "💻",
    name: "SaaS / App",
    desc: "Software access, trials, digital onboarding",
    badge: "Coming soon",
    locked: true,
  },
  {
    id: "service",
    icon: "🤝",
    name: "Service business",
    desc: "Agency, coaching, or professional services",
    badge: "Coming soon",
    locked: true,
  },
  {
    id: "digital",
    icon: "🎓",
    name: "Digital product",
    desc: "Courses, templates, downloadable content",
    badge: "Coming soon",
    locked: true,
  },
]

const DTC_PIPELINE: PipeGroup[] = [
  {
    label: "Outreach",
    stages: [
      { color: "#B4B2A9", name: "For outreach", desc: "On list, not yet messaged" },
      { color: "#2C8EC4", name: "Contacted", desc: "DM or email sent, awaiting reply" },
      { color: "#F4B740", name: "In conversation", desc: "Replied — negotiating terms" },
    ],
    exitStage: {
      color: "#E24B4A",
      name: "Not interested",
      desc: "Declined or went silent",
      isExit: true,
      dotShape: "square",
    },
  },
  {
    label: "Closed collaboration",
    stages: [
      { color: "#1FAE5B", name: "Deal agreed", desc: "Terms confirmed — gifting, paid, or affiliate" },
      { color: "#2C8EC4", name: "Order placed", desc: "Product ordered or shipment initiated" },
      { color: "#F4B740", name: "In transit", desc: "Shipped — tracking shared with creator" },
      { color: "#1FAE5B", name: "Delivered", desc: "Creator confirmed receipt of product" },
      { color: "#E24B4A", name: "Delivery problem", desc: "Lost, returned, or wrong item" },
      { color: "#1FAE5B", name: "Posted", desc: "Content is live — tracking begins" },
    ],
    exitStage: {
      color: "#888780",
      name: "No post",
      desc: "Product received, no content posted yet",
      isExit: true,
      dotShape: "square",
    },
  },
]

const SUCCESS_STAGE_CHIPS: { label: string; bg: string; color: string; border: string }[] = [
  { label: "For outreach", bg: "#f5f5f5", color: "#666", border: "#eee" },
  { label: "Contacted", bg: "#E6F1FB", color: "#0C447C", border: "#B5D4F4" },
  { label: "In conversation", bg: "#FFF8EC", color: "#7a4c00", border: "#FAC775" },
  { label: "Not interested ✕", bg: "#FEF0F0", color: "#a32d2d", border: "#F7C1C1" },
  { label: "Deal agreed", bg: "#e0f7ec", color: "#0e7a42", border: "#9FE1CB" },
  { label: "Order placed", bg: "#E6F1FB", color: "#0C447C", border: "#B5D4F4" },
  { label: "In transit", bg: "#FFF8EC", color: "#7a4c00", border: "#FAC775" },
  { label: "Delivered", bg: "#e0f7ec", color: "#0e7a42", border: "#9FE1CB" },
  { label: "Delivery problem", bg: "#FEF0F0", color: "#a32d2d", border: "#F7C1C1" },
  { label: "Posted", bg: "#e0f7ec", color: "#0e7a42", border: "#9FE1CB" },
  { label: "No post ✕", bg: "#f5f5f5", color: "#555", border: "#eee" },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepDot({ active }: { active: boolean }) {
  return (
    <div
      style={{
        width: active ? 18 : 6,
        height: 6,
        borderRadius: active ? 3 : "50%",
        background: active ? "#1FAE5B" : "#e0e0e0",
        transition: "all 0.2s",
      }}
    />
  )
}

function PipelineRow({ stage }: { stage: PipeStage }) {
  const isExit = stage.isExit
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        border: `1px solid ${isExit ? "#f5e5e5" : "#f0f0f0"}`,
        borderRadius: 8,
        background: isExit ? "#fdf8f8" : "#fafafa",
        opacity: isExit ? 0.82 : 1,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: stage.dotShape === "square" ? 2 : "50%",
          background: stage.color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isExit ? "#999" : "#111",
          flex: 1,
        }}
      >
        {stage.name}
      </span>
      <span style={{ fontSize: 11, color: "#aaa" }}>{stage.desc}</span>
      {isExit && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            padding: "1px 6px",
            borderRadius: 4,
            border: `1px solid ${stage.color === "#E24B4A" ? "#f7c1c1" : "#e0e0e0"}`,
            background: stage.color === "#E24B4A" ? "#fef0f0" : "#f5f5f5",
            color: stage.color === "#E24B4A" ? "#E24B4A" : "#888",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}
        >
          exit
        </span>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CreateBrandPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [step, setStep] = useState(1)
  const TOTAL = 4

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [nameError, setNameError] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
  })
  const [selectedBiz] = useState<BizType>("dtc") // only dtc selectable for now

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "name" && value.trim()) setNameError(false)
  }

  const goNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setNameError(true)
        return
      }
      setNameError(false)
    }
    if (step === 3) {
      handleConfirm()
      return
    }
    if (step < TOTAL) setStep((s) => s + 1)
  }

  const goBack = () => {
    if (step > 1 && step < TOTAL) setStep((s) => s - 1)
  }

  const handleConfirm = async () => {
    setError("")
    setLoading(true)
    try {
      const response = await fetch("/api/brand/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Failed to create brand")
        setLoading(false)
        return
      }
      setStep(4)
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ── Not signed in guard ──────────────────────────────────────────────────────

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
        <div style={styles.modal}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: "25%" }} />
          </div>
          <div style={{ padding: "28px 28px 24px" }}>
            <div style={styles.eyebrow}>Sign in required</div>
            <div style={styles.title}>Access restricted</div>
            <p style={styles.sub}>You need to be signed in to create a workspace.</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const progressWidth = `${(step / TOTAL) * 100}%`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div style={styles.modal}>

        {/* Progress bar */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: progressWidth, transition: "width 0.35s ease" }} />
        </div>

        {/* Body */}
        <div style={{ padding: "28px 28px 20px" }}>

          {/* ── Step 1: Workspace info ── */}
          {step === 1 && (
            <div>
              <div style={styles.eyebrow}>Step 1 of 4</div>
              <div style={styles.title}>Set up your workspace</div>
              <p style={styles.sub}>Tell us about your brand so we can configure your workspace correctly.</p>

              {error && (
                <div style={styles.errorBox}>
                  <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <div style={styles.field}>
                <div style={styles.fieldLabel}>
                  Brand name <span style={{ color: "#1FAE5B" }}>*</span>
                </div>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., My Fashion Brand"
                  autoComplete="off"
                  style={{
                    ...styles.input,
                    borderColor: nameError ? "#E24B4A" : "#e0e0e0",
                  }}
                  disabled={loading}
                />
                {nameError && (
                  <p style={{ fontSize: 11, color: "#E24B4A", marginTop: 4 }}>Brand name is required.</p>
                )}
              </div>

              <div style={styles.field}>
                <div style={styles.fieldLabel}>Description</div>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What does your brand do?"
                  autoComplete="off"
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              <div style={styles.field}>
                <div style={styles.fieldLabel}>Website URL</div>
                <Input
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  type="url"
                  autoComplete="off"
                  style={styles.input}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Business type ── */}
          {step === 2 && (
            <div>
              <div style={styles.eyebrow}>Step 2 of 4</div>
              <div style={styles.title}>What type of business are you?</div>
              <p style={styles.sub}>
                This sets your pipeline stages — no generic labels, just names that match how your brand actually works.
              </p>

              <div style={styles.bizGrid}>
                {BIZ_OPTIONS.map((biz) => (
                  <div
                    key={biz.id}
                    style={{
                      ...styles.bizCard,
                      ...(biz.id === selectedBiz && !biz.locked ? styles.bizCardSelected : {}),
                      ...(biz.locked ? styles.bizCardLocked : {}),
                    }}
                  >
                    <div
                      style={{
                        ...styles.bizBadge,
                        ...(biz.badgeMain ? styles.bizBadgeMain : {}),
                      }}
                    >
                      {biz.badge}
                    </div>
                    <span style={{ fontSize: 18, display: "block", marginBottom: 6 }}>{biz.icon}</span>
                    <div style={styles.bizName}>{biz.name}</div>
                    <div style={styles.bizDesc}>{biz.desc}</div>
                  </div>
                ))}
              </div>
              <p style={styles.bizNote}>More business types coming soon — update anytime in settings.</p>
            </div>
          )}

          {/* ── Step 3: Pipeline review ── */}
          {step === 3 && (
            <div>
              <div style={styles.eyebrow}>Step 3 of 4</div>
              <div style={styles.title}>Your DTC pipeline stages</div>
              <p style={styles.sub}>These will appear across your pipeline, campaign tracker, and analytics.</p>

              <div style={styles.scrollable}>
                {DTC_PIPELINE.map((group) => (
                  <div key={group.label} style={{ marginBottom: 14 }}>
                    <div style={styles.groupLabel}>{group.label}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {group.stages.map((stage) => (
                        <PipelineRow key={stage.name} stage={stage} />
                      ))}
                    </div>
                    {group.exitStage && (
                      <>
                        <div style={styles.dividerLabel}>
                          <span style={styles.dividerLine} />
                          exit
                          <span style={styles.dividerLine} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          <PipelineRow stage={group.exitStage} />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ ...styles.errorBox, marginTop: 12 }}>
                  <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <div style={{ padding: "4px 0 8px", textAlign: "center" }}>
              <div style={styles.checkCircle}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="#1FAE5B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={styles.title}>{formData.name ? `${formData.name} is ready!` : "Workspace ready!"}</div>
              <p style={{ ...styles.sub, marginBottom: 0 }}>
                Your workspace is configured with 11 DTC pipeline stages. Every status now matches exactly how your fulfillment works.
              </p>

              <div style={styles.chipsWrap}>
                <span style={{ ...styles.chip, background: "#f0fbf5", color: "#0e7a42", borderColor: "#9FE1CB" }}>
                  📦 DTC / E-commerce
                </span>
                <span style={{ ...styles.chip, background: "#f5f5f5", color: "#555", borderColor: "#e0e0e0" }}>
                  11 stages configured
                </span>
              </div>

              <div style={styles.pipelineSummary}>
                <div style={styles.pipelineSummaryLabel}>Pipeline at a glance</div>
                <div style={styles.stageChips}>
                  {SUCCESS_STAGE_CHIPS.map((c) => (
                    <span
                      key={c.label}
                      style={{
                        fontSize: 10,
                        padding: "3px 9px",
                        borderRadius: 20,
                        border: `1px solid ${c.border}`,
                        background: c.bg,
                        color: c.color,
                      }}
                    >
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => router.push(`/dashboard/manage-influencers`)}
                style={styles.btnGo}
              >
                Go to my workspace →
              </Button>
            </div>
          )}
        </div>

        {/* Footer (hidden on step 4) */}
        {step < 4 && (
          <div style={styles.footer}>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {Array.from({ length: TOTAL }).map((_, i) => (
                <StepDot key={i} active={i === step - 1} />
              ))}
            </div>

            {step > 1 && (
              <button onClick={goBack} disabled={loading} style={styles.btnBack}>
                ← Back
              </button>
            )}

            <button
              onClick={goNext}
              disabled={loading}
              style={{
                ...styles.btnPrimary,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Creating..."
                : step === 3
                ? "Confirm & create workspace"
                : "Next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  modal: {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 480,
    overflow: "hidden",
    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
  },
  progressBar: {
    height: 4,
    background: "#f0f0f0",
  },
  progressFill: {
    height: "100%",
    background: "#1FAE5B",
    borderRadius: "0 2px 2px 0",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    color: "#1FAE5B",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111",
    marginBottom: 5,
    lineHeight: 1.3,
  },
  sub: {
    fontSize: 13,
    color: "#888",
    marginBottom: 22,
    lineHeight: 1.55,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#333",
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    fontSize: 13,
    color: "#111",
    background: "#fff",
    outline: "none",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #fccac9",
    background: "#fff5f5",
    fontSize: 12,
    color: "#c0392b",
    marginBottom: 14,
  },
  bizGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 16,
  },
  bizCard: {
    border: "1.5px solid #e8e8e8",
    borderRadius: 10,
    padding: "14px 12px",
    cursor: "pointer",
    background: "#fff",
    userSelect: "none",
  },
  bizCardSelected: {
    borderColor: "#1FAE5B",
    background: "#f0fbf5",
  },
  bizCardLocked: {
    opacity: 0.42,
    cursor: "not-allowed",
  },
  bizBadge: {
    fontSize: 9,
    fontWeight: 600,
    padding: "2px 7px",
    borderRadius: 20,
    background: "#f0f0f0",
    color: "#888",
    display: "inline-block",
    marginBottom: 8,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  },
  bizBadgeMain: {
    background: "#e0f7ec",
    color: "#0e7a42",
  },
  bizName: {
    fontSize: 12,
    fontWeight: 600,
    color: "#111",
    marginBottom: 2,
  },
  bizDesc: {
    fontSize: 11,
    color: "#999",
    lineHeight: 1.35,
  },
  bizNote: {
    fontSize: 11,
    color: "#bbb",
    textAlign: "center",
    marginTop: 4,
  },
  scrollable: {
    maxHeight: 260,
    overflowY: "auto",
    paddingRight: 2,
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#bbb",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 7,
    paddingLeft: 2,
  },
  dividerLabel: {
    fontSize: 10,
    color: "#ccc",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "8px 0 7px",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#f0f0f0",
    display: "block",
  } as React.CSSProperties,
  checkCircle: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#e0f7ec",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  chipsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 14,
    justifyContent: "center",
  },
  chip: {
    fontSize: 11,
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: 20,
    border: "1px solid",
  },
  pipelineSummary: {
    marginTop: 18,
    background: "#fafafa",
    border: "1px solid #f0f0f0",
    borderRadius: 10,
    padding: "14px 16px",
    textAlign: "left",
  },
  pipelineSummaryLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#bbb",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  stageChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 28px 22px",
    borderTop: "1px solid #f5f5f5",
    gap: 10,
  },
  btnBack: {
    fontSize: 13,
    color: "#888",
    background: "none",
    border: "1px solid #e8e8e8",
    borderRadius: 8,
    padding: "10px 18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "inherit",
  },
  btnPrimary: {
    fontSize: 13,
    fontWeight: 600,
    color: "#fff",
    background: "#1FAE5B",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    cursor: "pointer",
    fontFamily: "inherit",
    flex: 1,
  },
  btnGo: {
    display: "inline-block",
    marginTop: 20,
    fontSize: 13,
    fontWeight: 600,
    color: "#fff",
    background: "#1FAE5B",
    border: "none",
    borderRadius: 8,
    padding: "11px 28px",
    cursor: "pointer",
  },
}