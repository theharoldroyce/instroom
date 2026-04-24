"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"

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

const PRODUCTS = [
  { href: "/#pricing", title: "Instroom Platform", desc: "The full workspace" },
  { href: "/#standalone", title: "Chrome Extension", desc: "Capture creators as you browse" },
  { href: "/#standalone", title: "Post Tracker", desc: "Track and archive every post" },
]

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
          <NavDropdown label="Products" items={PRODUCTS} />
          <li>
            <Link href="/features" style={navLinkStyle("/features")}>
              What's Inside
            </Link>
          </li>
          <li>
            <Link href="/pricing" style={navLinkStyle("/pricing")}>
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