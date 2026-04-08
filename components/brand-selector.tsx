"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
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
import { Plus, Zap, AlertCircle } from "lucide-react"

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
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState("")
  
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
      } else if (data.allowed) {
        // Can create a new brand
        router.push("/dashboard/brand/create")
      } else {
        setError(data.message || "You've reached your brand limit and cannot purchase more.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
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
    return <div className="text-sm text-muted-foreground">Loading brands...</div>
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
        Create Brand
      </Button>
    )
  }

  const currentBrand = brands.find((b) => b.id === selectedBrandId)

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm max-w-xs">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">{error}</span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Select value={selectedBrandId} onValueChange={handleBrandChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                <div className="flex items-center gap-2">
                  {brand.logo_url && (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-4 w-4 rounded"
                    />
                  )}
                  {brand.name}
                </div>
              </SelectItem>
            ))}
            <div className="my-1 border-t" />
            <SelectItem value="create-new">
              <div className="flex items-center gap-2 text-primary">
                <Plus className="h-4 w-4" />
                Create New Brand
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buy Extra Brands Modal */}
      {buyBrandsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#1FAE5B]" />
                Buy Extra Brands
              </CardTitle>
              <CardDescription>
                You've reached your brand limit. Purchase extra brands to continue.
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
                    <p className="text-xs text-muted-foreground">Extra Brands Purchased</p>
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
                <Label htmlFor="brands">Number of Brands</Label>
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
                  You can purchase up to {buyBrandsModal.maxBrandsAvailable} more brand(s)
                </p>
              </div>

              {/* Price Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per brand:</span>
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
