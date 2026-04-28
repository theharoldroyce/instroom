"use client"

import { useEffect, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  IconArrowRight,
  IconUpload,
  IconUser,
  IconAlertCircle,
} from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ─── Inner component (useSearchParams requires Suspense boundary) ─────────────

function SettingsContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const brandId = searchParams.get("brandId")

  // ── Account ──────────────────────────────────────────────────────────────
  const [fullName, setFullName]               = useState("")
  const [savingName, setSavingName]           = useState(false)
  const [nameSaved, setNameSaved]             = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword]         = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword]   = useState(false)
  const [passwordError, setPasswordError]     = useState("")
  const [passwordSaved, setPasswordSaved]     = useState(false)

  const [subscription, setSubscription]       = useState<any>(null)
  const [brandCount, setBrandCount]           = useState<number>(0)


  // ─────────────────────────────────────────────────────────────────────────
  // Data fetching
  // ─────────────────────────────────────────────────────────────────────────

  // Seed name from session
  useEffect(() => {
    if (session?.user?.name) setFullName(session.user.name)
  }, [session?.user?.name])

  // Subscription
  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/subscription/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: session.user.id }),
    })
      .then(r => r.json())
      .then(d => setSubscription(d.subscription))
      .catch(() => {})
  }, [session?.user?.id])

  // Brand count
  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/user/brand-usage")
      .then(r => r.json())
      .then(d => setBrandCount(d.brandCount || 0))
      .catch(() => {})
  }, [session?.user?.id])


  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleSaveName = async () => {
    if (!fullName.trim() || !session?.user?.id) return
    try {
      setSavingName(true)
      await fetch("/api/user/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session.user.id, name: fullName }),
      })
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 3000)
    } finally {
      setSavingName(false)
    }
  }

  const handleUpdatePassword = async () => {
    setPasswordError("")
    if (newPassword !== confirmPassword) { setPasswordError("New passwords don't match."); return }
    if (newPassword.length < 8)          { setPasswordError("Password must be at least 8 characters."); return }
    try {
      setSavingPassword(true)
      const res  = await fetch("/api/user/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setPasswordError(data.error || "Failed to update password"); return }
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 3000)
    } finally {
      setSavingPassword(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Subscription display helpers
  // ─────────────────────────────────────────────────────────────────────────

  const planColors: Record<string, string> = {
    solo:   "bg-stone-100 text-stone-700",
    team:   "bg-emerald-50 text-emerald-800",
    agency: "bg-amber-50 text-amber-800",
  }
  const planName  = subscription?.plan?.name?.toLowerCase() || "solo"
  const planLabel = ({ solo: "Solo", team: "Team", agency: "Agency" } as Record<string,string>)[planName] || "Solo"
  const planColor = planColors[planName] || planColors.solo

  // ─────────────────────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-[#1FAE5B] border-t-transparent animate-spin" />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 pb-16 space-y-0">

      {/* ═══════════════════════════════════════════════════
          SECTION 1 — ACCOUNT SETTINGS
      ═══════════════════════════════════════════════════ */}
      <section id="account" className="space-y-6">
        <div className="flex items-center gap-3 pt-2 pb-1">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100">
            <IconUser size={18} className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
            <p className="text-sm text-muted-foreground">Manage your personal information and preferences</p>
          </div>
        </div>

        {/* Profile + Password */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* LEFT — Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Update your name and profile photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? "User"} />
                  <AvatarFallback className="text-lg font-bold bg-[#0F6B3E] text-white">
                    {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <IconUpload size={14} />
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-1.5">PNG, JPG up to 2MB</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email ?? ""}
                  readOnly
                  className="bg-gray-50 text-gray-500 cursor-default"
                />
                <p className="text-xs text-gray-400">Email cannot be changed here</p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <Button onClick={handleSaveName} disabled={savingName} className="bg-[#1FAE5B] hover:bg-[#0F6B3E]">
                  {savingName ? "Saving..." : nameSaved ? "✓ Saved!" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT — Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  <IconAlertCircle size={16} className="shrink-0" />
                  {passwordError}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="pt-2 border-t border-gray-100">
                <Button onClick={handleUpdatePassword} disabled={savingPassword} className="bg-[#1FAE5B] hover:bg-[#0F6B3E]">
                  {savingPassword ? "Updating..." : passwordSaved ? "✓ Updated!" : "Update Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription + Plan Usage */}
        {subscription && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Subscription</CardTitle>
                    <CardDescription>Your current plan and billing info</CardDescription>
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md ${planColor}`}>
                    {planLabel}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { label: "Current Plan",  value: subscription.plan?.display_name || planLabel },
                  { label: "Billing Cycle", value: subscription.billing_cycle },
                  { label: "Status",        value: subscription.status },
                  { label: "Renewal Date",  value: subscription.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString() : "—" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-dashed border-gray-100 last:border-0 text-sm">
                    <span className="text-gray-500 font-medium">{row.label}</span>
                    <span className="text-gray-900 font-medium capitalize">{row.value}</span>
                  </div>
                ))}
                <div className="pt-3">
                  <Link href="/pricing?cycle=monthly">
                    <Button variant="outline" size="sm" className="text-[#0F6B3E] border-[#1FAE5B] hover:bg-[#1FAE5B] hover:text-white gap-1">
                      Manage Plan <IconArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plan Usage &amp; Limits</CardTitle>
                <CardDescription>How much of your plan you&apos;re using</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {(() => {
                  const maxBrands = subscription.plan?.max_brands || subscription.plan?.included_brands
                  const maxSeats  = subscription.plan?.max_seats  || subscription.plan?.included_seats
                  const items: { icon: string; text: string }[] = []

                  if (maxBrands === null || maxBrands > 100) items.push({ icon: "▸", text: `${brandCount} Brands — Unlimited` })
                  else items.push({ icon: "▸", text: `${brandCount} of ${maxBrands} Brands used` })

                  if (maxSeats === null || maxSeats > 100) items.push({ icon: "▸", text: "Collaborators — Unlimited" })
                  else items.push({ icon: "▸", text: `Up to ${maxSeats} collaborators` })

                  if (subscription.plan?.can_use_api)      items.push({ icon: "★", text: "API Access — Active" })
                  if (subscription.plan?.custom_branding)  items.push({ icon: "★", text: "Custom Branding — Active" })
                  if (subscription.plan?.priority_support) items.push({ icon: "★", text: "Priority Support — Active" })

                  return items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 border-b border-dashed border-gray-100 last:border-0 text-sm">
                      <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                  ))
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

    </div>
  )
}

// Suspense wrapper required for useSearchParams
export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-[#1FAE5B] border-t-transparent animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}