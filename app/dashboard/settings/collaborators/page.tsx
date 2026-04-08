"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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

export default function CollaboratorsPage() {
  const searchParams = useSearchParams()
  const [brandId, setBrandId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const [owner, setOwner] = useState<Collaborator | null>(null)
  const [members, setMembers] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("collaborator")
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
      setInviteRole("collaborator")
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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team & Collaborators</h1>
        <p className="text-muted-foreground mt-2">Manage who has access to your brand</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Owner */}
      {owner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={owner.image || ""} alt={owner.name || ""} />
                  <AvatarFallback>
                    {(owner.name || owner.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{owner.name || owner.email}</p>
                  <p className="text-xs text-muted-foreground">{owner.email}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-background rounded">
                Owner
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite Collaborator</CardTitle>
          <CardDescription>
            Add team members to collaborate on your brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collaborator">Collaborator</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              {inviting ? "Sending..." : "Send Invite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Collaborators List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading collaborators...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No collaborators yet. Invite team members to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.image || ""}
                        alt={member.name || ""}
                      />
                      <AvatarFallback>
                        {(member.name || member.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {member.name || member.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium capitalize px-2 py-1 bg-muted rounded">
                      {member.role}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                      disabled={removing === member.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

      {/* Buy Extra Seats Modal */}
      {buySeatsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#1FAE5B]" />
                Buy Extra Seats
              </CardTitle>
              <CardDescription>
                You've reached your collaborator limit. Purchase extra seats to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Usage */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Subscription</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Extra Seats Purchased</p>
                    <p className="text-2xl font-bold text-gray-900">{buySeatsModal.currentExtraSeats}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Max Available</p>
                    <p className="text-2xl font-bold text-gray-900">{buySeatsModal.maxTotalSeats}</p>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <Label htmlFor="seats">Number of Seats</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSeatsToAdd(Math.max(1, seatsToAdd - 1))}
                    disabled={seatsToAdd <= 1 || buyingSeats}
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
                    className="text-center"
                    disabled={buyingSeats}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSeatsToAdd(Math.min(buySeatsModal.maxSeatsAvailable, seatsToAdd + 1))}
                    disabled={seatsToAdd + 1 > buySeatsModal.maxSeatsAvailable || buyingSeats}
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can purchase up to {buySeatsModal.maxSeatsAvailable} more seat(s)
                </p>
              </div>

              {/* Price Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per seat:</span>
                  <span className="font-medium">${buySeatsModal.pricePerSeat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{seatsToAdd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold text-[#1FAE5B]">
                    ${(buySeatsModal.pricePerSeat * seatsToAdd).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
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
                    // Clean up PayPal button for next time
                    if (paypalRef.current) {
                      paypalRef.current.innerHTML = ""
                    }
                  }}
                  disabled={buyingSeats}
                  className="w-full"
                >
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
