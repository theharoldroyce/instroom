"use client"

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Trash2, Mail, Zap } from "lucide-react"
import Script from "next/script"

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
  interface Window {
    paypal?: any
  }
}

function CollaboratorsContent() {
  const searchParams = useSearchParams()
  const [brandId, setBrandId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const [owner, setOwner] = useState<Collaborator | null>(null)
  const [members, setMembers] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("manager")
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  // Extra seats modal state
  const [buySeatsModal, setBuySeatsModal] = useState<BuySeatsModalState>({
    isOpen: false,
    maxSeatsAvailable: 0,
    pricePerSeat: 0,
    currentExtraSeats: 0,
    maxTotalSeats: 0,
  })
  const [seatsToAdd, setSeatsToAdd] = useState(1)
  const [buyingSeats, setBuyingSeats] = useState(false)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const paypalRef = useRef<HTMLDivElement>(null)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Watch for brand changes from URL
  useEffect(() => {
    const id = searchParams.get("brandId")
    setBrandId(id)
  }, [searchParams])

  // Setup PayPal button when modal opens
  useEffect(() => {
    if (!buySeatsModal.isOpen || !paypalLoaded || !paypalRef.current) {
      return
    }

    // Only render once - don't clear and recreate on every state change
    if (paypalRef.current.innerHTML !== "") {
      return
    }

    if (window.paypal) {
      const button = window.paypal.Buttons({
        style: {
          shape: "pill",
          color: "blue",
          layout: "vertical",
          label: "pay",
        },
        createOrder: async (data: any, actions: any) => {
          try {
            // Calculate amount dynamically at time of order creation
            const totalAmount = (buySeatsModal.pricePerSeat * seatsToAdd).toFixed(2)
            
            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: totalAmount,
                description: `${seatsToAdd} extra seat(s) for collaborators`,
              }),
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || "Failed to create payment order")
            }
            
            const orderData = await response.json()
            if (!orderData.id) {
              throw new Error("No order ID returned from server")
            }
            return orderData.id
          } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to create payment order")
            throw error
          }
        },
        onApprove: async (data: any, actions: any) => {
          try {
            setBuyingSeats(true)
            // Call our API with the PayPal order ID
            const response = await fetch("/api/subscription/buy-extra-seats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                quantity: seatsToAdd,
                paypalOrderId: data.orderID,
              }),
            })

            const result = await response.json()

            if (!response.ok) {
              const errorMsg = result.details ? `${result.error}: ${result.details}` : result.error
              setError(errorMsg || "Failed to complete purchase")
              setBuyingSeats(false)
              return
            }

            // Close modal and reset
            setBuySeatsModal({ ...buySeatsModal, isOpen: false })
            setSeatsToAdd(1)
            setError("")

            // Automatically retry the invitation
            if (inviteEmail) {
              const form = new Event("submit")
              handleInvite(form as any)
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            setBuyingSeats(false)
          }
        },
        onError: (err: any) => {
          setError("Payment failed. Please try again.")
          setBuyingSeats(false)
        },
      })

      button.render(paypalRef.current)
    }
  }, [buySeatsModal.isOpen, buySeatsModal.pricePerSeat, paypalLoaded])

  // Fetch collaborators
  useEffect(() => {
    const fetchCollaborators = async () => {
      if (!brandId) return

      try {
        setLoading(true)
        setError("")
        const res = await fetch(`/api/brand/${brandId}/collaborators`)
        const data = await res.json()

        if (!res.ok) {
          // Handle specific error codes
          if (res.status === 403) {
            setError("You don't have permission to manage collaborators for this brand. Make sure you're the brand owner.")
          } else if (res.status === 404) {
            setError("Brand not found.")
          } else {
            setError(data.error || "Failed to fetch collaborators")
          }
          return
        }

        setOwner(data.owner)
        setMembers(data.members || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching collaborators")
      } finally {
        setLoading(false)
      }
    }

    fetchCollaborators()
  }, [brandId])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !brandId) return

    try {
      setInviting(true)
      setError("")

      // First check if they can add a collaborator
      const limitCheckRes = await fetch(
        `/api/brand/${brandId}/collaborators/check-limit`
      )
      const limitData = await limitCheckRes.json()

      if (!limitCheckRes.ok) {
        setError(limitData.error || "Failed to check collaborator limit")
        return
      }

      // If they can buy more seats (either hit limit or exceeded included seats)
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
        setError("You've reached your collaborator limit. Unable to purchase more seats for your plan. Upgrade your plan to add more collaborators.")
        setInviting(false)
        return
      }

      // Proceed with invitation
      const res = await fetch(`/api/brand/${brandId}/collaborators/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to invite collaborator")
        return
      }

      // Reload collaborators
      const refetch = await fetch(`/api/brand/${brandId}/collaborators`)
      const refreshed = await refetch.json()
      setMembers(refreshed.members || [])
      setInviteEmail("")
      setInviteRole("manager")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (userId: string) => {
    if (!brandId || !confirm("Remove this collaborator?")) return

    try {
      setRemoving(userId)
      setError("")
      const res = await fetch(`/api/brand/${brandId}/collaborators/${userId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to remove collaborator")
        return
      }

      // Remove from list
      setMembers(members.filter((m) => m.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setRemoving(null)
    }
  }

  if (!mounted) {
    return null
  }

  if (!brandId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Brand Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please select a brand to manage collaborators.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9F8] via-white to-[#F0F7F4]">
      <div className="max-w-full mx-auto p-4 sm:p-6 lg:p-12">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 shadow-sm animate-in fade-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        {/* Header Section */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Team Members</h2>
          <p className="text-gray-600 text-sm">Manage who has access to your brand</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Owner & Invite */}
          <div className="space-y-10">
            {/* Owner Section */}
            {owner && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Brand Owner</h2>
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-[#1FAE5B]/20">
                        <AvatarImage src={owner.image || ""} alt={owner.name || ""} />
                        <AvatarFallback className="bg-[#1FAE5B]/10 text-[#0F6B3E] font-semibold">
                          {(owner.name || owner.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{owner.name || owner.email}</p>
                        <p className="text-sm text-gray-500">{owner.email}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 bg-[#1FAE5B]/10 text-[#0F6B3E] text-xs font-semibold rounded-full border border-[#1FAE5B]/30">
                      Admin
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Invite Form */}
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Invite Team Member</h2>
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="pt-8 px-8">
                  <form onSubmit={handleInvite} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="collaborator@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="mt-2 rounded-lg border-gray-300 focus:border-[#1FAE5B] focus:ring-[#1FAE5B]/20"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger className="mt-2 rounded-lg border-gray-300 focus:border-[#1FAE5B]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="researcher">Researcher</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={inviting || !inviteEmail.trim()}
                      className="gap-2 w-full bg-[#1FAE5B] hover:bg-[#17a04e] text-white rounded-lg font-medium transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {inviting ? "Sending..." : "Send Invite"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Team Members */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Team Members ({members.length})</h2>
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-8 px-8">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-gray-500">Loading team members...</p>
                  </div>
                ) : members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <Mail className="h-7 w-7 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">No team members yet</p>
                    <p className="text-sm text-gray-500">Invite collaborators on the left to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-5 border border-gray-100 rounded-lg hover:bg-gray-50/50 hover:border-gray-200 transition-all group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="h-10 w-10 border border-gray-200">
                            <AvatarImage
                              src={member.image || ""}
                              alt={member.name || ""}
                            />
                            <AvatarFallback className="bg-gray-100 text-gray-700">
                              {(member.name || member.email).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {member.name || member.email}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold capitalize px-2.5 py-1 bg-[#1FAE5B]/10 text-[#0F6B3E] rounded-full border border-[#1FAE5B]/20 whitespace-nowrap">
                            {member.role}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(member.id)}
                            disabled={removing === member.id}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Buy Extra Seats Modal */}
      {buySeatsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-[#1FAE5B]/10 to-[#0F6B3E]/10 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-[#1FAE5B]" />
                Upgrade Your Seats
              </CardTitle>
              <CardDescription className="mt-2">
                Purchase additional seats to invite more team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Current Usage */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Current Plan</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-1">Seats Purchased</p>
                    <p className="text-3xl font-bold text-blue-900">{buySeatsModal.currentExtraSeats}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-lg border border-emerald-200">
                    <p className="text-xs text-emerald-600 font-medium mb-1">Max Available</p>
                    <p className="text-3xl font-bold text-emerald-900">{buySeatsModal.maxTotalSeats}</p>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <Label htmlFor="seats" className="text-sm font-medium text-gray-700">Number of Seats</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSeatsToAdd(Math.max(1, seatsToAdd - 1))}
                    disabled={seatsToAdd <= 1 || buyingSeats}
                    className="rounded-lg"
                  >
                    −
                  </Button>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max={buySeatsModal.maxSeatsAvailable}
                    value={seatsToAdd}
                    onChange={(e) => setSeatsToAdd(Math.min(buySeatsModal.maxSeatsAvailable, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="text-center font-medium rounded-lg border-gray-300 focus:border-[#1FAE5B] focus:ring-[#1FAE5B]/20"
                    disabled={buyingSeats}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSeatsToAdd(Math.min(buySeatsModal.maxSeatsAvailable, seatsToAdd + 1))}
                    disabled={seatsToAdd + 1 > buySeatsModal.maxSeatsAvailable || buyingSeats}
                    className="rounded-lg"
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  Up to {buySeatsModal.maxSeatsAvailable} more seat(s) available
                </p>
              </div>

              {/* Price Summary */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Price per seat:</span>
                  <span className="font-semibold text-gray-900">${buySeatsModal.pricePerSeat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold text-gray-900">{seatsToAdd} {seatsToAdd === 1 ? 'seat' : 'seats'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-[#1FAE5B]">
                    ${(buySeatsModal.pricePerSeat * seatsToAdd).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Script
                  src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&intent=capture`}
                  strategy="afterInteractive"
                  onLoad={() => setPaypalLoaded(true)}
                />
                <div ref={paypalRef} className="paypal-button-container" />
                <Button
                  variant="outline"
                  onClick={() => {
                    setBuySeatsModal({ ...buySeatsModal, isOpen: false })
                    if (paypalRef.current) {
                      paypalRef.current.innerHTML = ""
                    }
                  }}
                  disabled={buyingSeats}
                  className="w-full rounded-lg border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}

export default function CollaboratorsPage() {
  return (
    <Suspense>
      <CollaboratorsContent />
    </Suspense>
  )
}
