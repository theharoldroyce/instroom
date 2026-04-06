'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { OnboardingForm } from '@/components/onboarding-form'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
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
  const [subscriptionChecked, setSubscriptionChecked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        if (status === "loading") return;
        if (!session?.user) {
          router.replace("/signup");
          return;
        }
        const userId = (session.user as any).id;
        if (!userId) {
          router.replace("/signup");
          return;
        }
        console.log("🔍 Checking subscription for user:", userId);
        const res = await fetch("/api/subscription/check", {
          method: "POST",
          body: JSON.stringify({ user_id: userId }),
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("❌ Subscription check failed:", data);
          setError(data.error || "Failed to check subscription");
          setSubscriptionChecked(true);
          return;
        }
        const data = await res.json();
        console.log("✅ Subscription check result:", data);
        if (!data.active) {
          console.log("⚠️ User not subscribed, redirecting to pricing");
          router.replace("/pricing");
          return;
        }
        setIsSubscribed(true);
        setSubscriptionChecked(true);
      } catch (err) {
        console.error("❌ Error checking subscription:", err);
        setError(err instanceof Error ? err.message : "Failed to check subscription");
        setSubscriptionChecked(true);
      }
    }
    checkSubscription()
  }, [status, session, router])

  const handleSkip = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!session?.user) {
        throw new Error("User session not found");
      }
      const userId = (session.user as any).id;
      if (!userId) {
        throw new Error("User ID not found in session");
      }
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          goal: null,
          website: null,
          team_size: null,
          revenue: null,
          source: null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save onboarding data');
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.goal) {
        setError('Please select your primary goal to continue.')
        return
      }
    }
    if (step === 2) {
      // Website is optional - no validation needed
      setError(null)
    }
    if (step === 3) {
      if (!formData.teamSize) {
        setError('Please select your team size to continue.')
        return
      }
    }
    if (step === 4) {
      if (!formData.revenue) {
        setError('Please select your monthly revenue to continue.')
        return
      }
    }
    if (step === 5) {
      if (!formData.source) {
        setError('Please select how you heard about us to continue.')
        return
      }
    }
    setError(null)
    if (step < 5) {
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
    <div className="relative min-h-svh overflow-hidden bg-[#F7F9F8] text-[#1E1E1E]">
      <div className="pointer-events-none absolute top-0 left-0 w-96 h-96 rounded-full bg-[#1FAE5B]/8 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#0F6B3E]/6 blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-[#2C8EC4]/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-5xl items-center justify-center px-4 py-10">
        {error && (
          <div className="fixed right-8 bottom-8 z-50 rounded-lg border border-red-500/50 bg-red-500/90 p-4 text-sm text-white shadow-lg animate-fade-in">
            {error}
          </div>
        )}
        {/* Only show onboarding form if subscription is checked and user is subscribed */}
        {subscriptionChecked && isSubscribed && (
          <OnboardingForm
            step={step}
            showWelcome={showWelcome}
            formData={formData}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            onFormChange={handleFormChange}
            onSkip={handleSkip}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
