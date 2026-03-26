import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0b0f0d] text-white">
      {/* Background orbs */}
      <div className="pointer-events-none fixed -left-40 -top-20 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none fixed -right-40 top-1/3 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-lime-300">
            <svg className="h-4 w-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">Instrom</span>
        </div>

        <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
          <a href="#features" className="transition-colors hover:text-white">Features</a>
          <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
          <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 transition-colors hover:text-white">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 text-center lg:px-10 lg:pt-32">
        <p className="mb-6 inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
          Instroom • Creator Analytics
        </p>

        <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
          Grow smarter with{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">
            creator analytics
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-zinc-400 md:text-lg">
          Track follower growth, measure engagement, benchmark against competitors,
          and optimise your content — all from one powerful dashboard.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-8 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-opacity hover:opacity-90 sm:w-auto"
          >
            Start for free
          </Link>
          <a
            href="#how-it-works"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-300/20 bg-white/5 px-8 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 sm:w-auto"
          >
            See how it works
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { value: "50K+", label: "Creators tracked" },
            { value: "2B+", label: "Data points analysed" },
            { value: "98%", label: "Accuracy rate" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-emerald-300/10 bg-white/5 px-6 py-5 backdrop-blur-sm"
            >
              <p className="bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-4xl font-bold text-transparent">
                {value}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-14 text-center">
          <p className="mb-3 inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
            Features
          </p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Everything you need to grow
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-400">
            Instroom gives creators and agencies the insights they need to make
            data-driven decisions without the complexity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              title: "Real-time growth tracking",
              description: "Monitor follower, reach, and engagement metrics in real time across Instagram and TikTok.",
              accent: "emerald",
            },
            {
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Content performance insights",
              description: "See which posts, reels, and videos drive the most reach and saves — and why.",
              accent: "lime",
            },
            {
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: "Competitor benchmarking",
              description: "Compare your growth and engagement rates against any public creator or brand.",
              accent: "emerald",
            },
            {
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: "Best time to post",
              description: "AI-powered recommendations for the exact times your audience is most active.",
              accent: "lime",
            },
            {
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              ),
              title: "Smart alerts",
              description: "Get notified when your account spikes, drops, or when a competitor outpaces you.",
              accent: "emerald",
            },
            {
              icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              title: "Exportable reports",
              description: "Generate beautiful PDF or CSV reports to share with brands, agencies, or your team.",
              accent: "lime",
            },
          ].map(({ icon, title, description, accent }) => (
            <div
              key={title}
              className="group rounded-2xl border border-emerald-300/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-emerald-300/20 hover:bg-white/[0.07]"
            >
              <span
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                  accent === "emerald"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-lime-400/15 text-lime-300"
                }`}
              >
                {icon}
              </span>
              <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
              <p className="text-sm leading-6 text-zinc-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-14 text-center">
          <p className="mb-3 inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
            How it works
          </p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Up and running in 3 steps
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Connect your accounts",
              description:
                "Link your Instagram and TikTok profiles securely via OAuth — no passwords shared, no data stored.",
            },
            {
              step: "02",
              title: "Explore your dashboard",
              description:
                "Your metrics are instantly populated. Dive into follower trends, top posts, and audience demographics.",
            },
            {
              step: "03",
              title: "Optimise and grow",
              description:
                "Use AI recommendations and competitor insights to refine your strategy and post with confidence.",
            },
          ].map(({ step, title, description }) => (
            <div key={step} className="flex flex-col gap-4">
              <span className="text-6xl font-bold text-emerald-500/20">{step}</span>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm leading-7 text-zinc-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-14 text-center">
          <p className="mb-3 inline-flex items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-400">
            No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "Free",
              period: "",
              description: "Perfect for individual creators just starting out.",
              features: [
                "1 connected account",
                "30-day data history",
                "Basic engagement metrics",
                "Weekly digest email",
              ],
              cta: "Get started",
              href: "/signup",
              highlighted: false,
            },
            {
              name: "Pro",
              price: "$19",
              period: "/mo",
              description: "For creators serious about growth and monetisation.",
              features: [
                "5 connected accounts",
                "1-year data history",
                "Competitor benchmarking",
                "Best time to post AI",
                "Smart alerts",
                "PDF / CSV exports",
              ],
              cta: "Start free trial",
              href: "/signup",
              highlighted: true,
            },
            {
              name: "Agency",
              price: "$79",
              period: "/mo",
              description: "Manage multiple clients from a single workspace.",
              features: [
                "Unlimited accounts",
                "Full data history",
                "White-label reports",
                "Team seats included",
                "Priority support",
                "API access",
              ],
              cta: "Contact us",
              href: "/signup",
              highlighted: false,
            },
          ].map(({ name, price, period, description, features, cta, href, highlighted }) => (
            <div
              key={name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                highlighted
                  ? "border-emerald-400/40 bg-emerald-500/10 shadow-xl shadow-emerald-500/10"
                  : "border-emerald-300/10 bg-white/5"
              }`}
            >
              {highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-3 py-0.5 text-xs font-semibold text-black">
                  Most popular
                </span>
              )}
              <h3 className="text-sm font-semibold text-zinc-300">{name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-bold text-white">{price}</span>
                {period && <span className="mb-1 text-sm text-zinc-400">{period}</span>}
              </div>
              <p className="mt-2 text-xs leading-6 text-zinc-400">{description}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                className={`mt-8 block rounded-full py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90 ${
                  highlighted
                    ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-black shadow-lg shadow-emerald-500/20"
                    : "border border-emerald-300/20 bg-white/5 text-zinc-200 hover:bg-white/10"
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-500/10 to-lime-400/5 px-8 py-14 text-center backdrop-blur-sm">
          <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-lime-400/20 blur-3xl" />
          <h2 className="relative mx-auto max-w-xl text-3xl font-semibold text-white md:text-4xl">
            Ready to take control of your growth?
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-400">
            Join thousands of creators and agencies already using Instroom to turn data into results.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-8 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-opacity hover:opacity-90 sm:w-auto"
            >
              Get started for free
            </Link>
            <Link
              href="/login"
              className="w-full rounded-full border border-emerald-300/20 bg-white/5 px-8 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-emerald-400 to-lime-300">
              <svg className="h-3 w-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </span>
            <span className="font-medium text-zinc-400">Instroom</span>
          </div>
          <p>© {new Date().getFullYear()} Instroom. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="transition-colors hover:text-zinc-300">Terms</a>
            <a href="#" className="transition-colors hover:text-zinc-300">Privacy</a>
            <a href="#" className="transition-colors hover:text-zinc-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
