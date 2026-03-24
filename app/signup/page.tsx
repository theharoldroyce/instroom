import { SignupForm } from "@/components/signup-form"

export default function Page() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[#0b0f0d] text-white">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-svh w-full max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:px-10">
        <section className="space-y-6">
          <p className="inline-flex w-fit items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
            Instroom • Creator Analytics
          </p>

          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white md:text-5xl">
            Grow your influence with data-driven insights.
          </h1>

          <p className="max-w-lg text-sm leading-7 text-zinc-300 md:text-base">
            Create your account to unlock deeper analytics for Instagram and
            TikTok profiles, audience trends, and content performance in one
            powerful dashboard.
          </p>

          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Track engagement, followers, and growth rate.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-lime-300" />
              Compare creators and identify top-performing content.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Export reports and share actionable insights quickly.
            </li>
          </ul>
        </section>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <SignupForm className="border-emerald-300/20 bg-white/10 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl" />
        </div>
      </div>
    </div>
  )
}
