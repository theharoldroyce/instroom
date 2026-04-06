"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  isOwner: boolean
}

export function BrandSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  const [mounted, setMounted] = useState(false)

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
      router.push("/dashboard/brand/create")
    } else {
      setSelectedBrandId(brandId)
      // Update URL with new brandId on current page
      const params = new URLSearchParams()
      params.set("brandId", brandId)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

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
  )
}
