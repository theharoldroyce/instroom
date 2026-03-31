"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Script from "next/script";
import { useEffect, useRef } from "react";

const planSummaries: Record<string, string> = {
  solo: "1 brand (cannot add more), 0 seats (buy up to 5)",
  team: "3 brands included (can buy more), 10 seats (buy up to 25)",
  agency: "10 brands included (can buy more), 30 seats (unlimited extra)",
};

const plans = {
  solo: {
    display_name: "Solo",
    price_monthly: 29,
    price_yearly: 290,
    included_seats: 0,
    max_seats: 5,
    included_brands: 1,
    max_brands: 1,
    max_influencers: 100,
    max_campaigns: 3,
    can_use_api: false,
    custom_branding: false,
    priority_support: false,
  },
  team: {
    display_name: "Team",
    price_monthly: 79,
    price_yearly: 790,
    included_seats: 10,
    max_seats: 25,
    included_brands: 3,
    max_brands: 10,
    max_influencers: 500,
    max_campaigns: 10,
    can_use_api: true,
    custom_branding: false,
    priority_support: true,
  },
  agency: {
    display_name: "Agency",
    price_monthly: 199,
    price_yearly: 1990,
    included_seats: 30,
    max_seats: null,
    included_brands: 10,
    max_brands: null,
    max_influencers: null,
    max_campaigns: null,
    can_use_api: true,
    custom_branding: true,
    priority_support: true,
  },
};

const paypalPlanIds: Record<string, Record<string, string>> = {
  solo: {
    monthly: "P-63P34771UM342062VNHFUESI",
    yearly: "P-6G718963T9494763UNHFV53Q", 
  },
  team: {
    monthly: "P-45T35817BC411342UNHFUHAA",
    yearly: "P-00X123422A829354VNHFV6IY", 
  },
  agency: {
    monthly: "P-6D9298534V9299530NHFUIMQ",
    yearly: "P-7X6695370D0386640NHFV6VI", 
  },
};

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planKey = (searchParams.get("plan") || "team") as keyof typeof plans;
  const cycle = (searchParams.get("cycle") === "yearly") ? "yearly" : "monthly";
  const plan = plans[planKey] || plans.team;
  const [loading, setLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const price = cycle === "yearly" ? plan.price_yearly : plan.price_monthly;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!userId) {
      alert("You must be logged in to subscribe.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        planId: planKey,
        cycle,
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/onboarding");
    } else {
      alert("Failed to subscribe. Please try again.");
    }
  };

  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paypalLoaded) return;
    if (typeof window === "undefined") return;
    if (!paypalRef.current) return;

    paypalRef.current.innerHTML = "";

    const planId = paypalPlanIds[planKey][cycle];
    let button: any;

    if (window.paypal && planId) {
      button = window.paypal.Buttons({
        style: {
          shape: 'pill',
          color: 'silver',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data: any, actions: any) {
          return actions.subscription.create({
            plan_id: planId
          });
        },
        onApprove: function(data: any, actions: any) {
          fetch('/api/subscription/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscriptionID: data.subscriptionID,
              userId,
              plan: planKey,
              cycle,
            }),
          }).then(() => {
            window.location.href = '/onboarding';
          });
        }
      });
      button.render(paypalRef.current);
    }

    // Always return a cleanup function
    return () => {
      if (paypalRef.current) {
        paypalRef.current.innerHTML = "";
      }
      // Optionally, destroy the PayPal button instance if available
      if (button && button.close) {
        button.close();
      }
    };
  }, [planKey, cycle, userId, paypalLoaded]);

  return (
    <div className="min-h-screen bg-[#0b0f0d] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white/5 border border-emerald-400/30 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Plan Summary */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center bg-gradient-to-br from-emerald-500/10 to-lime-400/10 border-b md:border-b-0 md:border-r-0">
          <h2 className="text-2xl font-bold mb-2 text-center md:text-left">Your Plan</h2>
          <h3 className="text-lg font-semibold mb-1">{plan.display_name}</h3>
          <div className="text-3xl font-bold mb-2">
            {cycle === "yearly"
              ? `$${plan.price_yearly}/yr`
              : `$${plan.price_monthly}/mo`}
          </div>
          <p className="mb-2 text-xs text-emerald-300 font-semibold">{planSummaries[planKey]}</p>
          <ul className="space-y-2 text-sm text-zinc-200 mb-6">
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
          <button
            className="w-full text-sm text-emerald-400 hover:underline mt-auto"
            type="button"
            onClick={() => router.back()}
          >
            &larr; Choose a different plan
          </button>
        </div>
        {/* Divider */}
        <div className="hidden md:flex items-center">
          <div className="h-96 w-1 bg-gradient-to-b from-emerald-400/40 via-white/10 to-lime-400/40 rounded-full mx-6" />
        </div>
        {/* Payment Info */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2 text-center md:text-left">Payment Information</h2>
          <p className="text-zinc-400 text-center md:text-left mb-8">
            Click the PayPal button below to complete your subscription.
          </p>
          <Script
            src="https://www.paypal.com/sdk/js?client-id=AWn3RAfG6hw-ygZmYNREpv8yGm5DGn3lV8en44bBl0C40_sF5EgJXwpcc6Zkd7tbGf04uUx1F1v0V5Rb&vault=true&intent=subscription"
            strategy="afterInteractive"
            onLoad={() => setPaypalLoaded(true)}
          />
          <div ref={paypalRef}></div>
        </div>
      </div>
    </div>
  );
}