"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"

function ProductDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  return (
    <li ref={ref} style={{ position: "relative" }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: 500,
          color: "var(--charcoal)",
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: 0,
        }}
      >
        Products
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 12px)",
          left: "50%",
          transform: "translateX(-50%)",
          width: 760,
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
          padding: 20,
          zIndex: 200,
        }}>

          {/* Hero card — Instroom Platform */}
          <a href="/#pricing" style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #0F6B3E 0%, #1FAE5B 100%)",
              borderRadius: 12,
              padding: "18px 22px",
              marginBottom: 16,
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* decorative circles */}
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", bottom: -20, right: 60, width: 80, height: 80, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
                <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.18)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
                    <circle cx="12" cy="8" r="1.5" fill="white"/>
                    <path d="M11 11h1v6h1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>Instroom</div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>Influencer relationship management, built for scale</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 420, position: "relative" }}>
                {[
                  { label: "Analytics" },
                  { label: "Brand Partners" },
                  { label: "Gmail Integration" },
                  { label: "Influencer Discovery", soon: true },
                  { label: "Outlook Integration", soon: true },
                ].map(({ label, soon }) => (
                  <span key={label} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 10px",
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 99,
                    fontSize: 11.5, fontWeight: 500,
                    color: "rgba(255,255,255,0.95)",
                    whiteSpace: "nowrap",
                  }}>
                    {!soon && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4"/>
                        <path d="M4 6l1.5 1.5L8 4" stroke="rgba(255,255,255,0.8)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {label}
                    {soon && (
                      <span style={{ fontSize: 9.5, background: "rgba(244,183,64,0.85)", color: "#1E1E1E", borderRadius: 4, padding: "1px 5px", fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase" }}>
                        Soon
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </a>

          {/* Standalone tools */}
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8, padding: "0 4px" }}>
            Standalone Tools
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {/* Post Tracker */}
            <a href="https://posttracker.instroom.io" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 10, border: "1.5px solid #f0f0f0", background: "#fafafa", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1FAE5B"; (e.currentTarget as HTMLDivElement).style.background = "#f0faf4" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#f0f0f0"; (e.currentTarget as HTMLDivElement).style.background = "#fafafa" }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e8f8ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="2" width="14" height="14" rx="3" stroke="#1FAE5B" strokeWidth="1.6"/>
                    <path d="M5 9l2.5 2.5L13 6" stroke="#1FAE5B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1E1E1E", display: "flex", alignItems: "center", gap: 6 }}>
                    Post Tracker
                    <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.04em", textTransform: "uppercase", background: "#f0faf4", color: "#0F6B3E", border: "1px solid #c5ead5" }}>Standalone</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>Track posts, download content, auto-save to Drive</div>
                </div>
              </div>
            </a>

            {/* Chrome Extension */}
            <a href="https://chromewebstore.google.com/detail/instroomio/ehgceomekjhamiakclkpgadphbenlmmj" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 10, border: "1.5px solid #f0f0f0", background: "#fafafa", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1FAE5B"; (e.currentTarget as HTMLDivElement).style.background = "#f0faf4" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#f0f0f0"; (e.currentTarget as HTMLDivElement).style.background = "#fafafa" }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e8f3fa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="#2C8EC4" strokeWidth="1.6"/>
                    <circle cx="9" cy="9" r="3" fill="#2C8EC4" fillOpacity="0.15" stroke="#2C8EC4" strokeWidth="1.4"/>
                    <path d="M9 2v7M15.5 5.5L9 9M15.5 12.5L9 9" stroke="#2C8EC4" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1E1E1E", display: "flex", alignItems: "center", gap: 6 }}>
                    Chrome Extension
                    <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.04em", textTransform: "uppercase", background: "#f0faf4", color: "#0F6B3E", border: "1px solid #c5ead5" }}>Standalone</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>Capture influencer data while browsing Instagram & TikTok</div>
                </div>
              </div>
            </a>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "14px 0" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px 2px" }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>The complete influencer management stack</span>
            <a href="/features" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: "#1FAE5B", textDecoration: "none" }}>
              Explore all features
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="#1FAE5B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

        </div>
      )}
    </li>
  )
}

function NavDropdown({
  label,
  items,
}: {
  label: string
  items: { href: string; title: string; desc: string }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <li ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: 500,
          color: "var(--charcoal)",
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: 0,
        }}
      >
        {label}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: "8px",
            minWidth: 220,
            zIndex: 200,
          }}
        >
          {items.map((item) => (
            <a
              key={item.href + item.title}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: "10px 14px",
                borderRadius: 8,
                textDecoration: "none",
                color: "var(--charcoal)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f4faf7")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{item.title}</span>
              <span style={{ fontSize: "0.7125rem", color: "#6b7280" }}>{item.desc}</span>
            </a>
          ))}
        </div>
      )}
    </li>
  )
}

const RESOURCES = [
  { href: "/blog", title: "Blog", desc: "Guides and updates" },
  { href: "/#faq", title: "FAQs", desc: "Answers to common questions" },
  { href: "/demo", title: "Demo", desc: "See Instroom in action" },
]

export function MainHeader() {
  const pathname = usePathname()

  const navLinkStyle = (href: string) => ({
    textDecoration: "none",
    color: pathname === href ? "var(--green)" : "var(--charcoal)",
    fontWeight: pathname === href ? 600 : 500,
  })

  return (
    <nav
      className="nav"
      style={{
        width: "100%",
        borderBottom: "0.5px solid #e5e7eb",
        background: "rgba(255,255,255,0.95)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="nav-inner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          maxWidth: 1140,
          margin: "0 auto",
          gap: 24,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Image src="/images/instroomLogo.png" alt="Instroom logo" width={36} height={36} />
          <span style={{ fontSize: "1.125rem", fontWeight: "bold", color: "var(--charcoal)" }}>Instroom</span>
        </Link>

        <ul
          className="nav-links"
          style={{
            display: "flex",
            gap: 32,
            alignItems: "center",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          <ProductDropdown />
          <li>
            <Link href="/landing-nav/features" style={navLinkStyle("/landing-nav/features")}>
              What's Inside
            </Link>
          </li>
          <li>
            <Link href="/landing-nav/pricing" style={navLinkStyle("/landing-nav/pricing")}>
              Pricing
            </Link>
          </li>
          <NavDropdown label="Resources" items={RESOURCES} />
        </ul>

        <div className="nav-cta" style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a href="#" style={{ fontSize: "0.9375rem", textDecoration: "none", color: "var(--charcoal)" }}>
            Book a demo
          </a>
          <Link href="/login" style={{ fontSize: "0.9375rem", fontWeight: "500", textDecoration: "none", color: "var(--charcoal)" }}>
            Log in
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-[#0F6B3E] to-[#1FAE5B] text-white font-semibold hover:from-[#0a5a2f] hover:to-[#158a48] shadow-lg shadow-emerald-500/25">
              Start free
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}