
import Link from "next/link";
import Image from "next/image";
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
      },
    });
    if (userSub && userSub.status === "active") {
      redirect("/dashboard");
    }
  }
  const allPlans = await getActivePlans();
  const plans = allPlans.filter((plan: any) => plan.name !== "agency");
  const params = await searchParams;
  const cycle = params?.cycle === "yearly" ? "yearly" : "monthly";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F9F8] text-[#1E1E1E]">
      <div className="pointer-events-none fixed top-0 left-0 w-96 h-96 rounded-full bg-[#1FAE5B]/8 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-80 h-80 rounded-full bg-[#0F6B3E]/6 blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="pointer-events-none fixed top-1/3 right-1/4 w-64 h-64 rounded-full bg-[#2C8EC4]/5 blur-3xl" />

      <div className="fixed top-6 left-12 z-50">
        <Image
          src="/images/Instroom Logo 1.png"
          alt="Instroom Logo"
          width={180}
          height={180}
          priority
          quality={95}
          className="drop-shadow-sm"
        />
      </div>

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center lg:px-0">
        <h1 className="text-3xl font-extrabold md:text-4xl bg-gradient-to-r from-[#1FAE5B] to-[#0F6B3E] bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-6 text-[#666666] text-lg md:text-xl max-w-2xl mx-auto">
          Choose the perfect plan for your influencer marketing needs. No hidden fees. Cancel anytime.
        </p>

        <div className="flex justify-center mt-10 gap-1 bg-white border border-[#0F6B3E]/20 rounded-full p-1 w-fit mx-auto">
          <a
            href="?cycle=monthly"
            className={`px-6 py-2 rounded-full text-base font-semibold transition-all duration-150 ${
              cycle === "monthly"
                ? "bg-[#1FAE5B] text-white shadow-md"
                : "text-[#1E1E1E] hover:text-[#1FAE5B]"
            }`}
          >
            Monthly Billing
          </a>
          <a
            href="?cycle=yearly"
            className={`px-6 py-2 rounded-full text-base font-semibold transition-all duration-150 flex items-center gap-2 ${
              cycle === "yearly"
                ? "bg-[#1FAE5B] text-white shadow-md"
                : "text-[#1E1E1E] hover:text-[#1FAE5B]"
            }`}
          >
            Yearly Billing
            <span className="text-xs bg-[#F4B740]/20 text-[#C87500] px-2 py-0.5 rounded-full font-semibold">
              Save 20%
            </span>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-8">
        <div className="flex flex-col lg:flex-row justify-center items-end gap-8 lg:gap-6">
          {plans.map((plan, idx) => {
            const price = cycle === "yearly" ? plan.price_yearly : plan.price_monthly;
            const priceLabel = cycle === "yearly" ? "/yr" : "/mo";
            return (
              <div
                key={plan.id}
                className={`relative w-full lg:w-80 rounded-2xl border transition-all duration-300 shadow-lg group ${
                  idx === 1
                    ? "border-[#1FAE5B]/60 bg-gradient-to-br from-white to-[#1FAE5B]/5 ring-2 ring-[#1FAE5B]/30 lg:scale-105"
                    : "border-[#0F6B3E]/15 bg-white hover:shadow-xl hover:border-[#0F6B3E]/25"
                }`}
              >
                {idx === 1 && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                    <span className="inline-block rounded-full bg-gradient-to-r from-[#1FAE5B] to-[#0F6B3E] px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                      ⭐ MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="pointer-events-none absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-40 transition duration-300 -z-10 ${
                  idx === 1
                    ? 'bg-gradient-to-br from-[#1FAE5B]/40 to-[#0F6B3E]/20'
                    : 'bg-gradient-to-br from-[#1FAE5B]/10 to-[#0F6B3E]/5'
                }" />

                <div className="p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[#1E1E1E] capitalize mb-1">
                      {plan.display_name}
                    </h3>
                    <p className="text-sm text-[#666666]">
                      {getPlanSummary(plan)}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold text-[#1E1E1E]">
                        ${Number(price).toLocaleString()}
                      </span>
                      <span className="text-base text-[#666666] font-medium">{priceLabel}</span>
                    </div>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="text-[#1FAE5B] font-bold mt-0.5">✓</span>
                      <span className="text-[#1E1E1E]">
                        <b className="font-semibold">Unlimited seats</b>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1FAE5B] font-bold mt-0.5">✓</span>
                      <span className="text-[#1E1E1E]">
                        <b className="font-semibold">{plan.included_brands} brands</b>
                        {plan.max_brands ? ` (up to ${plan.max_brands})` : ""}
                      </span>
                    </li>
                    {plan.max_influencers && (
                      <li className="flex items-start gap-3">
                        <span className="text-[#1FAE5B] font-bold mt-0.5">✓</span>
                        <span className="text-[#1E1E1E]">
                          <b className="font-semibold">{plan.max_influencers}</b> influencers per brand
                        </span>
                      </li>
                    )}
                    {plan.max_campaigns && (
                      <li className="flex items-start gap-3">
                        <span className="text-[#1FAE5B] font-bold mt-0.5">✓</span>
                        <span className="text-[#1E1E1E]">
                          <b className="font-semibold">{plan.max_campaigns}</b> active campaigns
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-3">
                      <span className={plan.can_use_api ? "text-[#1FAE5B] font-bold mt-0.5" : "text-[#ccc] font-bold mt-0.5"}>{plan.can_use_api ? "✓" : "✕"}</span>
                      <span className={plan.can_use_api ? "text-[#1E1E1E]" : "text-[#999]"}>API Access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className={plan.custom_branding ? "text-[#1FAE5B] font-bold mt-0.5" : "text-[#ccc] font-bold mt-0.5"}>{plan.custom_branding ? "✓" : "✕"}</span>
                      <span className={plan.custom_branding ? "text-[#1E1E1E]" : "text-[#999]"}>Custom Branding</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className={plan.priority_support ? "text-[#1FAE5B] font-bold mt-0.5" : "text-[#ccc] font-bold mt-0.5"}>{plan.priority_support ? "✓" : "✕"}</span>
                      <span className={plan.priority_support ? "text-[#1E1E1E]" : "text-[#999]"}>Priority Support</span>
                    </li>
                  </ul>

                  <Link
                    href={`/pricing/payment?plan=${plan.name}&cycle=${cycle}`}
                    className={`w-full block rounded-lg py-3 text-center text-base font-semibold transition-all duration-150 ${
                      idx === 1
                        ? "bg-gradient-to-r from-[#1FAE5B] to-[#0F6B3E] text-white shadow-lg shadow-[#1FAE5B]/25 hover:shadow-xl hover:shadow-[#1FAE5B]/35"
                        : "border-2 border-[#0F6B3E]/30 bg-white text-[#1E1E1E] hover:border-[#1FAE5B]/60 hover:bg-[#1FAE5B]/5"
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-20 flex justify-end">
        <Link
          href="/dashboard"
          className="text-base text-[#1E1E1E] font-medium hover:text-[#1FAE5B] transition-colors flex items-center gap-2 group"
        >
          Skip for now
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="text-3xl font-bold mb-12 text-center text-[#1E1E1E]">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Can I try Instroom for free?",
              a: "Yes! The Solo plan is free forever. You can also try Team with a free trial.",
            },
            {
              q: "Can I cancel or change plans anytime?",
              a: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your dashboard with no penalties.",
            },
            {
              q: "Do you offer discounts for agencies or teams?",
              a: "Yes, the Team plan offers better value for collaboration. For custom enterprise needs, contact our sales team.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards (Visa, Mastercard, AmEx). For annual billing or custom arrangements, contact us.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="rounded-xl bg-white p-6 border border-[#0F6B3E]/10 hover:border-[#0F6B3E]/30 transition-colors"
            >
              <p className="font-semibold text-[#1E1E1E] text-lg mb-2">{q}</p>
              <p className="text-[#666666] leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#0F6B3E]/10 px-6 py-12 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-sm text-[#999999] lg:flex-row">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#1FAE5B]">
              <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </span>
            <span className="font-semibold text-[#1E1E1E]">Instroom</span>
          </div>
          <p>© {new Date().getFullYear()} Instroom. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-[#1FAE5B]">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-[#1FAE5B]">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-[#1FAE5B]">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}