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
}

export function OnboardingForm({
  step,
  showWelcome,
  formData,
  onNext,
  onBack,
  onSubmit,
  onFormChange,
}: OnboardingFormProps) {
  const steps = [
    { number: 1, title: 'Your Goal' },
    { number: 2, title: 'Your Details' },
    { number: 3, title: 'How You Found Us' },
  ]

  return (
    <>
      {showWelcome ? (
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="absolute inset-0 bg-black/40 rounded-lg" />
          <Card className="relative border-emerald-300/30 bg-gradient-to-br from-white/15 to-white/5 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl">
            <CardContent className="pt-4 pb-8 text-center space-y-4">
              <div className="text-5xl animate-bounce">🎉</div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent mb-1">
                  Welcome to Instroom
                </h1>
                <p className="text-zinc-300 text-base">
                  Your account is all set up and ready to go!
                </p>
              </div>
              <p className="text-zinc-400 text-xs max-w-sm">
                Start exploring your analytics dashboard and unlock the power of data-driven insights for your Instagram and TikTok profiles.
              </p>
              <Button
                onClick={onSubmit}
                className="h-11 px-10 bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-semibold hover:from-emerald-400 hover:to-lime-300 shadow-lg shadow-emerald-500/50"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="w-full border-emerald-300/20 bg-gradient-to-br from-white/12 to-white/5 shadow-2xl shadow-emerald-500/15 backdrop-blur-xl">
          <div className="px-6 pt-6 pb-3">
            <div className="flex items-center justify-between mb-2">
              {steps.map((s) => (
                <p key={s.number} className={`text-xs font-medium transition-colors ${step >= s.number ? 'text-emerald-300' : 'text-zinc-500'}`}>
                  {s.title}
                </p>
              ))}
            </div>

            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <CardHeader className="gap-1 border-t border-zinc-800/50 pb-3 pt-3">
            <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-white to-zinc-200 bg-clip-text text-transparent">
              Ready to Set Things Up?
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Let&apos;s get you set up! (Step {step} of 3)
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-3">
            {step === 1 && (
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FieldGroup>
                    <div className="mb-4">
                      <FieldLabel className="text-base text-zinc-100 font-semibold block mb-2">
                        What&apos;s your primary goal? 🎯
                      </FieldLabel>
                      <p className="text-xs text-zinc-400 mb-3">Customize your dashboard</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {['Brand Awareness', 'Conversion (Sales)', 'Get User Generated Content (UGC)', 'Increase Traffic/Downloads'].map((option) => (
                        <label key={option} className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all text-center text-xs ${
                          formData.goal === option
                            ? 'bg-gradient-to-r from-emerald-500/20 to-lime-400/10 border border-emerald-400/50'
                            : 'bg-black/20 border border-zinc-700/50 hover:border-zinc-600'
                        }`}>
                          <input
                            type="radio"
                            name="goal"
                            value={option}
                            checked={formData.goal === option}
                            onChange={(e) => onFormChange('goal', e.target.value)}
                            className="hidden"
                          />
                          <span className="text-zinc-100 font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  </FieldGroup>

                  <FieldGroup>
                    <div className="mb-4">
                      <FieldLabel htmlFor="website" className="text-base text-zinc-100 font-semibold mb-2 block">
                        Your Website Link 🔗
                      </FieldLabel>
                      <p className="text-xs text-zinc-400 mb-3">Where you operate</p>
                    </div>
                    <Field>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={formData.website}
                        onChange={(e) => onFormChange('website', e.target.value)}
                        className="border-emerald-300/30 bg-black/40 text-white placeholder:text-zinc-500 focus-visible:border-emerald-300 focus-visible:ring-emerald-400/30 focus-visible:bg-black/50 transition-all"
                      />
                    </Field>
                  </FieldGroup>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-emerald-400 hover:text-lime-300 hover:bg-emerald-500/10 text-sm"
                  >
                    Skip &gt;&gt;
                  </Button>
                  <Button
                    type="button"
                    onClick={onNext}
                    className="h-10 px-8 bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-semibold hover:from-emerald-400 hover:to-lime-300 shadow-lg shadow-emerald-500/50"
                  >
                    Next Step
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FieldGroup>
                    <div className="mb-4">
                      <FieldLabel className="text-base text-zinc-100 font-semibold block mb-2">
                        Team Size 👥
                      </FieldLabel>
                      <p className="text-xs text-zinc-400 mb-3">Setup your workspace</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['Only me', '2 - 5', '6 - 10', '11 - 20', '21 - 50', '51 - 100', '100+'].map((option) => (
                        <label key={option} className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all text-center text-xs ${
                          formData.teamSize === option
                            ? 'bg-gradient-to-r from-emerald-500/20 to-lime-400/10 border border-emerald-400/50'
                            : 'bg-black/20 border border-zinc-700/50 hover:border-zinc-600'
                        }`}>
                          <input
                            type="radio"
                            name="teamSize"
                            value={option}
                            checked={formData.teamSize === option}
                            onChange={(e) => onFormChange('teamSize', e.target.value)}
                            className="hidden"
                          />
                          <span className="text-zinc-100 font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  </FieldGroup>

                  <FieldGroup>
                    <div className="mb-4">
                      <FieldLabel className="text-base text-zinc-100 font-semibold block mb-2">
                        Monthly Revenue 💰
                      </FieldLabel>
                      <p className="text-xs text-zinc-400 mb-3">Recommend right plan</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['$10K-$20K', '$20K-$30K', '$30K-$40K', '$40K-$50K', '$50K+'].map((option) => (
                        <label key={option} className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all text-center text-xs ${
                          formData.revenue === option
                            ? 'bg-gradient-to-r from-emerald-500/20 to-lime-400/10 border border-emerald-400/50'
                            : 'bg-black/20 border border-zinc-700/50 hover:border-zinc-600'
                        }`}>
                          <input
                            type="radio"
                            name="revenue"
                            value={option}
                            checked={formData.revenue === option}
                            onChange={(e) => onFormChange('revenue', e.target.value)}
                            className="hidden"
                          />
                          <span className="text-zinc-100 font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  </FieldGroup>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <Button
                    type="button"
                    onClick={onBack}
                    variant="outline"
                    className="h-9 px-6 border-emerald-300/30 bg-black/20 text-zinc-100 text-sm hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={onNext}
                    className="h-9 px-6 bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-semibold text-sm hover:from-emerald-400 hover:to-lime-300 shadow-lg shadow-emerald-500/50"
                  >
                    Next Step
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form className="space-y-4">
                <FieldGroup>
                  <div className="mb-4">
                    <FieldLabel className="text-base text-zinc-100 font-semibold block mb-2">
                      How did you hear about us? 🔍
                    </FieldLabel>
                    <p className="text-xs text-zinc-400 mb-3">Understand our audience</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'X', 'Google Search', 'Upwork', 'Referral', 'Ads'].map((option) => (
                      <label key={option} className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all text-center text-xs ${
                        formData.source === option
                          ? 'bg-gradient-to-r from-emerald-500/20 to-lime-400/10 border border-emerald-400/50'
                          : 'bg-black/20 border border-zinc-700/50 hover:border-zinc-600'
                      }`}>
                        <input
                          type="radio"
                          name="source"
                          value={option}
                          checked={formData.source === option}
                          onChange={(e) => onFormChange('source', e.target.value)}
                          className="hidden"
                        />
                        <span className="text-zinc-100 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                </FieldGroup>

                <div className="flex items-center justify-between pt-6">
                  <Button
                    type="button"
                    onClick={onBack}
                    variant="outline"
                    className="h-9 px-6 border-emerald-300/30 bg-black/20 text-zinc-100 text-sm hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={onNext}
                    className="h-9 px-6 bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-semibold text-sm hover:from-emerald-400 hover:to-lime-300 shadow-lg shadow-emerald-500/50"
                  >
                    Complete Setup
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
