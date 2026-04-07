
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



      <section className="mx-auto max-w-3xl px-6 pt-20 pb-10 text-center lg:px-0">
        <h1 className="text-4xl font-extrabold md:text-5xl bg-gradient-to-r from-[#1FAE5B] to-[#0F6B3E] bg-clip-text text-transparent">
          Subscription Plans
        </h1>
        <p className="mt-4 text-[#666666] text-lg md:text-xl">
          Simple, transparent pricing. No hidden fees. Cancel anytime.
        </p>
        <div className="flex justify-center mt-8 mb-2">
          <a
            href="?cycle=monthly"
            className={`px-4 py-2 rounded-l-full border border-[#0F6B3E]/40 text-base font-semibold transition-all duration-150 ${cycle === 'monthly' ? 'bg-[#0F6B3E] text-white' : 'bg-white hover:bg-[#f0f0f0] text-[#1E1E1E]'}`}
          >
            Monthly
          </a>
          <a
            href="?cycle=yearly"
            className={`px-4 py-2 rounded-r-full border-t border-b border-r border-[#0F6B3E]/40 text-base font-semibold transition-all duration-150 ${cycle === 'yearly' ? 'bg-[#0F6B3E] text-white' : 'bg-white hover:bg-[#f0f0f0] text-[#1E1E1E]'}`}
          >
            Yearly <span className="ml-1 text-xs text-[#1FAE5B]"></span>
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
                    ? "border-[#1FAE5B]/60 bg-gradient-to-br from-[#1FAE5B]/10 to-[#0F6B3E]/8 scale-105 z-10"
                    : "border-[#0F6B3E]/15 bg-white hover:scale-105 hover:z-10"
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
                      ? "bg-gradient-to-br from-[#1FAE5B]/20 to-[#0F6B3E]/15"
                      : "bg-gradient-to-br from-[#1FAE5B]/10 to-[#0F6B3E]/5"
                  }`}
                  aria-hidden="true"
                />
                {idx === 1 && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#1FAE5B] px-4 py-1 text-xs font-semibold text-white shadow-md z-20">
                    Most popular
                  </span>
                )}
                <div className="relative z-10 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-[#1E1E1E] mb-2">{plan.display_name}</h3>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-[#1E1E1E]">${Number(price).toLocaleString()}</span>
                    <span className="mb-1 text-base text-[#666666]">{priceLabel}</span>
                  </div>
                  <p className="mb-2 text-xs text-[#0F6B3E] font-semibold">{getPlanSummary(plan)}</p>
                  <ul className="mb-8 flex-1 space-y-2 text-sm text-[#1E1E1E]">
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
                        ? "bg-[#1FAE5B] text-white shadow-lg shadow-[#1FAE5B]/20 hover:opacity-90"
                        : "border border-[#0F6B3E]/20 bg-white text-[#1E1E1E] hover:bg-[#f9f9f9]"
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
        <h2 className="text-2xl font-semibold mb-8 text-center text-[#1E1E1E]">Frequently asked questions</h2>
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
            <div key={q} className="rounded-xl bg-white p-5 border border-[#0F6B3E]/15">
              <p className="font-medium text-[#1E1E1E]">{q}</p>
              <p className="text-[#666666] mt-2">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#0F6B3E]/10 px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-[#999999] sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#1FAE5B]">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </span>
            <span className="font-medium text-[#666666]">Instroom</span>
          </div>
          <p>© {new Date().getFullYear()} Instroom. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="transition-colors hover:text-[#1E1E1E]">Terms</a>
            <a href="#" className="transition-colors hover:text-[#1E1E1E]">Privacy</a>
            <a href="#" className="transition-colors hover:text-[#1E1E1E]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}