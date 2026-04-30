"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Palette, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

function BrandingContent() {
  const searchParams = useSearchParams()
  const [brandId, setBrandId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Session (for branding access check)
  const { data: session } = useSession()

  // Branding state
  const [brandingAllowed, setBrandingAllowed] = useState<boolean | null>(null)
  const [brandName, setBrandName] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)
  const [savingBranding, setSavingBranding] = useState(false)
  const [brandingSaved, setBrandingSaved] = useState(false)
  const [error, setError] = useState("")

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Watch for brand changes from URL
  useEffect(() => {
    const id = searchParams.get("brandId")
    setBrandId(id)
  }, [searchParams])

  // Fetch branding access
  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/subscription/branding-access")
      .then(r => r.json())
      .then(d => setBrandingAllowed(d.allowed ?? false))
      .catch(() => setBrandingAllowed(false))
  }, [session?.user?.id])

  // Fetch current brand details
  useEffect(() => {
    if (!brandId) return
    fetch(`/api/brand/${brandId}/collaborators`)
      .then(r => r.json())
      .then(data => {
        if (data.brand) {
          setBrandName(data.brand.name || "")
          setCurrentLogo(data.brand.logo_url || null)
        }
      })
      .catch(err => console.error("Error fetching brand:", err))
  }, [brandId])

  const handleSaveBranding = async () => {
    try {
      setSavingBranding(true)
      const formData = new FormData()
      formData.append("brandId", brandId!)
      formData.append("brandName", brandName)
      if (logoFile) {
        formData.append("logo", logoFile)
      }

      const response = await fetch("/api/brand/branding", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json()
        setError(err.error || "Failed to save branding")
        return
      }

      const data = await response.json()
      setCurrentLogo(data.logoUrl || null)
      setLogoFile(null)
      setLogoPreview(null)
      setBrandingSaved(true)
      setTimeout(() => setBrandingSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save branding")
    } finally {
      setSavingBranding(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = async () => {
    try {
      setSavingBranding(true)
      const response = await fetch("/api/brand/branding", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      })

      if (!response.ok) {
        const err = await response.json()
        setError(err.error || "Failed to remove logo")
        return
      }

      setCurrentLogo(null)
      setLogoFile(null)
      setLogoPreview(null)
      setBrandingSaved(true)
      setTimeout(() => setBrandingSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove logo")
    } finally {
      setSavingBranding(false)
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
              Please select a brand to customize branding.
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

        {/* ══════════════════════════════════════════════
          BRANDING
      ══════════════════════════════════════════════ */}
        <div className="mb-10 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100">
              <Palette className="h-[18px] w-[18px] text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Branding</h2>
              <p className="text-sm text-gray-500">Customize your brand appearance</p>
            </div>
          </div>

          {brandingAllowed === null ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 rounded-full border-2 border-[#1FAE5B] border-t-transparent animate-spin" />
            </div>
          ) : !brandingAllowed ? (
            <div className="flex items-start gap-4 p-6 rounded-xl border-2 border-gray-200 bg-white">
              <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gray-100 border border-gray-300 shrink-0">
                <Lock className="h-7 w-7 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Upgrade to Customize Branding</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Custom branding is available on <span className="font-semibold text-gray-900">Solo and Team plans</span>. Upgrade your subscription to customize your brand.
                </p>
                <Link href="/pricing?cycle=monthly">
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1FAE5B] hover:bg-[#0F6B3E] text-white text-sm font-medium transition-colors">
                    View Plans <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
                {/* Logo Section - Horizontal Layout */}
                <div className="flex items-start gap-6">
                  {/* Logo Preview */}
                  <div className="flex items-center justify-center w-20 h-20 rounded-lg bg-gray-100 border border-gray-300 flex-shrink-0 overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : currentLogo ? (
                      <img src={currentLogo} alt="Current logo" className="w-full h-full object-cover" />
                    ) : (
                      <Palette className="h-10 w-10 text-gray-600" />
                    )}
                  </div>
                  
                  {/* Upload Controls */}
                  <div className="flex-1">
                    <label htmlFor="logo-input" className="text-sm font-medium text-[#1FAE5B] hover:text-[#0F6B3E] transition mb-1 block cursor-pointer">
                      Upload logo
                    </label>
                    <input
                      id="logo-input"
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoChange}
                      disabled={savingBranding}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-400 mb-4">PNG, JPG, SVG or WebP — max 5MB</p>
                    {(currentLogo || logoPreview) && (
                      <button 
                        onClick={handleRemoveLogo}
                        disabled={savingBranding}
                        className="text-sm text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                      >
                        Remove logo
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Brand Name */}
                <div className="space-y-2 w-1/2">
                  <label className="text-sm font-medium text-gray-700">Brand Name</label>
                  <input
                    type="text"
                    placeholder="Enter your brand name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1FAE5B] focus:ring-2 focus:ring-[#1FAE5B]/20 text-sm"
                  />
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <button
                    onClick={handleSaveBranding}
                    disabled={savingBranding}
                    className="px-4 py-2 rounded-lg bg-[#1FAE5B] hover:bg-[#0F6B3E] text-white text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {savingBranding ? "Saving..." : brandingSaved ? "✓ Saved!" : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BrandingPage() {
  return (
    <Suspense>
      <BrandingContent />
    </Suspense>
  )
}
