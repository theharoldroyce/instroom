"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import {
  IconLock,
  IconArrowRight,
  IconUpload,
  IconUser,
  IconUsers,
  IconPalette,
  IconMail,
  IconCrown,
  IconTrash,
  IconAlertCircle,
  IconBolt,
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Collaborator {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  joinedAt?: string
}

interface BuySeatsModalState {
  isOpen: boolean
  maxSeatsAvailable: number
  pricePerSeat: number
  currentExtraSeats: number
  maxTotalSeats: number
}

declare global {
  interface Window { paypal?: any }
}

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
  const [brandingAllowed, setBrandingAllowed] = useState<boolean | null>(null)

  // ── Collaborators ─────────────────────────────────────────────────────────
  const [owner, setOwner]           = useState<Collaborator | null>(null)
  const [members, setMembers]       = useState<Collaborator[]>([])
  const [collabLoading, setCollabLoading] = useState(true)
  const [collabError, setCollabError]     = useState("")
  const [inviteEmail, setInviteEmail]     = useState("")
  const [inviteRole, setInviteRole]       = useState("manager")
  const [inviting, setInviting]           = useState(false)
  const [removing, setRemoving]           = useState<string | null>(null)

  // ── Buy seats modal ───────────────────────────────────────────────────────
  const [buySeatsModal, setBuySeatsModal] = useState<BuySeatsModalState>({
    isOpen: false, maxSeatsAvailable: 0, pricePerSeat: 0,
    currentExtraSeats: 0, maxTotalSeats: 0,
  })
  const [seatsToAdd, setSeatsToAdd]     = useState(1)
  const [buyingSeats, setBuyingSeats]   = useState(false)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const paypalRef = useRef<HTMLDivElement>(null)

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

  // Branding access
  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/subscription/branding-access")
      .then(r => r.json())
      .then(d => setBrandingAllowed(d.allowed ?? false))
      .catch(() => setBrandingAllowed(false))
  }, [session?.user?.id])

  // Collaborators
  useEffect(() => {
    if (!brandId) { setCollabLoading(false); return }
    const load = async () => {
      try {
        setCollabLoading(true)
        setCollabError("")
        const res  = await fetch(`/api/brand/${brandId}/collaborators`)
        const data = await res.json()
        if (!res.ok) {
          if (res.status === 403) setCollabError("You don't have permission to manage collaborators for this brand.")
          else if (res.status === 404) setCollabError("Brand not found.")
          else setCollabError(data.error || "Failed to fetch collaborators")
          return
        }
        setOwner(data.owner)
        setMembers(data.members || [])
      } catch (err) {
        setCollabError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setCollabLoading(false)
      }
    }
    load()
  }, [brandId])

  // PayPal button
  useEffect(() => {
    if (!buySeatsModal.isOpen || !paypalLoaded || !paypalRef.current) return
    if (paypalRef.current.innerHTML !== "") return
    if (!window.paypal) return

    window.paypal.Buttons({
      style: { shape: "pill", color: "blue", layout: "vertical", label: "pay" },
      createOrder: async () => {
        const total = (buySeatsModal.pricePerSeat * seatsToAdd).toFixed(2)
        const res   = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, description: `${seatsToAdd} extra seat(s)` }),
        })
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to create order") }
        const order = await res.json()
        if (!order.id) throw new Error("No order ID returned")
        return order.id
      },
      onApprove: async (data: any) => {
        try {
          setBuyingSeats(true)
          const res    = await fetch("/api/subscription/buy-extra-seats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: seatsToAdd, paypalOrderId: data.orderID }),
          })
          const result = await res.json()
          if (!res.ok) { setCollabError(result.error || "Purchase failed"); setBuyingSeats(false); return }
          setBuySeatsModal({ ...buySeatsModal, isOpen: false })
          setSeatsToAdd(1)
          if (inviteEmail) handleInvite(new Event("submit") as any)
        } catch (err) {
          setCollabError(err instanceof Error ? err.message : "An error occurred")
          setBuyingSeats(false)
        }
      },
      onError: () => { setCollabError("Payment failed. Please try again."); setBuyingSeats(false) },
    }).render(paypalRef.current)
  }, [buySeatsModal.isOpen, paypalLoaded])

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !brandId) return
    try {
      setInviting(true)
      setCollabError("")

      // Check seat limit first
      const limitRes  = await fetch(`/api/brand/${brandId}/collaborators/check-limit`)
      const limitData = await limitRes.json()
      if (!limitRes.ok) { setCollabError(limitData.error || "Failed to check limit"); return }

      if (limitData.canBuyMore) {
        setBuySeatsModal({
          isOpen: true,
          maxSeatsAvailable: limitData.maxSeatsAvailable,
          pricePerSeat: limitData.pricePerSeat,
          currentExtraSeats: limitData.currentExtraSeats,
          maxTotalSeats: limitData.maxTotalSeats,
        })
        setInviting(false)
        return
      }

      if (!limitData.allowed) {
        setCollabError("You've reached your collaborator limit. Upgrade your plan to add more.")
        setInviting(false)
        return
      }

      // Send invite
      const res  = await fetch(`/api/brand/${brandId}/collaborators/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) { setCollabError(data.error || "Failed to invite collaborator"); return }

      // Refresh list
      const refetch   = await fetch(`/api/brand/${brandId}/collaborators`)
      const refreshed = await refetch.json()
      setMembers(refreshed.members || [])
      setInviteEmail("")
      setInviteRole("manager")
    } catch (err) {
      setCollabError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (userId: string) => {
    if (!brandId || !confirm("Remove this collaborator?")) return
    try {
      setRemoving(userId)
      setCollabError("")
      const res  = await fetch(`/api/brand/${brandId}/collaborators/${userId}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) { setCollabError(data.error || "Failed to remove collaborator"); return }
      setMembers(members.filter(m => m.id !== userId))
    } catch (err) {
      setCollabError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setRemoving(null)
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

      {/* ── Divider ── */}
      <div className="py-10"><Separator /></div>

      {/* ═══════════════════════════════════════════════════
          SECTION 2 — TEAM & COLLABORATORS
      ═══════════════════════════════════════════════════ */}
      <section id="team" className="space-y-6">
        <div className="flex items-center gap-3 pb-1">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100">
            <IconUsers size={18} className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Team &amp; Collaborators</h2>
            <p className="text-sm text-muted-foreground">Invite teammates and manage their access levels</p>
          </div>
        </div>

        {collabError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <IconAlertCircle size={16} className="shrink-0" />
            {collabError}
          </div>
        )}

        {!brandId ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-gray-500">
              No brand selected. Please select a brand from the top bar to manage collaborators.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* LEFT — Owner + Invite form */}
            <div className="space-y-6">
              {owner && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Brand Owner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={owner.image || ""} alt={owner.name || ""} />
                        <AvatarFallback className="text-xs font-bold bg-[#0F6B3E] text-white">
                          {(owner.name || owner.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{owner.name || owner.email}</p>
                        <p className="text-xs text-gray-500 truncate">{owner.email}</p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 shrink-0">
                        <IconCrown size={11} /> Owner
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Invite a Collaborator</CardTitle>
                  <CardDescription>Send an invite to your team member</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <div className="relative">
                        <IconMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="inviteEmail"
                          type="email"
                          placeholder="colleague@example.com"
                          className="pl-9"
                          value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="inviteRole">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger id="inviteRole">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="researcher">Researcher</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      disabled={inviting || !inviteEmail.trim()}
                      className="w-full bg-[#1FAE5B] hover:bg-[#0F6B3E] gap-2"
                    >
                      <IconMail size={16} />
                      {inviting ? "Sending..." : "Send Invite"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT — Members list */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Team Members {!collabLoading && `(${members.length})`}
                </CardTitle>
                <CardDescription>People with access to this workspace</CardDescription>
              </CardHeader>
              <CardContent>
                {collabLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-6 w-6 rounded-full border-2 border-[#1FAE5B] border-t-transparent animate-spin" />
                  </div>
                ) : members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <IconMail size={20} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">No team members yet</p>
                    <p className="text-xs text-gray-500">Invite collaborators on the left to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group"
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={member.image || ""} alt={member.name || ""} />
                          <AvatarFallback className="text-xs font-bold bg-gray-100 text-gray-700">
                            {(member.name || member.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{member.name || member.email}</p>
                          <p className="text-xs text-gray-500 truncate">{member.email}</p>
                        </div>
                        <span className="text-xs font-semibold capitalize px-2.5 py-1 bg-[#1FAE5B]/10 text-[#0F6B3E] rounded-full border border-[#1FAE5B]/20 shrink-0">
                          {member.role}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(member.id)}
                          disabled={removing === member.id}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all shrink-0"
                        >
                          <IconTrash size={15} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* ── Divider ── */}
      <div className="py-10"><Separator /></div>

      {/* ═══════════════════════════════════════════════════
          SECTION 3 — BRANDING
      ═══════════════════════════════════════════════════ */}
      <section id="branding" className="space-y-6">
        <div className="flex items-center gap-3 pb-1">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100">
            <IconPalette size={18} className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Branding</h2>
            <p className="text-sm text-muted-foreground">Customize your dashboard with your brand identity</p>
          </div>
        </div>

        {brandingAllowed === null ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 rounded-full border-2 border-[#1FAE5B] border-t-transparent animate-spin" />
          </div>
        ) : !brandingAllowed ? (
          <>
            <Card className="border-2 border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gray-100 border border-gray-300 shrink-0">
                    <IconLock size={28} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Locked</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Custom branding is only available on the{" "}
                      <span className="font-semibold text-gray-900">Agency plan</span>.
                      Upgrade to access custom branding, logo uploads, and color customization.
                    </p>
                    <Link href="/pricing?cycle=monthly">
                      <Button className="bg-[#1FAE5B] hover:bg-[#0F6B3E] gap-2">
                        View Plans <IconArrowRight size={16} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Features Included</CardTitle>
                <CardDescription>What you&apos;ll unlock with the Agency plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: "Logo Upload",         desc: "Upload your company logo and favicon" },
                    { title: "Color Customization", desc: "Set primary and secondary brand colors" },
                    { title: "Branded Dashboard",   desc: "Fully customized dashboard experience" },
                  ].map(item => (
                    <div key={item.title} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-[#1FAE5B] mt-2 shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Logo</CardTitle>
                  <CardDescription>Upload your company logo (PNG, JPG, or SVG, max 5MB)</CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-[#1FAE5B] hover:bg-green-50 transition cursor-pointer group">
                      <IconUpload size={36} className="mx-auto text-gray-400 group-hover:text-[#1FAE5B] mb-3 transition" />
                      <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, or SVG • Max 5MB</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Brand Colors</CardTitle>
                  <CardDescription>Define your primary and secondary brand colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: "Primary Brand Color",  defaultVal: "#1FAE5B", hint: "Used for buttons, links, and accents" },
                    { label: "Secondary Brand Color", defaultVal: "#0F6B3E", hint: "Used for hover states and emphasis" },
                  ].map(c => (
                    <div key={c.label} className="space-y-3">
                      <Label className="text-sm font-medium">{c.label}</Label>
                      <div className="flex items-center gap-4">
                        <input type="color" defaultValue={c.defaultVal}
                          className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-[#1FAE5B] transition" />
                        <div className="flex-1">
                          <Input type="text" defaultValue={c.defaultVal} className="font-mono text-sm" />
                          <p className="text-xs text-gray-500 mt-1.5">{c.hint}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200">
                    <Button className="bg-[#1FAE5B] hover:bg-[#0F6B3E]">Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-base">Preview</CardTitle>
                  <CardDescription>Your brand colors in action</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colors</h4>
                    <div className="space-y-2">
                      {[{ label: "Primary", hex: "#1FAE5B" }, { label: "Secondary", hex: "#0F6B3E" }].map(sw => (
                        <div key={sw.label} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg shadow-md border border-gray-200" style={{ background: sw.hex }} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{sw.label}</p>
                            <p className="text-xs text-gray-600">{sw.hex}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Buttons</h4>
                    <div className="space-y-2">
                      <Button className="w-full bg-[#1FAE5B] hover:bg-[#0F6B3E] text-sm">Primary Button</Button>
                      <Button variant="outline" className="w-full text-[#1FAE5B] border-[#1FAE5B] hover:bg-[#1FAE5B] hover:text-white text-sm">
                        Secondary Button
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          BUY EXTRA SEATS MODAL
      ═══════════════════════════════════════════════════ */}
      {buySeatsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <IconBolt size={18} className="text-[#1FAE5B]" />
                Upgrade Your Seats
              </CardTitle>
              <CardDescription>Purchase additional seats to invite more team members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Seats Purchased</p>
                  <p className="text-3xl font-bold text-blue-900">{buySeatsModal.currentExtraSeats}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Max Available</p>
                  <p className="text-3xl font-bold text-emerald-900">{buySeatsModal.maxTotalSeats}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Number of Seats</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={seatsToAdd <= 1 || buyingSeats}
                    onClick={() => setSeatsToAdd(Math.max(1, seatsToAdd - 1))}>−</Button>
                  <Input type="number" min="1" max={buySeatsModal.maxSeatsAvailable} value={seatsToAdd}
                    onChange={e => setSeatsToAdd(Math.min(buySeatsModal.maxSeatsAvailable, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="text-center" disabled={buyingSeats} />
                  <Button variant="outline" size="sm" disabled={seatsToAdd >= buySeatsModal.maxSeatsAvailable || buyingSeats}
                    onClick={() => setSeatsToAdd(Math.min(buySeatsModal.maxSeatsAvailable, seatsToAdd + 1))}>+</Button>
                </div>
                <p className="text-xs text-gray-500">Up to {buySeatsModal.maxSeatsAvailable} more seat(s) available</p>
              </div>
              <div className="border-t pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Price per seat:</span>
                  <span className="font-medium">${buySeatsModal.pricePerSeat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-medium">{seatsToAdd} {seatsToAdd === 1 ? "seat" : "seats"}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-[#1FAE5B]">${(buySeatsModal.pricePerSeat * seatsToAdd).toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <Script
                  src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&intent=capture`}
                  strategy="afterInteractive"
                  onLoad={() => setPaypalLoaded(true)}
                />
                <div ref={paypalRef} />
                <Button variant="outline" className="w-full" disabled={buyingSeats}
                  onClick={() => {
                    setBuySeatsModal({ ...buySeatsModal, isOpen: false })
                    if (paypalRef.current) paypalRef.current.innerHTML = ""
                  }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
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