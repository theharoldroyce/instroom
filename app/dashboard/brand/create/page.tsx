"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function CreateBrandPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/brand/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create brand")
        return
      }

      // Redirect to dashboard with new brand ID
      router.push(`/dashboard/pipeline?brandId=${data.brand.id}`)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl shadow-lg p-8 border border-[#0F6B3E]/15 bg-gradient-to-b from-white via-white to-[#0F6B3E]/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1FAE5B] to-transparent" />
          <CardHeader className="gap-2 pb-2 pt-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You need to be signed in to create a brand.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl border border-[#0F6B3E]/20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1FAE5B] to-transparent" />
        
        <CardHeader className="gap-2 pb-2 pt-6">
          <CardTitle className="text-2xl font-bold text-gray-900">Create a New Brand</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Set up your brand profile to start managing influencers
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 pb-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="font-medium text-gray-700 text-sm">
                Brand Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., My Fashion Brand"
                required
                className="mt-2 border border-gray-200 focus:border-[#1FAE5B] focus:ring-[#1FAE5B]/20"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description" className="font-medium text-gray-700 text-sm">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What does your brand do?"
                className="mt-2 border border-gray-200 focus:border-[#1FAE5B] focus:ring-[#1FAE5B]/20"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="website_url" className="font-medium text-gray-700 text-sm">
                Website URL
              </Label>
              <Input
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://example.com"
                type="url"
                className="mt-2 border border-gray-200 focus:border-[#1FAE5B] focus:ring-[#1FAE5B]/20"
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.name}
                className="flex-1 bg-[#1FAE5B] hover:bg-[#0F6B3E] text-white font-medium"
              >
                {loading ? "Creating..." : "Create Workspace"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
