"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Script from "next/script"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Zap, AlertCircle, Check, ChevronDown } from "lucide-react"

interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  isOwner: boolean
}

interface BuyBrandsModalState {
  isOpen: boolean
  maxBrandsAvailable: number
  pricePerBrand: number
  currentExtraBrands: number
  maxTotalBrands: number
}

export function BrandSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Buy brands modal state
  const [buyBrandsModal, setBuyBrandsModal] = useState<BuyBrandsModalState>({
    isOpen: false,
    maxBrandsAvailable: 0,
    pricePerBrand: 0,
    currentExtraBrands: 0,
    maxTotalBrands: 0,
  })
  const [brandsToAdd, setBrandsToAdd] = useState(1)
  const [buyingBrands, setBuyingBrands] = useState(false)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const paypalRef = useRef<HTMLDivElement>(null)

  // Read brandId from URL on client side after mount
  useEffect(() => {
    setMounted(true)
    const params = new URLSearchParams(window.location.search)
    const brandId = params.get("brandId")
    
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brand/list")
        
        if (response.ok) {
          const data = await response.json()
          setBrands(data.brands)
          
          // Set selected brand from URL or first brand
          if (brandId) {
            setSelectedBrandId(brandId)
          } else if (data.brands.length > 0) {
            setSelectedBrandId(data.brands[0].id)
            // Auto-navigate to first brand if no brand selected
            const newParams = new URLSearchParams()
            newParams.set("brandId", data.brands[0].id)
            router.push(`${pathname}?${newParams.toString()}`)
          }
        }
      } catch (error) {
        // Failed to fetch brands
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [pathname, router])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen])

  const handleBrandChange = (brandId: string) => {
    if (brandId === "create-new") {
      checkBrandLimitAndBuy()
    } else {
      setSelectedBrandId(brandId)
      // Update URL with new brandId on current page
      const params = new URLSearchParams()
      params.set("brandId", brandId)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  const checkBrandLimitAndBuy = async () => {
    try {
      setError("")
      const res = await fetch("/api/subscription/check-brand-limit")
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to check brand limit")
        console.error("Brand limit check failed:", data)
        return
      }

      if (data.canBuyMore) {
        // Open buy brands modal
        setBuyBrandsModal({
          isOpen: true,
          maxBrandsAvailable: data.maxBrandsAvailable,
          pricePerBrand: data.pricePerBrand,
          currentExtraBrands: data.currentExtraBrands,
          maxTotalBrands: data.maxTotalBrands,
        })
        setBrandsToAdd(1)
        setError("") // Clear any previous errors
      } else if (data.allowed) {
        // Can create a new brand
        router.push("/dashboard/brand/create")
      } else {
        setError(data.message || "You've reached your brand limit and cannot purchase more.")
        console.warn("Cannot buy more brands:", data)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred"
      setError(errorMsg)
      console.error("Brand limit check error:", err)
    }
  }

  // Setup PayPal button when modal opens
  useEffect(() => {
    if (!buyBrandsModal.isOpen || !paypalLoaded || !paypalRef.current) {
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
            const totalAmount = (buyBrandsModal.pricePerBrand * brandsToAdd).toFixed(2)
            
            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: totalAmount,
                description: `${brandsToAdd} extra brand(s)`,
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
            setBuyingBrands(true)
            // Call our API with the PayPal order ID
            const response = await fetch("/api/subscription/buy-extra-brands", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                quantity: brandsToAdd,
                paypalOrderId: data.orderID,
              }),
            })

            const result = await response.json()

            if (!response.ok) {
              const errorMsg = result.details ? `${result.error}: ${result.details}` : result.error
              setError(errorMsg || "Failed to complete purchase")
              setBuyingBrands(false)
              return
            }

            // Close modal and reset
            setBuyBrandsModal({ ...buyBrandsModal, isOpen: false })
            setBrandsToAdd(1)
            setError("")

            // Redirect to create new brand
            router.push("/dashboard/brand/create")
          } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            setBuyingBrands(false)
          }
        },
        onError: (err: any) => {
          setError("Payment failed. Please try again.")
          setBuyingBrands(false)
        },
      })

      button.render(paypalRef.current)
    }
  }, [buyBrandsModal.isOpen, buyBrandsModal.pricePerBrand, paypalLoaded])

  if (!mounted || loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  if (brands.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/dashboard/brand/create")}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Create Workspace
      </Button>
    )
  }

  const currentBrand = brands.find((b) => b.id === selectedBrandId)
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase()
  
  // Separate owned and shared brands
  const ownedBrands = brands.filter((b) => b.isOwner)
  const sharedBrands = brands.filter((b) => !b.isOwner)

  return (
    <>
      {error && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button - Current Brand */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
        >
          {currentBrand?.logo_url ? (
            <img
              src={currentBrand.logo_url}
              alt={currentBrand.name}
              className="h-6 w-6 rounded"
            />
          ) : (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs font-semibold">{getInitials(currentBrand?.name || "")}</AvatarFallback>
            </Avatar>
          )}
          <span className="text-sm font-medium">{currentBrand?.name}</span>
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* Workspaces Header */}
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">My Workspaces</p>
            </div>

            {/* Brands List */}
            <div className="max-h-64 overflow-y-auto">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => {
                    setSelectedBrandId(brand.id)
                    const params = new URLSearchParams()
                    params.set("brandId", brand.id)
                    router.push(`${pathname}?${params.toString()}`)
                    setDropdownOpen(false)
                  }}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-10 w-10 rounded flex-shrink-0"
                    />
                  ) : (
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="text-sm font-semibold">{getInitials(brand.name)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{brand.name}</p>
                    {brand.isOwner && (
                      <p className="text-xs text-gray-500">Owner</p>
                    )}
                  </div>
                  {brand.id === selectedBrandId && (
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Shared Brands Section */}
            {sharedBrands.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Shared With You</p>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {sharedBrands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => {
                        setSelectedBrandId(brand.id)
                        const params = new URLSearchParams()
                        params.set("brandId", brand.id)
                        router.push(`${pathname}?${params.toString()}`)
                        setDropdownOpen(false)
                      }}
                      className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="h-10 w-10 rounded flex-shrink-0"
                        />
                      ) : (
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="text-sm font-semibold">{getInitials(brand.name)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{brand.name}</p>
                      </div>
                      {brand.id === selectedBrandId && (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Create New Brand Button */}
            <div className="border-t border-gray-100 px-5 py-3">
              <button
                onClick={() => {
                  checkBrandLimitAndBuy()
                  setDropdownOpen(false)
                }}
                className="w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 py-2 px-3 rounded-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Buy Extra Brands Modal */}
      {buyBrandsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#1FAE5B]" />
                Buy Extra Workspaces
              </CardTitle>
              <CardDescription>
                You've reached your workspace limit. Purchase extra workspaces to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Current Usage */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Subscription</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Extra Workspaces Purchased</p>
                    <p className="text-2xl font-bold text-gray-900">{buyBrandsModal.currentExtraBrands}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-muted-foreground">Max Available</p>
                    <p className="text-2xl font-bold text-gray-900">{buyBrandsModal.maxTotalBrands}</p>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <Label htmlFor="brands">Number of Workspaces</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBrandsToAdd(Math.max(1, brandsToAdd - 1))}
                    disabled={brandsToAdd <= 1 || buyingBrands}
                  >
                    −
                  </Button>
                  <Input
                    id="brands"
                    type="number"
                    min="1"
                    max={buyBrandsModal.maxBrandsAvailable}
                    value={brandsToAdd}
                    onChange={(e) => setBrandsToAdd(Math.min(buyBrandsModal.maxBrandsAvailable, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="text-center"
                    disabled={buyingBrands}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBrandsToAdd(Math.min(buyBrandsModal.maxBrandsAvailable, brandsToAdd + 1))}
                    disabled={brandsToAdd + 1 > buyBrandsModal.maxBrandsAvailable || buyingBrands}
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You can purchase up to {buyBrandsModal.maxBrandsAvailable} more workspace(s)
                </p>
              </div>

              {/* Price Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per workspace:</span>
                  <span className="font-medium">${buyBrandsModal.pricePerBrand.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{brandsToAdd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold text-[#1FAE5B]">
                    ${(buyBrandsModal.pricePerBrand * brandsToAdd).toFixed(2)}
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
                    setBuyBrandsModal({ ...buyBrandsModal, isOpen: false })
                    // Clean up PayPal button for next time
                    if (paypalRef.current) {
                      paypalRef.current.innerHTML = ""
                    }
                  }}
                  disabled={buyingBrands}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
