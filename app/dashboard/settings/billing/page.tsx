"use client"
// app/dashboard/settings/billing/page.tsx

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  IconArrowRight,
  IconCreditCard,
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

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [subscription, setSubscription] = useState<any>(null)
  const [brandCount, setBrandCount]     = useState<number>(0)
  const [cancelling, setCancelling]     = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [toast, setToast]               = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch subscription (same call as settings page) ──────────────────────
  const fetchSubscription = () => {
    if (!session?.user?.id) return
    fetch("/api/subscription/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: session.user.id }),
    })
      .then(r => r.json())
      .then(d => setSubscription(d.subscription))
      .catch(() => {})
  }

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated" || !session?.user?.id) return
    fetchSubscription()
  }, [status, session?.user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Brand count (same call as settings page) ──────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/user/brand-usage")
      .then(r => r.json())
      .then(d => setBrandCount(d.brandCount || 0))
      .catch(() => {})
  }, [session?.user?.id])

  // ── Subscription display helpers (same as settings page) ─────────────────
  const planColors: Record<string, string> = {
    solo:   "bg-stone-100 text-stone-700",
    team:   "bg-emerald-50 text-emerald-800",
    agency: "bg-amber-50 text-amber-800",
  }
  const planName  = subscription?.plan?.name?.toLowerCase() || "solo"
  const planLabel = ({ solo: "Solo", team: "Team", agency: "Agency" } as Record<string, string>)[planName] || "Solo"
  const planColor = planColors[planName] || planColors.solo

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function openBillingPortal() {
    try {
      const res  = await fetch("/api/subscription/billing-portal", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else showToast("Could not open billing portal", "error")
    } catch {
      showToast("Could not open billing portal", "error")
    }
  }

  async function handleCancelSubscription() {
    if (!confirmCancel) { setConfirmCancel(true); return }
    setCancelling(true)
    try {
      const res  = await fetch("/api/subscription/cancel", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to cancel subscription")
      showToast("Subscription cancelled. You'll retain access until the period ends.", "success")
      setConfirmCancel(false)
      fetchSubscription()
    } catch (err: any) {
      showToast(err.message || "Something went wrong", "error")
      setConfirmCancel(false)
    } finally {
      setCancelling(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-[#1FAE5B] border-t-transparent animate-spin" />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 pb-16 space-y-0">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-6 z-50 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg"
          style={{ background: toast.type === "success" ? "#1FAE5B" : "#E24B4A" }}
        >
          {toast.message}
        </div>
      )}

      <section id="billing" className="space-y-6">
        <div className="flex items-center gap-3 pt-2 pb-1">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100">
            <IconCreditCard size={18} className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Billing &amp; Subscription</h2>
            <p className="text-sm text-muted-foreground">Manage your plan, usage, and payment method</p>
          </div>
        </div>

        {!subscription ? (
          <Card>
            <CardContent className="py-10 text-center space-y-3">
              <p className="text-sm text-gray-500">No active subscription found.</p>
              <Link href="/pricing?cycle=monthly">
                <Button className="bg-[#1FAE5B] hover:bg-[#0F6B3E] gap-1">
                  View Plans <IconArrowRight size={14} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* LEFT — Subscription */}
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

                <div className="pt-3 flex gap-2 flex-wrap">
                  <Link href="/pricing?cycle=monthly">
                    <Button variant="outline" size="sm" className="text-[#0F6B3E] border-[#1FAE5B] hover:bg-[#1FAE5B] hover:text-white gap-1">
                      Manage Plan <IconArrowRight size={14} />
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={openBillingPortal} className="gap-1 text-gray-600">
                    Payment &amp; Invoices
                  </Button>
                  {planName !== "free" && !subscription.cancel_at_period_end && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                        className={confirmCancel
                          ? "border-red-500 bg-red-500 text-white hover:bg-red-600"
                          : "border-red-300 text-red-600 hover:bg-red-50"}
                      >
                        {cancelling ? "Cancelling…" : confirmCancel ? "Confirm cancel" : "Cancel subscription"}
                      </Button>
                      {confirmCancel && (
                        <Button variant="outline" size="sm" onClick={() => setConfirmCancel(false)}>
                          Keep plan
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {subscription.cancel_at_period_end && (
                  <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    <IconAlertCircle size={15} className="shrink-0" />
                    Plan cancels on {new Date(subscription.current_period_end).toLocaleDateString()}. Access continues until then.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RIGHT — Plan Usage & Limits */}
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