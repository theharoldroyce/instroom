'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { OnboardingForm } from '@/components/onboarding-form'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [showWelcome, setShowWelcome] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    goal: '',
    website: '',
    teamSize: '',
    revenue: '',
    source: '',
  })

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setShowWelcome(true)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!session?.user) {
        throw new Error("User session not found")
      }

      const userId = (session.user as any).id
      if (!userId) {
        throw new Error("User ID not found in session")
      }

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          goal: formData.goal,
          website: formData.website || null,
          team_size: formData.teamSize || null,
          revenue: formData.revenue || null,
          source: formData.source || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save onboarding data')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value })
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#0b0f0d] text-white">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-2xl items-center justify-center px-6 py-10">
        {error && (
          <div className="absolute top-6 left-6 right-6 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <OnboardingForm
          step={step}
          showWelcome={showWelcome}
          formData={formData}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={handleSubmit}
          onFormChange={handleFormChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
