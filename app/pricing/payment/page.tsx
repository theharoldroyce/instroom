"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import Script from "next/script";
import Image from "next/image";
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

function PaymentPageInner() {
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

  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if PayPal is available either from loaded state or from previous load
    const isPaypalReady = paypalLoaded || (typeof window !== "undefined" && !!window.paypal);
    
    if (!isPaypalReady || !paypalRef.current) return;

    const planId = paypalPlanIds[planKey]?.[cycle];
    if (!planId) return;

    // Clear previous button
    paypalRef.current.innerHTML = "";

    // Delay rendering to ensure DOM is fully cleared
    const timeoutId = setTimeout(() => {
      if (!paypalRef.current || !window.paypal) return;

      try {
        const button = window.paypal.Buttons({
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
              window.location.href = '/dashboard';
            });
          }
        });
        button.render(paypalRef.current);
      } catch (error) {
        console.error("Error rendering PayPal button:", error);
      }
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [planKey, cycle, userId, paypalLoaded]);

  return (
    <div className="relative min-h-screen bg-[#F7F9F8] text-[#1E1E1E] overflow-hidden">
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
      
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white border border-[#0F6B3E]/15 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Plan Summary */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center bg-gradient-to-br from-[#1FAE5B]/5 to-[#0F6B3E]/5 border-b md:border-b-0 md:border-r-0">
          <h2 className="text-2xl font-bold mb-2 text-center md:text-left text-[#1E1E1E]">Your Plan</h2>
          <h3 className="text-lg font-semibold mb-1 text-[#1E1E1E]">{plan.display_name}</h3>
          <div className="text-3xl font-bold mb-2 text-[#1E1E1E]">
            {cycle === "yearly"
              ? `$${plan.price_yearly}/yr`
              : `$${plan.price_monthly}/mo`}
          </div>
          <p className="mb-2 text-xs text-[#0F6B3E] font-semibold">{planSummaries[planKey]}</p>
          <ul className="space-y-2 text-sm text-[#1E1E1E] mb-6">
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
            className="w-full text-sm text-[#0F6B3E] hover:underline mt-auto"
            type="button"
            onClick={() => router.back()}
          >
            &larr; Choose a different plan
          </button>
        </div>
        {/* Divider */}
        <div className="hidden md:flex items-center">
          <div className="h-96 w-1 bg-gradient-to-b from-[#1FAE5B]/40 via-[#1E1E1E]/10 to-[#0F6B3E]/40 rounded-full mx-6" />
        </div>
        {/* Payment Info */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2 text-center md:text-left text-[#1E1E1E]">Payment Information</h2>
          <p className="text-[#666666] text-center md:text-left mb-8">
            Click the PayPal button below to complete your subscription.
          </p>
          <Script
            src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription`}
            strategy="afterInteractive"
            onLoad={() => setPaypalLoaded(true)}
          />
          <div ref={paypalRef}></div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F9F8] flex items-center justify-center text-[#1E1E1E]">Loading...</div>}>
      <PaymentPageInner />
    </Suspense>
  );
}