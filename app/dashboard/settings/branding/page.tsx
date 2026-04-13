import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasCustomBranding } from "@/lib/subscription-limits"
import { redirect } from "next/navigation"
import Link from "next/link"
import { IconLock, IconArrowRight, IconUpload, IconPalette } from "@tabler/icons-react"
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

export default async function BrandingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const access = await hasCustomBranding(session.user.id)

  if (!access.allowed) {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Custom Branding</h1>
          <p className="text-muted-foreground mt-2">
            Customize your dashboard with your brand identity. Available on the Agency plan.
          </p>
        </div>

        {/* Feature Locked Card */}
        <Card className="border-2 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gray-100 border border-gray-300">
                  <IconLock size={28} className="text-gray-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Locked</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Custom branding is only available on the <span className="font-semibold text-gray-900">Agency plan</span>. Upgrade to access custom branding, logo uploads, and color customization.
                </p>
                <Link href="/pricing?cycle=monthly">
                  <Button variant="default" className="bg-[#1FAE5B] hover:bg-[#0F6B3E] gap-2">
                    View Plans
                    <IconArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Features Included</CardTitle>
            <CardDescription>What you'll unlock with the Agency plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Logo Upload", desc: "Upload your company logo and favicon" },
                { title: "Color Customization", desc: "Set primary and secondary brand colors" },
                { title: "Branded Dashboard", desc: "Fully customized dashboard experience" },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#1FAE5B] mt-2" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User has access to custom branding
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Custom Branding</h1>
        <p className="text-muted-foreground mt-2">
          Customize your dashboard with your brand colors and logo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logo</CardTitle>
              <CardDescription>
                Upload your company logo (PNG, JPG, or SVG, max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-[#1FAE5B] hover:bg-blue-50 transition cursor-pointer group">
                  <IconUpload size={36} className="mx-auto text-gray-400 group-hover:text-[#1FAE5B] mb-3 transition" />
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, or SVG • Max 5MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </CardContent>
          </Card>

          {/* Colors Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brand Colors</CardTitle>
              <CardDescription>
                Define your primary and secondary brand colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Color */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Primary Brand Color</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    defaultValue="#1FAE5B"
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-[#1FAE5B] transition"
                  />
                  <div className="flex-1">
                    <Input
                      type="text"
                      defaultValue="#1FAE5B"
                      className="font-mono text-sm"
                      placeholder="#1FAE5B"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Used for buttons, links, and accents</p>
                  </div>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Secondary Brand Color</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    defaultValue="#0F6B3E"
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-[#0F6B3E] transition"
                  />
                  <div className="flex-1">
                    <Input
                      type="text"
                      defaultValue="#0F6B3E"
                      className="font-mono text-sm"
                      placeholder="#0F6B3E"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Used for hover states and emphasis</p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button className="bg-[#1FAE5B] hover:bg-[#0F6B3E]">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>Your brand colors in action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Swatches */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#1FAE5B] shadow-md border border-gray-200" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Primary</p>
                      <p className="text-xs text-gray-600">#1FAE5B</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#0F6B3E] shadow-md border border-gray-200" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Secondary</p>
                      <p className="text-xs text-gray-600">#0F6B3E</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Buttons</h4>
                <div className="space-y-2">
                  <Button className="w-full bg-[#1FAE5B] hover:bg-[#0F6B3E] text-sm">
                    Primary Button
                  </Button>
                  <Button variant="outline" className="w-full text-[#1FAE5B] border-[#1FAE5B] hover:bg-[#1FAE5B] hover:text-white text-sm">
                    Secondary Button
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
