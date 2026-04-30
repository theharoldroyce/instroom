// app/dashboard/settings/notifications/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const notifGroups = [
    {
      group: "Pipeline",
      items: [
        { title: "Influencer replies", desc: "When an influencer replies to your outreach", on: true },
        { title: "Stage changes", desc: "When an influencer is moved to a new pipeline stage", on: false },
        { title: "Deal agreed", desc: "When a deal is confirmed with an influencer", on: true },
      ],
    },
    {
      group: "Post Tracker",
      items: [
        { title: "Post detected", desc: "When a new post is auto-tracked via hashtag or mention", on: true },
        { title: "Post overdue alert", desc: "14 days after delivery with no post detected", on: true },
        { title: "Metrics snapshot ready", desc: "When final post metrics are locked and saved", on: false },
      ],
    },
    {
      group: "Paid Collabs",
      items: [
        { title: "Payment due reminders", desc: "3 days before a payment milestone is due", on: true },
        { title: "Content approved", desc: "When a script or content submission is approved", on: true },
      ],
    },
    {
      group: "Brand Partners",
      items: [
        { title: "New partner suggestion", desc: "When an influencer crosses the Brand Partner threshold", on: true },
      ],
    },
  ]

  return (
    <div style={{ padding: "28px 36px", maxWidth: 780 }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: "#1E1E1E", marginBottom: 4 }}>Notifications</div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>Choose when and how you get notified</div>

      <div style={card}>
        <div style={cardHeader}>
          <div style={cardIcon}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#1FAE5B" strokeWidth="1.5" width={16} height={16}>
              <path d="M8 2a5 5 0 00-5 5v3l-1 2h12l-1-2V7a5 5 0 00-5-5z" />
              <path d="M6.5 13a1.5 1.5 0 003 0" />
            </svg>
          </div>
          <div>
            <div style={cardTitle}>Email notifications</div>
            <div style={cardDesc}>Sent to {session.user.email}</div>
          </div>
        </div>
        <div style={cardBody}>
          {notifGroups.map((group, gi) => (
            <div key={group.group} style={{ marginBottom: 4 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#aaa",
                  marginBottom: 8,
                  marginTop: gi === 0 ? 0 : 14,
                }}
              >
                {group.group}
              </div>
              {group.items.map((item, ii) => (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom:
                      ii === group.items.length - 1 && gi === notifGroups.length - 1
                        ? "none"
                        : "0.5px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#1E1E1E" }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 10,
                      background: item.on ? "#1FAE5B" : "#ddd",
                      position: "relative",
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: 16,
                        height: 16,
                        top: 2,
                        left: item.on ? 18 : 2,
                        background: "#fff",
                        borderRadius: "50%",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div style={btnRow}>
            <button style={btnPrimary}>Save preferences</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "#fff",
  border: "0.5px solid rgba(0,0,0,0.08)",
  borderRadius: 12,
  marginBottom: 16,
  overflow: "hidden",
}
const cardHeader: React.CSSProperties = {
  padding: "16px 20px",
  borderBottom: "0.5px solid rgba(0,0,0,0.07)",
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
}
const cardIcon: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 9,
  background: "#f0faf5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}
const cardTitle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#1E1E1E" }
const cardDesc: React.CSSProperties = { fontSize: 11, color: "#888", marginTop: 2 }
const cardBody: React.CSSProperties = { padding: 20 }
const btnRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 16,
  paddingTop: 14,
  borderTop: "0.5px solid rgba(0,0,0,0.06)",
}
const btnPrimary: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  padding: "8px 18px",
  borderRadius: 9,
  border: "none",
  background: "#1FAE5B",
  color: "#fff",
  cursor: "pointer",
  fontFamily: "inherit",
}