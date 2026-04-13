"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ForgotPasswordModal } from "@/components/forgot-password-modal"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(
    searchParams?.get("showForgotPassword") === "true"
  )
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and password are required")
      return
    }

    setIsLoading(true)

    try {
      // Check rate limit first
      const rateLimitResponse = await fetch("/api/auth/check-rate-limit", {
        method: "POST",
      })

      const rateLimitData = await rateLimitResponse.json()

      if (!rateLimitResponse.ok || rateLimitData.blocked) {
        setError(rateLimitData.error || "Too many login attempts. Please try again later.")
        setIsLoading(false)
        return
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      try {
        const onboardingResponse = await fetch("/api/check-onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        })

        if (onboardingResponse.ok) {
          const { isComplete } = await onboardingResponse.json()
          router.push(isComplete ? "/dashboard" : "/onboarding")
        } else {
          router.push("/onboarding")
        }
      } catch (err) {
        console.error("Failed to check onboarding status:", err)
        router.push("/onboarding")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await signIn("google", {
        callbackUrl: "/api/auth/redirect",
        redirect: true
      })
    } catch (err) {
      setError("Google login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-sm sm:max-w-lg">
      <Card className={cn(className, "rounded-2xl shadow-lg p-6 sm:p-8 border border-[#0F6B3E]/15 bg-gradient-to-b from-white via-white to-[#0F6B3E]/5 relative overflow-hidden")} {...props}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1FAE5B] to-transparent" />
        <CardHeader className="gap-2 pb-2 pt-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Sign in to Instroom</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-600">
            Choose your preferred login method
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-6 rounded-lg border border-[#F4B740]/40 bg-[#F4B740]/8 p-3 text-sm text-[#C87500]">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="font-medium text-gray-700 text-sm">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  className="rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#0F6B3E] focus:ring-[#0F6B3E]/20 transition-colors"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="font-medium text-gray-700 text-sm">
                    Password
                  </FieldLabel>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="ml-auto text-xs text-[#0F6B3E] underline-offset-4 hover:text-[#1FAE5B] hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  className="rounded-lg border border-gray-200 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#0F6B3E] focus:ring-[#0F6B3E]/20 transition-colors"
                />
              </Field>
              <Field className="space-y-2 sm:space-y-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 sm:h-11 w-full text-sm sm:text-base bg-[#1FAE5B] text-white font-semibold rounded-lg shadow-md hover:bg-[#17a04e] hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? "Signing in..." : "Sign in with Email"}
                </Button>
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="h-10 sm:h-11 w-full text-sm sm:text-base border-2 border-[#0F6B3E]/20 bg-[#0F6B3E]/5 text-[#0F6B3E] rounded-lg hover:bg-[#0F6B3E]/10 hover:border-[#0F6B3E]/40 transition-all font-medium"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC02"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </Button>
              </Field>
              <Field className="pt-2 border-t border-gray-100">
                <FieldDescription className="text-center text-xs sm:text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="text-[#0F6B3E] hover:text-[#1FAE5B] font-semibold">
                    Sign up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-0 sm:px-6 text-center text-xs sm:text-sm text-[#1E1E1E]">
        By clicking continue, you agree to our{" "}
        <a href="#" className="text-[#2C8EC4] hover:text-[#1FAE5B] font-medium">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-[#2C8EC4] hover:text-[#1FAE5B] font-medium">
          Privacy Policy
        </a>
        .
      </FieldDescription>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => {
          setShowForgotPassword(false)
          // Clean up URL
          router.replace("/login")
        }}
      />
    </div>
  )
}
