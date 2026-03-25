import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[#0b0f0d] text-white">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <Image
              src="/images/instroomLogo.png"
              alt="Instroom logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-white">Instroom</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-zinc-300 hover:text-emerald-300 transition">Features</a>
            <a href="#pricing" className="text-zinc-300 hover:text-emerald-300 transition">Pricing</a>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-emerald-400 hover:text-lime-300">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-semibold hover:from-emerald-400 hover:to-lime-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        <section className="py-20 md:py-32 space-y-8">
          <div className="space-y-6 text-center">
            <p className="inline-flex w-fit items-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-sm font-medium tracking-wide text-emerald-300">
              ✨ The Creator Analytics Platform
            </p>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
              Grow Your Influence with <span className="bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">Data-Driven Insights</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg text-zinc-300 leading-relaxed">
              Advanced analytics for Instagram and TikTok. Track growth, understand your audience, compare competitors, and unlock the power of real-time data to scale your creator business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-semibold text-base hover:from-emerald-400 hover:to-lime-300 shadow-lg shadow-emerald-500/50 w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" className="h-12 px-8 border-emerald-300/30 bg-black/20 text-zinc-100 text-base hover:bg-emerald-500/10 hover:text-emerald-300 w-full sm:w-auto">
                  Learn More
                </Button>
              </a>
            </div>

            <p className="text-sm text-zinc-400">
              No credit card required. Start analyzing in minutes.
            </p>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
                Powerful features built for creators who want to understand and grow their audience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "📊",
                  title: "Real-Time Analytics",
                  description: "Track followers, engagement, reach, and growth with live updates. No delays, no guesswork."
                },
                {
                  icon: "🎯",
                  title: "Audience Insights",
                  description: "Understand demographics, peak posting times, and content preferences. Make smarter decisions."
                },
                {
                  icon: "🏆",
                  title: "Competitor Analysis",
                  description: "Benchmark against competitors and influencers. See what's working in your niche."
                },
                {
                  icon: "📱",
                  title: "Multi-Platform",
                  description: "Track Instagram, TikTok, and more. Manage everything from one unified dashboard."
                },
                {
                  icon: "📈",
                  title: "Growth Tracking",
                  description: "Visualize your growth trajectory with detailed charts and predictive insights."
                },
                {
                  icon: "💾",
                  title: "Export & Reports",
                  description: "Download reports, export data, and share insights with your team in seconds."
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-emerald-300/20 bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-xl hover:border-emerald-300/40 transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-lime-400/10 rounded-2xl blur-xl" />
            <div className="relative border border-emerald-300/20 bg-gradient-to-br from-white/12 to-white/5 rounded-2xl p-8 md:p-16 text-center space-y-8 backdrop-blur-xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Ready to Transform Your Analytics?
              </h2>
              <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
                Join thousands of creators who are already using Instroom to grow their audience and scale their influence.
              </p>
              <Link href="/signup">
                <Button className="h-12 px-10 bg-gradient-to-r from-emerald-500 to-lime-400 text-black font-semibold text-base hover:from-emerald-400 hover:to-lime-300 shadow-lg shadow-emerald-500/50">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <footer className="py-12 border-t border-zinc-800/50 mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-emerald-300 transition">Features</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Security</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-emerald-300 transition">About</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Careers</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-emerald-300 transition">Docs</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Support</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Community</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-emerald-300 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Terms</a></li>
                <li><a href="#" className="hover:text-emerald-300 transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-400">
            <p>&copy; 2026 Instroom. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-emerald-300 transition">Twitter</a>
              <a href="#" className="hover:text-emerald-300 transition">Instagram</a>
              <a href="#" className="hover:text-emerald-300 transition">LinkedIn</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
