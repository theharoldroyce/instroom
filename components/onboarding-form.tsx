import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface OnboardingFormProps {
  step: number
  showWelcome: boolean
  formData: {
    goal: string
    website: string
    teamSize: string
    revenue: string
    source: string
  }
  onNext: () => void
  onBack: () => void
  onSubmit: () => void
  onFormChange: (key: string, value: string) => void
  onSkip: () => void
  isLoading?: boolean
  imageWidth?: number | string
  imageHeight?: number | string
}

const STEPS = [
  { number: 1, title: 'Your Goal', emoji: '🎯', tip: "We'll personalize your\ndashboard around this" },
  { number: 2, title: 'Website Link', emoji: '🔗', tip: 'Helps us connect analytics\nto your brand' },
  { number: 3, title: 'Team Size', emoji: '👥', tip: "We'll set up the right\nworkspace for your team" },
  { number: 4, title: 'Monthly Revenue', emoji: '💰', tip: 'Helps us recommend the\nright plan for you' },
  { number: 5, title: 'How You Found Us', emoji: '🔍', tip: 'Almost done —\njust one last question!' },
]

export function OnboardingForm({
  step,
  showWelcome,
  formData,
  onNext,
  onBack,
  onSubmit,
  onFormChange,
  onSkip,
  isLoading = false,
  imageWidth = '250px',
  imageHeight = '90%',
}: OnboardingFormProps) {
  const currentStep = STEPS[step - 1]

  const validateStep = (): string | null => {
    switch (step) {
      case 1:
        if (!formData.goal) return "Please select your primary goal to continue."
        return null
      case 2:
        // Website is optional
        return null
      case 3:
        if (!formData.teamSize) return "Please select your team size to continue."
        return null
      case 4:
        if (!formData.revenue) return "Please select your monthly revenue to continue."
        return null
      case 5:
        if (!formData.source) return "Please select how you heard about us to continue."
        return null
      default:
        return null
    }
  }

  const handleNext = () => {
    const error = validateStep()
    if (error) {
      alert(error)
      return
    }
    onNext()
  }

  if (showWelcome) {
    return (
      <div className="flex w-full max-w-2xl rounded-3xl overflow-hidden shadow-xl bg-gradient-to-b from-white via-white to-[#0F6B3E]/5 border border-[#0F6B3E]/15 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1FAE5B] to-transparent" />
        <div className="w-full px-10 py-12 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            You're all set!
          </h1>
          <p className="text-gray-600 mb-8 max-w-sm">
            Your Instroom account is ready. Start exploring your analytics dashboard.
          </p>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="h-12 px-12 bg-[#4caf50] text-white font-semibold hover:bg-[#2d7d32] rounded-full"
          >
            {isLoading ? 'Getting Started...' : 'Get Started →'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-5xl h-[520px] rounded-3xl overflow-hidden shadow-xl bg-gradient-to-b from-white via-white to-[#0F6B3E]/5 border border-[#0F6B3E]/15 relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1FAE5B] to-transparent" />
      {/* Left Content Area */}
      <div className="flex-1 px-12 py-8 flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Image 
            src="/images/instroomLogo.png" 
            alt="Instroom Logo" 
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="font-bold text-gray-900">Instroom</span>
        </div>

        {/* Step Indicator */}
        <div className="text-xs font-semibold text-gray-500 mb-2 tracking-wider">
          STEP {step} OF {STEPS.length}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-[#4caf50] transition-all duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {currentStep.title}
        </h2>

        {/* Content */}
        <div className="flex-1 mb-8">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['Brand Awareness', 'Conversion (Sales)', 'Get UGC', 'Increase Traffic', 'Analytics', 'Global Reach'].map((option) => (
                  <button
                    key={option}
                    onClick={() => onFormChange('goal', option)}
                    className={`p-4 rounded-xl border-2 transition-all text-center min-h-[100px] flex flex-col items-center justify-center ${
                      formData.goal === option
                        ? 'border-[#4caf50] bg-green-50'
                        : 'border-gray-200 bg-white hover:border-[#4caf50]'
                    }`}
                  >
                    <span className="text-xl block mb-2">
                      {option === 'Brand Awareness' && '📣'}
                      {option === 'Conversion (Sales)' && '💸'}
                      {option === 'Get UGC' && '📸'}
                      {option === 'Increase Traffic' && '🚀'}
                      {option === 'Analytics' && '📊'}
                      {option === 'Global Reach' && '🌍'}
                    </span>
                    <p className="text-xs font-semibold text-gray-900">{option}</p>
                    {formData.goal === option && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#4caf50] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Input
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => onFormChange('website', e.target.value)}
                className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-[#4caf50]"
              />
              <p className="text-xs text-gray-500">Optional — you can always add this later in settings</p>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-4 gap-2">
              {['Only me', '2–5', '6–10', '11–20', '21–50', '51–100', '100+'].map((option) => (
                <button
                  key={option}
                  onClick={() => onFormChange('teamSize', option)}
                  className={`p-3 rounded-lg border-2 text-center transition-all relative ${
                    formData.teamSize === option
                      ? 'border-[#4caf50] bg-green-50'
                      : 'border-gray-200 bg-white hover:border-[#4caf50]'
                  }`}
                >
                  <span className="text-lg block mb-1">
                    {option === 'Only me' && '🧑'}
                    {option === '2–5' && '👥'}
                    {option === '6–10' && '👨‍👩‍👧'}
                    {option === '11–20' && '🏢'}
                    {option === '21–50' && '🏬'}
                    {option === '51–100' && '🏭'}
                    {option === '100+' && '🌐'}
                  </span>
                  <p className="text-xs font-semibold text-gray-900">{option}</p>
                  {formData.teamSize === option && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#4caf50] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-3 gap-2">
              {['$10K–$20K', '$20K–$30K', '$30K–$40K', '$40K–$50K', '$50K+'].map((option) => (
                <button
                  key={option}
                  onClick={() => onFormChange('revenue', option)}
                  className={`p-4 rounded-xl border-2 text-center transition-all relative min-h-[100px] flex flex-col items-center justify-center ${
                    formData.revenue === option
                      ? 'border-[#4caf50] bg-green-50'
                      : 'border-gray-200 bg-white hover:border-[#4caf50]'
                  }`}
                >
                  <span className="text-xl block mb-2">
                    {option === '$10K–$20K' && '💵'}
                    {option === '$20K–$30K' && '💴'}
                    {option === '$30K–$40K' && '💶'}
                    {option === '$40K–$50K' && '💷'}
                    {option === '$50K+' && '💎'}
                  </span>
                  <p className="text-xs font-semibold text-gray-900">{option}</p>
                  {formData.revenue === option && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#4caf50] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="grid grid-cols-4 gap-2">
              {['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'X', 'Google', 'Upwork', 'Referral', 'Ads'].map((option) => (
                <button
                  key={option}
                  onClick={() => onFormChange('source', option)}
                  className={`p-3 rounded-lg border-2 text-center transition-all relative ${
                    formData.source === option
                      ? 'border-[#4caf50] bg-green-50'
                      : 'border-gray-200 bg-white hover:border-[#4caf50]'
                  }`}
                >
                  <span className="text-lg block mb-1">
                    {option === 'Facebook' && '👍'}
                    {option === 'Instagram' && '📷'}
                    {option === 'TikTok' && '🎵'}
                    {option === 'LinkedIn' && '💼'}
                    {option === 'YouTube' && '▶️'}
                    {option === 'X' && '✖️'}
                    {option === 'Google' && '🔎'}
                    {option === 'Upwork' && '🧑‍💻'}
                    {option === 'Referral' && '🤝'}
                    {option === 'Ads' && '📢'}
                  </span>
                  <p className="text-xs font-semibold text-gray-900">{option}</p>
                  {formData.source === option && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-[#4caf50] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index < step ? 'bg-[#4caf50]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {step === 1 ? (
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 hover:text-[#4caf50]"
                disabled={isLoading}
              >
                Skip ≫
              </button>
            ) : (
              <button
                onClick={onBack}
                className="px-6 py-2 border-2 border-gray-300 rounded-full text-sm font-semibold text-gray-600 hover:border-gray-400"
                disabled={isLoading}
              >
                Back
              </button>
            )}
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="px-8 h-10 bg-[#4caf50] text-white font-semibold hover:bg-[#2d7d32] rounded-full"
            >
              {step === STEPS.length ? (isLoading ? 'Completing...' : 'Complete Setup →') : 'Next Step →'}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#d4edcf] to-[#aed9b0] relative overflow-hidden">
        <div className="absolute w-40 h-40 bg-white/20 rounded-full -top-20 -right-20" />
        <div className="absolute w-24 h-24 bg-white/15 rounded-full -bottom-10 -left-10" />
        
        {/* Image container - fills entire sidebar */}
        <div 
          className="w-full h-full relative"
        >
          {step === 1 && (
            <Image
              src="/images/yourGoal.png"
              alt="Your Goal"
              fill
              className="object-cover"
            />
          )}
          {step === 2 && (
            <Image
              src="/images/websiteLink.png"
              alt="Website Link"
              fill
              className="object-cover"
            />
          )}
          {step === 3 && (
            <Image
              src="/images/teamSize.png"
              alt="Team Size"
              fill
              className="object-cover"
            />
          )}
          {step === 4 && (
            <Image
              src="/images/revenue.png"
              alt="Revenue"
              fill
              className="object-cover"
            />
          )}
          {step === 5 && (
            <Image
              src="/images/how'dHear.png"
              alt="How You Heard About Us"
              fill
              className="object-cover"
            />
          )}
        </div>
        
        {/* Text container - positioned below image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-5 bg-gradient-to-t from-black/40 via-black/20 to-transparent z-10">
          <p className="text-center text-xs font-semibold text-white leading-relaxed whitespace-pre-line drop-shadow-lg">
            {currentStep.tip}
          </p>
        </div>
      </div>
    </div>
  )
}
