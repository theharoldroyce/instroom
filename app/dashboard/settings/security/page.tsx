"use client"
// app/dashboard/settings/security/page.tsx

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Toast = { message: string; type: "success" | "error" }

function useToast() {
  const [toast, setToast] = useState<Toast | null>(null)
  const show = (message: string, type: Toast["type"]) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }
  return { toast, show }
}

export default function SecurityPage() {
  const { status } = useSession()
  const router = useRouter()
  const { toast, show } = useToast()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword]          = useState("")
  const [confirmPassword, setConfirmPassword]  = useState("")
  const [savingPassword, setSavingPassword]    = useState(false)

  const [totpEnabled, setTotpEnabled]     = useState(false)
  const [smsEnabled, setSmsEnabled]       = useState(false)
  const [togglingTotp, setTogglingTotp]   = useState(false)
  const [togglingSms, setTogglingSms]     = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return

    fetch("/api/settings/security/2fa")
      .then((r) => r.json())
      .then((data) => {
        setTotpEnabled(data.totp ?? false)
        setSmsEnabled(data.sms ?? false)
      })
      .catch(() => {})
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Same API + validation as the settings page password card
  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      show("All password fields are required", "error")
      return
    }
    if (newPassword !== confirmPassword) {
      show("New passwords don't match.", "error")
      return
    }
    if (newPassword.length < 8) {
      show("Password must be at least 8 characters.", "error")
      return
    }
    setSavingPassword(true)
    try {
      const res  = await fetch("/api/user/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update password")
      show("Password updated successfully", "success")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      show(err.message || "Something went wrong", "error")
    } finally {
      setSavingPassword(false)
    }
  }

  async function toggle2FA(method: "totp" | "sms", current: boolean) {
    const setter     = method === "totp" ? setTotpEnabled : setSmsEnabled
    const setLoading = method === "totp" ? setTogglingTotp : setTogglingSms
    setLoading(true)
    try {
      const res  = await fetch("/api/settings/security/2fa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, enabled: !current }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update 2FA")
      setter(!current)
      show(`${method.toUpperCase()} ${!current ? "enabled" : "disabled"}`, "success")
    } catch (err: any) {
      show(err.message || "Something went wrong", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: "28px 36px", maxWidth: 780 }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 24,
            zIndex: 9999,
            padding: "10px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            background: toast.type === "success" ? "#1FAE5B" : "#E24B4A",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          {toast.message}
        </div>
      )}

      <div style={{ fontSize: 18, fontWeight: 600, color: "#1E1E1E", marginBottom: 4 }}>Security</div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>Manage your password and login settings</div>

      {/* Change Password Card */}
      <div style={card}>
        <div style={cardHeader}>
          <div style={cardIcon}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#1FAE5B" strokeWidth="1.5" width={16} height={16}>
              <rect x="4" y="7" width="8" height="7" rx="1.5" />
              <path d="M5 7V5a3 3 0 016 0v2" />
            </svg>
          </div>
          <div>
            <div style={cardTitle}>Change password</div>
            <div style={cardDesc}>Update your password to keep your account secure</div>
          </div>
        </div>
        <div style={cardBody}>
          <div style={fGrid}>
            <div style={{ ...fGroup, gridColumn: "1 / -1" }}>
              <label style={fLabel}>Current password</label>
              <input
                style={fInput}
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div style={fGroup}>
              <label style={fLabel}>New password</label>
              <input
                style={fInput}
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div style={fGroup}>
              <label style={fLabel}>Confirm new password</label>
              <input
                style={fInput}
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div style={btnRow}>
            <button style={btnPrimary} onClick={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </div>
        </div>
      </div>

      {/* 2FA Card */}
      <div style={card}>
        <div style={cardHeader}>
          <div style={cardIcon}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#1FAE5B" strokeWidth="1.5" width={16} height={16}>
              <rect x="2" y="2" width="12" height="12" rx="2" />
              <path d="M8 6v4M6 8h4" />
            </svg>
          </div>
          <div>
            <div style={cardTitle}>Two-factor authentication</div>
            <div style={cardDesc}>Add an extra layer of security to your account</div>
          </div>
        </div>
        <div style={cardBody}>
          <ToggleRow
            title="Authenticator app (TOTP)"
            desc="Use Google Authenticator, Authy, or similar apps"
            enabled={totpEnabled}
            loading={togglingTotp}
            onToggle={() => toggle2FA("totp", totpEnabled)}
          />
          <ToggleRow
            title="SMS verification"
            desc="Receive a code via text message when logging in"
            enabled={smsEnabled}
            loading={togglingSms}
            onToggle={() => toggle2FA("sms", smsEnabled)}
            last
          />
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  title,
  desc,
  enabled,
  loading,
  onToggle,
  last,
}: {
  title: string
  desc: string
  enabled: boolean
  loading: boolean
  onToggle: () => void
  last?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: last ? "none" : "0.5px solid rgba(0,0,0,0.05)",
        opacity: loading ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#1E1E1E" }}>{title}</div>
        <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{desc}</div>
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: enabled ? "#1FAE5B" : "#ddd",
          position: "relative",
          flexShrink: 0,
          cursor: loading ? "not-allowed" : "pointer",
          border: "none",
          padding: 0,
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            top: 2,
            left: enabled ? 18 : 2,
            background: "#fff",
            borderRadius: "50%",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "#fff",
  border: "0.5px solid rgba(0,0,0,0.08)",
  borderRadius: 12,
  marginBottom: 16,
  overflow: "hidden",
}
const cardHeader: React.CSSProperties = {
  padding: "16px 20px",
  borderBottom: "0.5px solid rgba(0,0,0,0.07)",
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
}
const cardIcon: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 9,
  background: "#f0faf5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}
const cardTitle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#1E1E1E" }
const cardDesc: React.CSSProperties  = { fontSize: 11, color: "#888", marginTop: 2 }
const cardBody: React.CSSProperties  = { padding: 20 }
const fGrid: React.CSSProperties     = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }
const fGroup: React.CSSProperties    = { display: "flex", flexDirection: "column", gap: 4 }
const fLabel: React.CSSProperties    = { fontSize: 11, fontWeight: 600, color: "#555", letterSpacing: "0.02em" }
const fInput: React.CSSProperties    = {
  width: "100%",
  fontSize: 12,
  padding: "9px 12px",
  borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.15)",
  background: "#fff",
  color: "#1E1E1E",
  fontFamily: "inherit",
}
const btnRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 16,
  paddingTop: 14,
  borderTop: "0.5px solid rgba(0,0,0,0.06)",
}
const btnPrimary: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  padding: "8px 18px",
  borderRadius: 9,
  border: "none",
  background: "#1FAE5B",
  color: "#fff",
  cursor: "pointer",
  fontFamily: "inherit",
}