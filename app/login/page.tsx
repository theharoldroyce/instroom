import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[#0b0f0d] text-white">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-svh w-full max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:px-10">
        <div className="order-2 lg:order-1 w-full max-w-md justify-self-center lg:justify-self-start">
          <LoginForm className="border-emerald-300/20 bg-white/10 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl" />
        </div>

        <section className="order-1 lg:order-2 space-y-6">
          <p className="inline-flex w-fit items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
            Instroom • Creator Analytics
          </p>

          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white md:text-5xl">
            Welcome back to your analytics.
          </h1>

          <p className="max-w-lg text-sm leading-7 text-zinc-300 md:text-base">
            Log in to access your Instagram and TikTok insights, track your
            growth, and optimize your content strategy with real-time analytics
            and competitor benchmarking.
          </p>

          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Real-time follower and engagement tracking.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-lime-300" />
              Content performance insights and optimization tips.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Benchmark against competitors and influencers.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
