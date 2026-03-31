
import Link from "next/link";
import { getActivePlans } from "@/prisma/plans";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from  "@/lib/prisma";

function getPlanSummary(plan: any) {
  if (plan.name === "solo") {
    return "1 brand (cannot add more), 0 seats (buy up to 5)";
  }
  if (plan.name === "team") {
    return "3 brands included (can buy more), 10 seats (buy up to 25)";
  }
  if (plan.name === "agency") {
    return "10 brands included (can buy more), 30 seats (unlimited extra)";
  }
  return "";
}

export default async function PricingPage({ searchParams }: { searchParams?: { cycle?: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const userSub = await prisma.userSubscription.findFirst({
      where: {
        user_id: session.user.id,
        status: "active",
      },
    });
    if (userSub) {
      redirect("/dashboard");
    }
  }
  const plans = await getActivePlans();
  const params = await searchParams;
  const cycle = params?.cycle === "yearly" ? "yearly" : "monthly";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0b0f0d] text-white">
      <div className="pointer-events-none fixed -left-40 -top-20 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none fixed -right-40 top-1/3 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <header className="mx-auto max-w-7xl px-6 py-8 lg:px-10 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-lime-300">
          <svg className="h-4 w-4 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">Instroom</span>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-10 text-center lg:px-0">
        <h1 className="text-4xl font-extrabold md:text-5xl bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">
          Subscription Plans
        </h1>
        <p className="mt-4 text-zinc-300 text-lg md:text-xl">
          Simple, transparent pricing. No hidden fees. Cancel anytime.
        </p>
        <div className="flex justify-center mt-8 mb-2">
          <a
            href="?cycle=monthly"
            className={`px-4 py-2 rounded-l-full border border-emerald-400/60 bg-white/10 text-base font-semibold transition-all duration-150 ${cycle === 'monthly' ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-black' : 'text-zinc-100 hover:bg-white/20'}`}
          >
            Monthly
          </a>
          <a
            href="?cycle=yearly"
            className={`px-4 py-2 rounded-r-full border-t border-b border-r border-emerald-400/60 bg-white/10 text-base font-semibold transition-all duration-150 ${cycle === 'yearly' ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-black' : 'text-zinc-100 hover:bg-white/20'}`}
          >
            Yearly <span className="ml-1 text-xs text-emerald-200"></span>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="mb-8" />
        <div className="flex flex-col md:flex-row md:justify-center md:items-stretch gap-y-16 gap-x-16">
          {plans.map((plan, idx) => {
            const price = cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
            const priceLabel = cycle === 'yearly' ? '/yr' : '/mo';
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 shadow-xl group ${
                  idx === 1
                    ? "border-emerald-400/80 bg-gradient-to-br from-emerald-500/30 to-lime-400/20 scale-105 z-10"
                    : "border-emerald-300/10 bg-white/5 hover:scale-105 hover:z-10"
                }`}
                style={{
                  minWidth: "300px",
                  maxWidth: "350px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <div
                  className={`pointer-events-none absolute -inset-1 rounded-2xl blur-2xl opacity-60 z-0 ${
                    idx === 1
                      ? "bg-gradient-to-br from-emerald-400/40 to-lime-300/30"
                      : "bg-gradient-to-br from-emerald-400/30 to-lime-300/20"
                  }`}
                  aria-hidden="true"
                />
                {idx === 1 && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-1 text-xs font-semibold text-black shadow-md z-20">
                    Most popular
                  </span>
                )}
                <div className="relative z-10 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{plan.display_name}</h3>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-white">${Number(price).toLocaleString()}</span>
                    <span className="mb-1 text-base text-zinc-400">{priceLabel}</span>
                  </div>
                  <p className="mb-2 text-xs text-emerald-300 font-semibold">{getPlanSummary(plan)}</p>
                  <ul className="mb-8 flex-1 space-y-2 text-sm text-zinc-200">
                    <li>
                      <b>Seats:</b> {plan.included_seats}
                      {plan.max_seats ? ` (up to ${plan.max_seats})` : ""}
                    </li>
                    <li>
                      <b>Brands:</b> {plan.included_brands}
                      {plan.max_brands ? ` (up to ${plan.max_brands})` : ""}
                    </li>
                    {plan.max_influencers && (
                      <li>
                        <b>Influencers/brand:</b> {plan.max_influencers}
                      </li>
                    )}
                    {plan.max_campaigns && (
                      <li>
                        <b>Active campaigns:</b> {plan.max_campaigns}
                      </li>
                    )}
                    <li>
                      <b>API Access:</b> {plan.can_use_api ? "Yes" : "No"}
                    </li>
                    <li>
                      <b>Custom Branding:</b> {plan.custom_branding ? "Yes" : "No"}
                    </li>
                    <li>
                      <b>Priority Support:</b> {plan.priority_support ? "Yes" : "No"}
                    </li>
                  </ul>
                  <Link
                    href={`/pricing/payment?plan=${plan.name}&cycle=${cycle}`}
                    className={`mt-auto block rounded-full py-3 text-center text-base font-semibold transition-all duration-150 ${
                      idx === 1
                        ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-black shadow-lg shadow-emerald-500/20 hover:opacity-90"
                        : "border border-emerald-300/20 bg-white/10 text-zinc-100 hover:bg-white/20"
                    }`}
                  >
                    Start Subscription
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="text-2xl font-semibold mb-8 text-center text-white">Frequently asked questions</h2>
        <div className="space-y-8">
          {[
            {
              q: "Can I try Instroom for free?",
              a: "Yes! The Solo plan is free forever. You can also try Team with a free trial.",
            },
            {
              q: "Can I cancel or change plans anytime?",
              a: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your dashboard.",
            },
            {
              q: "Do you offer discounts for agencies or teams?",
              a: "Yes, the Agency plan is designed for teams and agencies. For custom needs, contact us.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards. For annual or custom billing, please contact us.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl bg-white/5 p-5 border border-emerald-300/10">
              <p className="font-medium text-white">{q}</p>
              <p className="text-zinc-400 mt-2">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-10 lg:px-10">
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
  );
}