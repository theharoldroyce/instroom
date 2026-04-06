"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [brandCount, setBrandCount] = useState<number>(0);
  const [hasAPIAccess, setHasAPIAccess] = useState<boolean>(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function fetchData() {
      const subRes = await fetch("/api/subscription/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session?.user?.id }),
      });
      const subData = await subRes.json();
      setSubscription(subData.subscription);
    }
    fetchData();
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.name) setFullName(session.user.name);
  }, [session?.user?.name]);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function fetchBrandCount() {
      const res = await fetch("/api/user/brand-usage");
      const data = await res.json();
      setBrandCount(data.brandCount || 0);
    }
    fetchBrandCount();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function checkAPIAccess() {
      try {
        const res = await fetch("/api/subscription/api-access");
        const data = await res.json();
        setHasAPIAccess(data.hasAccess || false);
      } catch (error) {
        setHasAPIAccess(false);
      }
    }
    checkAPIAccess();
  }, [session?.user?.id]);

  if (!session || !subscription) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-sm text-stone-400 tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  // Build dynamic plan items based on subscription plan data
  const buildPlanItems = () => {
    if (!subscription.plan) return [];
    
    const maxBrands = subscription.plan.max_brands || subscription.plan.included_brands;
    const maxSeats = subscription.plan.max_seats || subscription.plan.included_seats;
    
    const items: { icon: string; text: string }[] = [];
    
    // Brand limit
    if (maxBrands === null || maxBrands > 100) {
      items.push({ icon: "▸", text: `${brandCount} Brands — Unlimited` });
    } else {
      items.push({ icon: "▸", text: `${brandCount} of ${maxBrands} Brands used` });
    }
    
    // Seat limit
    if (maxSeats === null || maxSeats > 100) {
      items.push({ icon: "▸", text: "Collaborators — Unlimited" });
    } else {
      const seatText = subscription.plan.included_seats > 0 
        ? `${maxSeats} collaborator seats included`
        : `Up to ${maxSeats} collaborators (paid add-on: $${Number(subscription.plan.price_per_extra_seat)}/seat)`;
      items.push({ icon: "▸", text: seatText });
    }
    
    // Plan-specific features
    if (subscription.plan.can_use_api === true) {
      items.push({ icon: "★", text: "API Access — Active" });
    }
    if (subscription.plan.custom_branding === true) {
      items.push({ icon: "★", text: "Custom Branding — Active" });
    }
    if (subscription.plan.priority_support === true) {
      items.push({ icon: "★", text: "Priority Support — Active" });
    }
    
    return items;
  };

  const planColors: Record<string, string> = {
    solo: "bg-stone-100 text-stone-700",
    team: "bg-emerald-50 text-emerald-800",
    agency: "bg-amber-50 text-amber-800",
  };

  const planLabel = {
    solo: "Solo",
    team: "Team",
    agency: "Agency",
  };

  const planName = subscription.plan?.name?.toLowerCase() || "solo";
  const plan = {
    label: planLabel[planName as keyof typeof planLabel] || "Solo",
    color: planColors[planName as keyof typeof planColors] || planColors.solo,
    items: buildPlanItems(),
  };

  return (
    <SidebarProvider className="flex w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');

        .settings-root { font-family: 'DM Sans', sans-serif; }
        .settings-heading { font-family: 'Playfair Display', serif; }

        .card {
          background: #ffffff;
          border: 1px solid #e7e5e0;
          border-radius: 20px;
          transition: box-shadow 0.2s ease;
        }
        .card:hover { box-shadow: 0 8px 32px -8px rgba(0,0,0,0.08); }

        .field-input {
          width: 100%;
          border: 1px solid #e7e5e0;
          border-radius: 10px;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          background: #fafaf8;
          color: #1c1c1c;
          outline: none;
          transition: border-color 0.2s;
        }
        .field-input:focus { border-color: #10b981; background: #fff; }
        .field-input[readonly] { color: #6b7280; cursor: default; }

        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          background: #f0fdf4;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .avatar-ring {
          padding: 3px;
          background: linear-gradient(135deg, #10b981, #34d399);
          border-radius: 50%;
          display: inline-block;
        }

        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e7e5e0, transparent);
          margin: 24px 0;
        }

        .plan-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .usage-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px dashed #f0ede8;
          font-size: 13.5px;
          color: #374151;
        }
        .usage-row:last-child { border-bottom: none; }
        .usage-icon {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: #f0fdf4;
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          flex-shrink: 0;
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #10b981;
          margin-bottom: 18px;
        }

        .page-fade-in {
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.1s; }
        .delay-3 { animation-delay: 0.15s; }
      `}</style>

      <div className="settings-root flex w-full min-h-screen" style={{ background: "#f7f5f2" }}>
        <div className="w-[350px] flex-shrink-0">
          <AppSidebar />
        </div>

        <main className="flex-1 min-h-screen px-10 py-12 w-full">
          {/* Header */}
          <div className="page-fade-in mb-12">
            <p className="section-label">Your Account</p>
            <h1
              className="settings-heading text-4xl font-semibold text-gray-900 leading-tight"
              style={{ letterSpacing: "-0.01em" }}
            >
              Account Settings
            </h1>
            <p className="mt-2 mb-2 text-sm text-stone-400" style={{ fontWeight: 300 }}>
              Manage your profile, plan, and usage details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <section className="card page-fade-in delay-1 p-8 flex flex-col">
              <p className="section-label">Profile</p>

              <div className="flex items-center gap-5 mb-6">
                <div className="avatar-ring flex-shrink-0">
                  <img
                    src={session.user.image || "/avatars/instroom.jpg"}
                    alt="Avatar"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "block",
                      border: "3px solid #fff",
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900" style={{ fontSize: 15 }}>
                    {fullName}
                  </p>
                  <p className="text-stone-400" style={{ fontSize: 13 }}>
                    {session.user.email}
                  </p>
                  <span className="stat-pill mt-2" style={{ fontSize: 11 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                    Active
                  </span>
                </div>
              </div>

              <div className="divider" />

              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase" }}>
                    Full Name
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="field-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1.5px solid #10b981',
                        background: '#10b981',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: 'DM Sans, sans-serif',
                        cursor: 'pointer',
                        transition: 'background 0.18s, color 0.18s',
                        marginLeft: 4
                      }}
                      onClick={async () => {
                        if (!fullName.trim()) return;
                        await fetch('/api/user/update-name', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ user_id: session.user.id, name: fullName })
                        });
                        // No refresh, just update local state
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={session?.user?.email || ""}
                    readOnly
                    className="field-input"
                  />
                </div>
              </div>
            </section>

            {/* Subscription Card */}
            <section className="card page-fade-in delay-2 p-8 flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <p className="section-label" style={{ marginBottom: 0 }}>Subscription</p>
                <span className={`plan-badge ${plan.color}`}>{plan.label}</span>
              </div>

              <div className="space-y-0">
                {[
                  { label: "Current Plan", value: subscription.plan?.display_name || plan.label },
                  { label: "Billing Cycle", value: subscription.billing_cycle },
                  { label: "Status", value: subscription.status },
                  { label: "Renewal Date", value: subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "—" },
                ].map((row, i) => (
                  <div key={i} className="usage-row">
                    <span style={{ color: "#9ca3af", minWidth: 110, fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      {row.label}
                    </span>
                    <span style={{ color: "#111827", fontWeight: 400 }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <button
                style={{
                  marginTop: "auto",
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1.5px solid #10b981",
                  background: "transparent",
                  color: "#065f46",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "DM Sans, sans-serif",
                  cursor: "pointer",
                  transition: "background 0.18s, color 0.18s",
                  alignSelf: "flex-start",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = "#10b981";
                  (e.target as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = "transparent";
                  (e.target as HTMLButtonElement).style.color = "#065f46";
                }}
              >
                Manage Plan →
              </button>
            </section>
          </div>

          {/* Plan Usage Card */}
          <section className="card page-fade-in delay-3 p-8 mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label" style={{ marginBottom: 0 }}>Plan Usage & Limits</p>
              <span className={`plan-badge ${plan.color}`}>{plan.label} Plan</span>
            </div>
            <div className="divider" />
            <div>
              {plan.items.map((item, i) => (
                <div key={i} className="usage-row">
                  <div className="usage-icon">{item.icon}</div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </SidebarProvider>
  );
}