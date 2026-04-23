"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function MainHeader() {
  const pathname = usePathname();
  return (
    <nav className="nav" style={{ width: "100%", borderBottom: "0.5px solid #e5e7eb", background: "rgba(255,255,255,0.95)", position: "sticky", top: 0, zIndex: 100 }}>
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
          <Image
            src="/images/instroomLogo.png"
            alt="Instroom logo"
            width={36}
            height={36}
          />
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
        <li><a href="#resources">Products</a></li>
        <li>
        <Link href="/features">
            <span
            style={{
                color: pathname === "/features" ? "var(--green)" : "var(--charcoal)",
                fontWeight: pathname === "/features" ? 600 : 500,
            }}
            >
            What's Inside
            </span>
        </Link>
        </li>
        <li>
        <Link href="/pricing">
            <span style={{
            color: pathname === "/pricing" ? "var(--green)" : "var(--charcoal)",
            fontWeight: pathname === "/pricing" ? 600 : 500,
            }}>
            Pricing
            </span>
        </Link>
        </li>
          <li><a href="#resources">Resources</a></li>
        </ul>
        <div
          className="nav-cta"
          style={{ display: "flex", gap: 18, alignItems: "center" }}
        >
          <a href="#" style={{ fontSize: "0.9375rem", textDecoration: "none", color: "var(--charcoal)" }}>Book a demo</a>
          <Link href="/login">
            <span style={{ fontSize: "0.9375rem", fontWeight: "500", textDecoration: "none", color: "var(--charcoal)", cursor: "pointer" }}>Log in</span>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-[#0F6B3E] to-[#1FAE5B] text-white font-semibold hover:from-emerald-400 hover:to-lime-300">
              Start free
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}