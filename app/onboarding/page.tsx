'use client'

import { useState } from 'react'
import { OnboardingForm } from '@/components/onboarding-form'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [showWelcome, setShowWelcome] = useState(false)
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

  const handleSubmit = () => {
    // Handle form submission
    console.log('Form submitted:', formData)
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
        <OnboardingForm
          step={step}
          showWelcome={showWelcome}
          formData={formData}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={handleSubmit}
          onFormChange={handleFormChange}
        />
      </div>
    </div>
  )
}
