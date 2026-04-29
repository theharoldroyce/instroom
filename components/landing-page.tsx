"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"

export function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  useEffect(() => {
    const tabs = document.querySelectorAll('.inside-feat-tab')
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = (tab as HTMLElement).dataset.tab
        const container = tab.closest('.inside-tabbed')
        if (!container || !target) return
        container.querySelectorAll('.inside-feat-tab').forEach(t => t.classList.remove('tab-active'))
        container.querySelectorAll('.inside-feat-panel').forEach(p => p.classList.remove('panel-active'))
        tab.classList.add('tab-active')
        const panel = container.querySelector(`[data-panel="${target}"]`)
        if (panel) panel.classList.add('panel-active')
      })
    })
  }, [])

  const faqs = [
    { q: "Do I need the full platform, or can I start with just the Chrome Extension?", a: "Either works. The Chrome Extension and Post Tracker are standalone products with their own pricing. You can use them without ever signing up for the full platform. If you want everything in one workspace later, you can connect them to Instroom and your data carries over." },
    { q: "What happens after the 30-day trial?", a: "Nothing automatic. We don't ask for a credit card to start, so the trial doesn't convert into a paid plan on its own. If you decide to keep using Instroom, you pick a plan and add payment details. If you don't, your account stays read-only and your data is preserved for 30 days." },
    { q: "Can I import my existing creator data from spreadsheets?", a: "Yes. You can import creators via CSV during setup or any time after. We keep the import flexible because we know every agency's spreadsheet is laid out differently." },
    { q: "Is my data secure, especially if I'm managing client campaigns?", a: "Yes. Each workspace is isolated, and access is controlled by role-based permissions (Admin, Manager, Viewer, Researcher). Shared workspaces work like Google Drive, you control who can see and edit what. See our Privacy Policy for full details." },
    { q: "What if I outgrow my plan?", a: "Upgrade any time. Solo accounts can move to Team when they need more than one workspace. Team accounts can add extra workspaces at $12/month each. Everything you've built carries over, no migration required." },
    { q: "You said the product is still being built. What does that mean for me?", a: "The core platform (campaigns, creator CRM, outreach, tracking) is live and working. Some add-ons like Discovery, Shopify Connect, and Affiliate Tracking are still in development. If you sign up now, you get the core, and new tools roll out as they're ready. Early users have a direct line to us for feedback and feature requests." },
  ]

  const problems = [
    { title: "Every campaign starts from zero.", desc: "Before you've contacted a single creator, you're already building a tracker. Setting up columns. Writing formulas. The wheel has already been invented. You shouldn't have to build it every time." },
    { title: "Your campaign lives in five different places.", desc: "Outreach in one tool. Tracking in another. Content saved somewhere. Reports in a third. No one has the full picture, and getting it means interrupting three people." },
    { title: "You're funding features you've never opened.", desc: "The platforms that have what you need charge for everything else too. Your budget should go toward creators, not software you're using 20% of." }
  ]

  const outcomes = [
    { label: "Problem 1", problem: "Every campaign starts from zero", solution: "Pre-built, ready on day one.", desc: "Campaign structure, creator fields, pipeline stages, all set up for you. You import your creators and start running, not building." },
    { label: "Problem 2", problem: "Your campaign lives in five different places", solution: "One workspace. One source of truth.", desc: "Outreach, tracking, content, and reporting all live in the same place. Your whole team sees the same thing without chasing anyone." },
    { label: "Problem 3", problem: "You're funding features you've never opened", solution: "Pay for the core. Add only what you use.", desc: "Start with the main platform. Add the Chrome Extension, Post Tracker, or other tools only when you need them. Or just use them standalone, no platform required." }
  ]

  const features = [
    { eyebrow: "Pipeline management", title: "See your campaign the way you think.", desc: "Every agency has someone who wants a spreadsheet and someone who wants a board. In Instroom, you get both. Flip between list view and Kanban with one click. The data is the same, the view changes with how your brain is working that day.", link: "instroom_features.html#pipeline" },
    { eyebrow: "Embedded email", title: "Reach out without leaving the room.", desc: "Send outreach, reply to creators, and track every thread inside Instroom. Every email is tied to the right creator and the right pipeline stage, so nothing gets lost in someone's Gmail folder. When a teammate picks up a reply at 9am, they have the full context.", link: "instroom_features.html#email" },
    { eyebrow: "Creator CRM", title: "Every creator, every detail, remembered.", desc: "Profiles hold everything. Every campaign they've run. Every post they've published. Every payment, every note, every tag. Six months from now when you're deciding who to bring back, the history is right there. No more digging through old threads.", link: "instroom_features.html#crm" },
    { eyebrow: "Reporting", title: "Client reports in one click.", desc: "No more Sunday nights spent copying screenshots into a slide deck. Pick the campaign, pick the date range, and Instroom pulls a clean report with posts, results, and revenue per creator. Share it as a link or export a PDF.", link: "instroom_features.html#reporting" },
    { eyebrow: "Brand Partners", title: "Turn one-off creators into long-term partners.", desc: "The creators who consistently deliver deserve more than a spreadsheet row. Brand Partners gives them a real home. Tiered status (Bronze, Silver, Gold) based on actual performance. Retainer tracking. Full history of every campaign they've run with you. So the next budget conversation isn't a guess.", link: "instroom_features.html#brand-partners" }
  ]

  const comparisons = [
    { spreadsheet: "Rebuild the tracker every campaign", instroom: "Pre-built campaign structure on day one" },
    { spreadsheet: "Rows and columns only", instroom: "Spreadsheet view or Kanban board, your choice" },
    { spreadsheet: "Manual status updates", instroom: "Status updates tied to actual activity" },
    { spreadsheet: "One person holds the system together", instroom: "Your whole team sees the same thing" },
    { spreadsheet: "Screenshots and copy-paste for client reports", instroom: "Clean reports, one click" },
    { spreadsheet: "Costs you hours every week", instroom: "Gives time back" }
  ]

  return (
    <div className="font-sans text-zinc-900 bg-white">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap');

        :root {
          --green: #1FAE5B;
          --deep-green: #0F6B3E;
          --charcoal: #1E1E1E;
          --off-white: #F4F7F5;
          --border: rgba(30,30,30,0.09);
          --muted: #71717a;
        }

        /* ── Typography ── */
        .font-display { font-family: 'Manrope', sans-serif; }
        .font-hand    { font-family: 'Caveat', cursive; }

        /* ── Layout helpers ── */
        .container-md {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .section       { padding: 96px 0; }
        .section-alt   { background: var(--off-white); }

        /* ── Alternating section backgrounds (mirrors feature page) ── */
        .sec-odd  { background: #ffffff; }
        .sec-even { background: #F4F7F5; }

        .section-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 56px;
        }
        .section-header h2 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          color: #1E1E1E;
          margin-bottom: 16px;
          line-height: 1.2;
        }
        .section-header p {
          font-size: 1.125rem;
          color: #52525b;
          line-height: 1.65;
        }

        /* ── Hero ── */
        .hero {
          padding: 96px 0 72px;
          text-align: center;
          /* base color comes from sec-odd / sec-even; dot grid overlays on top */
          background-image:
            radial-gradient(circle, rgba(31,174,91,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .hero h1 {
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 5vw, 3.625rem);
          line-height: 1.12;
          letter-spacing: -0.02em;
          color: #1E1E1E;
          max-width: 860px;
          margin: 0 auto 24px;
        }

        .hero-lead {
          max-width: 640px;
          margin: 0 auto 36px;
          font-size: 1.1875rem;
          color: #3f3f46;
          line-height: 1.65;
        }

        .hero-ctas {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .hero-sub {
          font-size: 0.8125rem;
          color: #52525b;
        }

        .hero-mockup {
          max-width: 960px;
          margin: 60px auto 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(15,107,62,0.14), 0 0 0 1px var(--border);
          background: white;
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          font-size: 0.875rem;
        }

        /* ── Stats ── */
        .stats {
          padding: 64px 0 48px;
          text-align: center;
        }

        .stats-row {
          display: flex;
          justify-content: center;
          align-items: baseline;
          gap: 64px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .stat { display: flex; flex-direction: column; align-items: center; }

        .stat-num {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(1.75rem, 3.5vw, 2.25rem);
          font-weight: 800;
          color: #1FAE5B;
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-label {
          font-size: 0.8125rem;
          color: #52525b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        /* ── Trust bar ── */
        .trust {
          padding: 48px 0 56px;
        }

        .trust-label {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #52525b;
          margin-bottom: 32px;
        }

        .trust-logos {
          display: flex;
          align-items: center;
          gap: 24px;
          overflow: hidden;
          opacity: 0.7;
          position: relative;
          height: 90px;
        }

        .trust-carousel {
          display: flex;
          gap: 24px;
          animation: scroll-left 60s linear infinite;
          will-change: transform;
        }

        .trust-carousel:hover {
          animation-play-state: paused;
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% - 24px));
          }
        }

        .trust-logo {
          height: 52px;
          padding: 0 16px;
          background: #f3f3f3;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #e5e5e5;
        }

        .trust-logo img {
          height: 40px !important;
          width: auto !important;
          max-width: 140px !important;
          object-fit: contain !important;
        }

        /* ── Problem cards ── */
        .problem-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 56px;
        }

        .problem-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          border: 1px solid var(--border);
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
        }

        .problem-card:hover {
          box-shadow: 0 8px 28px rgba(15,107,62,0.08);
        }

        .problem-card-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(31,174,91,0.1);
          color: #1FAE5B;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .problem-card h3 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 1.0625rem;
          color: #1E1E1E;
          margin-bottom: 10px;
        }

        .problem-card p {
          color: #52525b;
          font-size: 0.9375rem;
          line-height: 1.65;
        }

        /* ── Outcomes ── */
        .outcomes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 56px;
        }

        .outcome {
          background: white;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        .outcome-label {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #71717a;
          margin-bottom: 10px;
        }

        .outcome-problem {
          font-size: 0.9rem;
          color: #a1a1aa;
          text-decoration: line-through;
          margin-bottom: 14px;
          line-height: 1.4;
        }

        .outcome-divider {
          width: 32px;
          height: 2px;
          background: #1FAE5B;
          border-radius: 2px;
          margin-bottom: 14px;
        }

        .outcome h3 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 1.125rem;
          color: #0F6B3E;
          margin-bottom: 10px;
        }

        .outcome p {
          color: #52525b;
          font-size: 0.9375rem;
          line-height: 1.65;
        }

        /* ── Features (inside rows) ── */
        .inside-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
          margin-bottom: 96px;
        }

        .inside-row:last-child { margin-bottom: 0; }

        .inside-row.reverse { direction: rtl; }
        .inside-row.reverse > * { direction: ltr; }

        .inside-eyebrow {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #1FAE5B;
          margin-bottom: 12px;
        }

        .inside-text h3 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: clamp(1.375rem, 2.5vw, 1.75rem);
          color: #1E1E1E;
          margin-bottom: 14px;
          line-height: 1.25;
        }

        .inside-text p {
          font-size: 1.0625rem;
          line-height: 1.72;
          color: #52525b;
          margin-bottom: 20px;
        }

        .inside-link {
          font-weight: 600;
          font-size: 0.9375rem;
          color: #1FAE5B;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .inside-link:hover { text-decoration: underline; }

        .inside-visual {
          aspect-ratio: 4 / 3;
          background: linear-gradient(135deg, #EDF5F0 0%, #D9EDE2 100%);
          border-radius: 16px;
          border: 1px solid rgba(31,174,91,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b9e7e;
          font-size: 0.875rem;
          font-weight: 500;
          overflow: hidden;
          position: relative;
        }

        /* ── How it works ── */
        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          max-width: 880px;
          margin: 56px auto 0;
        }

        .how-step { text-align: center; padding: 24px 16px; }

        .how-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #1FAE5B;
          color: white;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
          margin-bottom: 20px;
          box-shadow: 0 8px 20px rgba(31,174,91,0.28);
        }

        .how-step h3 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 1.0625rem;
          color: #1E1E1E;
          margin-bottom: 10px;
        }

        .how-step p {
          color: #52525b;
          font-size: 0.9375rem;
          line-height: 1.65;
        }

        /* ── Comparison table ── */
        .compare-table {
          max-width: 860px;
          margin: 56px auto 0;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
        }

        .compare-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--off-white);
          border-bottom: 1px solid var(--border);
        }

        .compare-header-cell {
          padding: 18px 28px;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 0.9375rem;
        }

        .compare-header-cell:first-child { color: #71717a; }
        .compare-header-cell:last-child {
          color: #0F6B3E;
          border-left: 1px solid var(--border);
        }

        .compare-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid var(--border);
        }

        .compare-row:last-child { border-bottom: none; }

        .compare-cell {
          padding: 17px 28px;
          font-size: 0.9375rem;
          color: var(--charcoal);
        }

        .compare-row > .compare-cell:first-child {
          color: #a1a1aa;
          background: white;
        }

        .compare-row > .compare-cell:last-child {
          color: #1E1E1E;
          font-weight: 500;
          border-left: 1px solid var(--border);
          background: rgba(31,174,91,0.03);
        }

        .compare-icon {
          display: inline-block;
          margin-right: 8px;
          color: #1FAE5B;
          font-weight: 700;
        }

        /* ── Founder ── */
        .founder-inner {
          max-width: 720px;
          margin: 0 auto;
          background: white;
          padding: 56px;
          border-radius: 20px;
          border: 1px solid var(--border);
          box-shadow: 0 8px 40px rgba(15,107,62,0.06);
        }

        .founder-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #1FAE5B;
          margin-bottom: 14px;
        }

        .founder-inner h2 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 1.75rem;
          margin-bottom: 28px;
          color: #1E1E1E;
        }

        .founder-body p {
          font-size: 1.0625rem;
          line-height: 1.78;
          color: #52525b;
          margin-bottom: 18px;
        }

        .founder-sign {
          margin-top: 40px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .founder-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid var(--green);
          background: #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 0.75rem;
        }

        .founder-title { font-size: 0.875rem; color: #3f3f46; font-weight: 500; }

        /* ── Standalone ── */
        .standalone-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          max-width: 780px;
          margin: 56px auto 0;
        }

        .standalone-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          transition: box-shadow 0.2s;
        }

        .standalone-card:hover {
          box-shadow: 0 8px 28px rgba(15,107,62,0.08);
        }

        .standalone-card h3 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 1.125rem;
          color: var(--charcoal);
          margin-bottom: 10px;
        }

        .standalone-card p {
          color: #52525b;
          margin-bottom: 20px;
          font-size: 0.9375rem;
          line-height: 1.65;
        }

        .standalone-link {
          font-weight: 600;
          font-size: 0.9375rem;
          color: #1FAE5B;
          text-decoration: none;
        }

        /* ── Early / testimonial placeholder ── */
        .early {
          text-align: center;
          padding: 80px 0;
        }

        .early-inner {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .early h2 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: clamp(1.5rem, 3vw, 2rem);
          color: var(--charcoal);
          margin-bottom: 20px;
        }

        .early-body {
          font-size: 1.0625rem;
          color: #3f3f46;
          line-height: 1.7;
          margin-bottom: 20px;
        }

        /* ── FAQ ── */
        .faq {
          padding: 96px 0;
        }

        .faq-list {
          max-width: 760px;
          margin: 56px auto 0;
        }

        .faq-item {
          border-bottom: 1px solid var(--border);
          padding: 24px 0;
        }

        .faq-item:first-child { padding-top: 0; }
        .faq-item:last-child { border-bottom: none; padding-bottom: 0; }

        .faq-q {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          cursor: pointer;
          font-family: 'Manrope', sans-serif;
          font-size: 1.0625rem;
          font-weight: 600;
          color: #1E1E1E;
          gap: 24px;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          transition: color 0.15s;
        }

        .faq-q:hover { color: #1FAE5B; }

        .faq-q-icon {
          color: #1FAE5B;
          font-size: 1.375rem;
          font-weight: 700;
          flex-shrink: 0;
          transition: transform 0.2s ease;
          line-height: 1;
        }

        .faq-item.open .faq-q-icon { transform: rotate(45deg); }

        .faq-a {
          margin-top: 14px;
          color: #52525b;
          font-size: 0.9375rem;
          line-height: 1.72;
        }

        /* ── Pricing ── */
        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr 1.08fr;
          gap: 20px;
          max-width: 800px;
          margin: 56px auto 0;
          align-items: center;
          padding-bottom: 24px;
          overflow: visible;
        }

        .price-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 36px 32px;
          position: relative;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .price-card.featured {
          background: #0F6B3E;
          border-color: transparent;
          box-shadow: 0 20px 48px rgba(15,107,62,0.22);
          transform: scale(1.03);
        }

        .price-badge {
          display: inline-block;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(31,174,91,0.12);
          color: #1FAE5B;
          margin-bottom: 14px;
        }

        .featured .price-badge {
          background: rgba(255,255,255,0.15);
          color: white;
        }

        .price-card h3 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          color: #1E1E1E;
          margin-bottom: 8px;
        }

        .featured h3 { color: white; }

        .price-desc {
          font-size: 0.9375rem;
          color: #52525b;
          margin-bottom: 24px;
          line-height: 1.55;
        }

        .featured .price-desc { color: rgba(255,255,255,0.78); }

        .price-amount {
          font-family: 'Manrope', sans-serif;
          font-size: 2.25rem;
          font-weight: 800;
          color: #1E1E1E;
          margin-bottom: 4px;
          line-height: 1;
        }

        .featured .price-amount { color: white; }

        .price-unit {
          font-size: 1rem;
          font-weight: 500;
          color: #71717a;
        }

        .featured .price-unit { color: rgba(255,255,255,0.6); }

        .price-annual {
          font-size: 0.8125rem;
          color: #71717a;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .featured .price-annual { color: rgba(255,255,255,0.6); }

        .price-trial {
          font-size: 0.8125rem;
          color: #1FAE5B;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .featured .price-trial { color: rgba(255,255,255,0.85); }

        /* ── Final CTA ── */
        .final-cta {
          background: #1E1E1E;
          color: white;
          text-align: center;
          padding: 96px 0;
          position: relative;
          overflow: hidden;
        }

        /* subtle radial glow behind final CTA */
        .final-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(31,174,91,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .final-cta-content { position: relative; z-index: 1; }

        .final-cta h2 {
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          color: white;
          max-width: 740px;
          margin: 0 auto 16px;
          line-height: 1.2;
        }

        .final-cta-lead {
          font-size: 1.0625rem;
          color: rgba(255,255,255,0.75);
          margin-bottom: 36px;
        }

        .final-cta-sub {
          margin-top: 20px;
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.5);
        }

        /* ── Footer ── */
        .footer {
          background: #111;
          color: rgba(255,255,255,0.65);
          padding: 56px 0 32px;
          font-size: 0.875rem;
        }

        .footer-inner {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
          max-width: 1140px;
          margin-left: auto;
          margin-right: auto;
          padding: 0 24px;
        }

        .footer h4 {
          color: white;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
        }

        .footer ul { list-style: none; }
        .footer li { margin-bottom: 10px; }

        .footer a {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.15s;
        }

        .footer a:hover { color: white; }

        .footer-bottom {
          padding: 24px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.4);
          flex-wrap: wrap;
          gap: 12px;
          max-width: 1140px;
          margin: 0 auto;
        }

        /* ── What's Inside — Tabbed ── */
        .inside-tabbed-intro {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 48px;
        }

        .inside-tabbed-intro h2 {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1E1E1E;
          margin-bottom: 14px;
          line-height: 1.2;
        }

        .inside-tabbed-intro p {
          font-size: 1.0625rem;
          color: #52525b;
          line-height: 1.65;
        }

        .inside-feat-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 48px;
          flex-wrap: wrap;
          padding: 6px;
          background: #F7F9F8;
          border: 0.5px solid rgba(30,30,30,0.08);
          border-radius: 14px;
          max-width: max-content;
          margin-left: auto;
          margin-right: auto;
        }

        .inside-feat-tab {
          background: transparent;
          border: none;
          padding: 12px 22px;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .inside-feat-tab:hover { color: #1E1E1E; }

        .inside-feat-tab.tab-active {
          background: #0F6B3E;
          color: white;
          box-shadow: 0 2px 8px rgba(15, 107, 62, 0.18);
        }

        .inside-feat-tab.tab-active:hover { color: white; }

        .inside-feat-panel {
          display: none;
          animation: insideFadeIn 0.25s ease;
        }

        .inside-feat-panel.panel-active { display: block; }

        @keyframes insideFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .inside-feat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        .inside-feat-visual {
          background: linear-gradient(135deg, #F7F9F8 0%, #EEF4F0 100%);
          border: 0.5px solid rgba(30,30,30,0.08);
          border-radius: 18px;
          aspect-ratio: 4 / 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 32px;
          box-shadow: 0 8px 32px rgba(15, 107, 62, 0.04);
        }

        .inside-feat-visual-icon {
          width: 72px;
          height: 72px;
          border-radius: 18px;
          background: #1FAE5B;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
        }

        .inside-feat-visual-label {
          font-size: 0.75rem;
          color: #6B7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 4px;
          text-align: center;
        }

        .inside-feat-eyebrow {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #1FAE5B;
          margin-bottom: 14px;
        }

        .inside-feat-text h3 {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(1.5rem, 2.5vw, 1.875rem);
          font-weight: 700;
          color: #1E1E1E;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .inside-feat-lead {
          color: #3F3F46;
          font-size: 1.0625rem;
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .inside-feat-bullets {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
        }

        .inside-feat-bullets li {
          padding: 8px 0 8px 28px;
          position: relative;
          color: #3F3F46;
          font-size: 0.9375rem;
          line-height: 1.55;
        }

        .inside-feat-bullets li::before {
          content: "✓";
          color: #1FAE5B;
          font-weight: 700;
          position: absolute;
          left: 0;
        }

        .inside-feat-link {
          font-weight: 600;
          color: #1FAE5B;
          font-size: 0.9375rem;
          text-decoration: none;
          display: inline-block;
        }

        .inside-feat-link:hover { text-decoration: underline; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .inside-feat-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .inside-feat-tabs {
            gap: 4px;
            overflow-x: auto;
            justify-content: flex-start;
            flex-wrap: nowrap;
            max-width: 100%;
            padding: 4px;
          }

          .inside-feat-tab {
            padding: 10px 14px;
            font-size: 0.875rem;
          }

          .problem-cards,
          .outcomes-grid,
          .how-grid,
          .standalone-grid,
          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .inside-row {
            grid-template-columns: 1fr;
            gap: 32px;
            margin-bottom: 64px;
            direction: ltr !important;
          }

          .inside-row.reverse > * { direction: ltr; }

          .compare-header,
          .compare-row {
            grid-template-columns: 1fr;
          }

          .compare-header-cell:last-child,
          .compare-cell:last-child {
            border-left: none;
            border-top: 1px solid var(--border);
          }

          .footer-inner {
            grid-template-columns: 1fr 1fr;
          }

          .price-card.featured { transform: scale(1); }

          .founder-inner { padding: 36px 28px; }
        }

        @media (max-width: 640px) {
          .hero { padding: 64px 0 48px; }
          .stats-row { gap: 36px; }
          .trust-logos { gap: 16px; }
          .footer-inner { grid-template-columns: 1fr; }
        }

        /* ── Nav CTA: fix yellow hover from emerald-400 ── */
        /* Targets the Start free button rendered by MainHeader */
        .nav-cta-btn:hover,
        [class*="hover:bg-emerald-400"]:hover,
        [class*="hover:to-lime"]:hover {
          background-color: #158a48 !important;
          background-image: linear-gradient(to right, #0a5a2f, #158a48) !important;
        }
      `}</style>

      {/*
        NOTE FOR MAINTAINER (Issue 6):
        The "Start free" button in MainHeader uses hover:bg-emerald-400 / hover:to-lime-300
        which produces a yellow tone. In MainHeader, change those to:
          hover:from-[#0a5a2f] hover:to-[#158a48]
        to match the Start Free Trial button style.
      */}

      {/* NAV */}
      <MainHeader />

      {/* HERO */}
      <section className="hero sec-even">
        <div className="container-md">
          <p className="text-xs font-bold uppercase tracking-widest text-green-600 mb-5">
            Influencer marketing, organized
          </p>
          <h1>Influencer marketing isn't complicated. Managing it without the right system is.</h1>
          <p className="hero-lead">
            Instroom is the system. Every creator, every campaign, every result — in one workspace. Built by people who've done the work.
          </p>
          <div className="hero-ctas">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-[#0F6B3E] to-[#1FAE5B] text-white font-semibold h-12 px-8 hover:from-[#0a5a2f] hover:to-[#158a48] shadow-lg shadow-emerald-500/25 rounded-xl">
                Start Free Trial
              </Button>
            </Link>
            {/* FIX: "Learn More" was previously styled as white text on a light background.
                Now using a solid visible style: dark border + dark text on the light hero bg. */}
            <a href="#features">
              <Button
                variant="outline"
                className="h-12 px-8 rounded-xl border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400 font-semibold"
              >
                See how it works
              </Button>
            </a>
          </div>
          <p className="hero-sub">No credit card required · 30-day free trial</p>
          <div className="hero-mockup">[Product screenshot / dashboard hero image]</div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats sec-odd">
        <div className="container-md">
          <div className="stats-row">
            <div className="stat">
              <div className="stat-num">200+</div>
              <div className="stat-label">Campaigns managed</div>
            </div>
            <div className="stat">
              <div className="stat-num">100,000+</div>
              <div className="stat-label">Creator relationships</div>
            </div>
            <div className="stat">
              <div className="stat-num">$10M+</div>
              <div className="stat-label">In sales generated</div>
            </div>
          </div>
          <p className="text-xs text-zinc-400 italic mt-4 text-center">Approximate totals across the brands we've worked with.</p>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust sec-even">
        <div className="container-md">
          <p className="trust-label">Brands we've managed campaigns for</p>
          <div className="trust-logos">
            <div className="trust-carousel">
              {[
                { name: "Alcanside", ext: "png" },
                { name: "AwesomeMaps", ext: "jpg" },
                { name: "Chapters", ext: "jpg" },
                { name: "Comfit", ext: "png" },
                { name: "CuliStack", ext: "jpg" },
                { name: "Dadafunk", ext: "png" },
                { name: "Dreamfully", ext: "jpg" },
                { name: "Ease", ext: "png" },
                { name: "Formulation", ext: "jpg" },
                { name: "Heroka", ext: "jpg" },
                { name: "Lotgenootje", ext: "jpeg" },
                { name: "MoomHealth", ext: "jpg" },
                { name: "Muse", ext: "png" },
                { name: "Nonoise", ext: "jpg" },
                { name: "Okura", ext: "png" },
                { name: "OralAdvance", ext: "jpg" },
                { name: "Pacdora", ext: "jpg" },
                { name: "Remodius", ext: "png" },
                { name: "Royo", ext: "png" },
                { name: "Shihiko", ext: "jpg" },
                { name: "SylvianGrant", ext: "png" },
                { name: "TapOut", ext: "jpg" },
                { name: "TWGR", ext: "gif" },
                { name: "Yummii", ext: "png" },
                { name: "Zippit", ext: "png" },
              ].map(({ name, ext }) => (
                <div key={name} className="trust-logo">
                  <Image src={`/images/brandLogo/${name}.${ext}`} alt={name} width={140} height={40} style={{ objectFit: "contain", height: "40px", width: "auto", maxWidth: "140px" }} />
                </div>
              ))}
              {/* Duplicate logos for seamless loop */}
              {[
                { name: "Alcanside", ext: "png" },
                { name: "AwesomeMaps", ext: "jpg" },
                { name: "Chapters", ext: "jpg" },
                { name: "Comfit", ext: "png" },
                { name: "CuliStack", ext: "jpg" },
                { name: "Dadafunk", ext: "png" },
                { name: "Dreamfully", ext: "jpg" },
                { name: "Ease", ext: "png" },
                { name: "Formulation", ext: "jpg" },
                { name: "Heroka", ext: "jpg" },
                { name: "Lotgenootje", ext: "jpeg" },
                { name: "MoomHealth", ext: "jpg" },
                { name: "Muse", ext: "png" },
                { name: "Nonoise", ext: "jpg" },
                { name: "Okura", ext: "png" },
                { name: "OralAdvance", ext: "jpg" },
                { name: "Pacdora", ext: "jpg" },
                { name: "Remodius", ext: "png" },
                { name: "Royo", ext: "png" },
                { name: "Shihiko", ext: "jpg" },
                { name: "SylvianGrant", ext: "png" },
                { name: "TapOut", ext: "jpg" },
                { name: "TWGR", ext: "gif" },
                { name: "Yummii", ext: "png" },
                { name: "Zippit", ext: "png" },
              ].map(({ name, ext }) => (
                <div key={`dup-${name}`} className="trust-logo">
                  <Image src={`/images/brandLogo/${name}.${ext}`} alt={name} width={140} height={40} style={{ objectFit: "contain", height: "40px", width: "auto", maxWidth: "140px" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section sec-odd">
        <div className="container-md">
          <div className="section-header">
            <h2>You didn't start your brand to live in a spreadsheet.</h2>
            <p>But here you are. Multiple tabs. Multiple tools. A nagging feeling that you're paying creators and hoping it's working.</p>
          </div>
          <div className="problem-cards">
            {problems.map((problem, index) => (
              <div key={index} className="problem-card">
                <div className="problem-card-num">{index + 1}</div>
                <h3>{problem.title}</h3>
                <p>{problem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="section sec-even">
        <div className="container-md">
          <div className="section-header">
            <h2>Here's what changes with Instroom.</h2>
          </div>
          <div className="outcomes-grid">
            {outcomes.map((outcome, index) => (
              <div key={index} className="outcome">
                <div className="outcome-label">{outcome.label}</div>
                <div className="outcome-problem">{outcome.problem}</div>
                <div className="outcome-divider" />
                <h3>{outcome.solution}</h3>
                <p>{outcome.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE — Tabbed */}
      <section className="section sec-odd inside-tabbed" id="features">
        <div className="container-md">
          <div className="inside-tabbed-intro">
            <h2>What&rsquo;s inside Instroom.</h2>
            <p>Five core tools that replace the stack you&rsquo;ve been duct-taping together. Click through to see each one.</p>
          </div>

          <div className="inside-feat-tabs">
            <button className="inside-feat-tab tab-active" data-tab="pipeline">Pipeline</button>
            <button className="inside-feat-tab" data-tab="email">Email</button>
            <button className="inside-feat-tab" data-tab="crm">Creator CRM</button>
            <button className="inside-feat-tab" data-tab="reporting">Reporting</button>
            <button className="inside-feat-tab" data-tab="brand-partners">Brand Partners</button>
          </div>

          <div>
            {/* Pipeline */}
            <div className="inside-feat-panel panel-active" data-panel="pipeline">
              <div className="inside-feat-grid">
                <div className="inside-feat-visual">
                  <div className="inside-feat-visual-icon">⊞</div>
                  <div className="inside-feat-visual-label">Pipeline management preview coming soon</div>
                </div>
                <div className="inside-feat-text">
                  <div className="inside-feat-eyebrow">Pipeline management</div>
                  <h3>Work the way you want. List, board, or both.</h3>
                  <p className="inside-feat-lead">The same data in two views. See everything in a Kanban board or scan fast in a spreadsheet view. Switch between them in one click.</p>
                  <ul className="inside-feat-bullets">
                    <li>Pre-built pipeline stages per campaign</li>
                    <li>List or Kanban view, your choice</li>
                    <li>Drag and drop to update stages</li>
                    <li>Bulk actions: update or assign in one move</li>
                  </ul>
                  <a href="landing-nav/features#pipeline" className="inside-feat-link">See full details &rarr;</a>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="inside-feat-panel" data-panel="email">
              <div className="inside-feat-grid">
                <div className="inside-feat-visual">
                  <div className="inside-feat-visual-icon">✉</div>
                  <div className="inside-feat-visual-label">Embedded email preview coming soon</div>
                </div>
                <div className="inside-feat-text">
                  <div className="inside-feat-eyebrow">Embedded Email</div>
                  <h3>Reach out, reply, and track without leaving Instroom.</h3>
                  <p className="inside-feat-lead">Your inbox lives inside the workspace. Every email auto-tagged to the right campaign and stage, so context never gets lost.</p>
                  <ul className="inside-feat-bullets">
                    <li>Connect Gmail or Outlook in one click</li>
                    <li>Auto-tagged to campaign and pipeline stage</li>
                    <li>Templates with creator variables</li>
                    <li>Full thread history on every creator profile</li>
                  </ul>
                  <a href="landing-nav/features#email" className="inside-feat-link">See full details &rarr;</a>
                </div>
              </div>
            </div>

            {/* Creator CRM */}
            <div className="inside-feat-panel" data-panel="crm">
              <div className="inside-feat-grid">
                <div className="inside-feat-visual">
                  <div className="inside-feat-visual-icon">👤</div>
                  <div className="inside-feat-visual-label">Creator CRM preview coming soon</div>
                </div>
                <div className="inside-feat-text">
                  <div className="inside-feat-eyebrow">Creator CRM</div>
                  <h3>Profiles that remember everything.</h3>
                  <p className="inside-feat-lead">Every campaign, every post, every payment, every conversation. When you come back to a creator six months later, the full history is waiting.</p>
                  <ul className="inside-feat-bullets">
                    <li>Full campaign and content history</li>
                    <li>Payment and deal records attached</li>
                    <li>Tags, custom fields, and team notes</li>
                    <li>Shared across your team with roles</li>
                  </ul>
                  <a href="landing-nav/features#crm" className="inside-feat-link">See full details &rarr;</a>
                </div>
              </div>
            </div>

            {/* Reporting */}
            <div className="inside-feat-panel" data-panel="reporting">
              <div className="inside-feat-grid">
                <div className="inside-feat-visual">
                  <div className="inside-feat-visual-icon">⚑</div>
                  <div className="inside-feat-visual-label">Reporting preview coming soon</div>
                </div>
                <div className="inside-feat-text">
                  <div className="inside-feat-eyebrow">Reporting</div>
                  <h3>Client-ready reports, one click away.</h3>
                  <p className="inside-feat-lead">Stop building reports the night before a client call. Pull performance by creator, campaign, or deliverable. Export PDFs or share live links.</p>
                  <ul className="inside-feat-bullets">
                    <li>One-click campaign summaries</li>
                    <li>Per-creator performance breakdowns</li>
                    <li>Live-updating shareable links</li>
                    <li>Clean PDF exports for clients</li>
                  </ul>
                  <a href="landing-nav/features#reporting" className="inside-feat-link">See full details &rarr;</a>
                </div>
              </div>
            </div>

            {/* Brand Partners */}
            <div className="inside-feat-panel" data-panel="brand-partners">
              <div className="inside-feat-grid">
                <div className="inside-feat-visual">
                  <div className="inside-feat-visual-icon">★</div>
                  <div className="inside-feat-visual-label">Brand Partners preview coming soon</div>
                </div>
                <div className="inside-feat-text">
                  <div className="inside-feat-eyebrow">Brand Partners</div>
                  <h3>Creators worth more than a campaign.</h3>
                  <p className="inside-feat-lead">Some creators keep delivering, campaign after campaign. Brand Partners gives those relationships structure: tiered status, retainers, full history.</p>
                  <ul className="inside-feat-bullets">
                    <li>Auto tier assignment based on revenue</li>
                    <li>Retainer and recurring deal tracking</li>
                    <li>Full performance history across campaigns</li>
                    <li>Community status: Invited, Joined, Pending</li>
                  </ul>
                  <a href="landing-nav/features#brand-partners" className="inside-feat-link">See full details &rarr;</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section sec-even">
        <div className="container-md">
          <div className="section-header">
            <h2>Get started in minutes.</h2>
            <p>No onboarding call required. No setup fees. Just sign up and go.</p>
          </div>
          <div className="how-grid">
            <div className="how-step">
              <div className="how-num">1</div>
              <h3>Sign up free</h3>
              <p>30 days, full platform, no credit card. Create your workspace in under a minute.</p>
            </div>
            <div className="how-step">
              <div className="how-num">2</div>
              <h3>Import or start fresh</h3>
              <p>Bring your creators in from a spreadsheet, or start adding them from scratch. Your call.</p>
            </div>
            <div className="how-step">
              <div className="how-num">3</div>
              <h3>Run your first campaign</h3>
              <p>Outreach, tracking, and reporting from the same place. See how it feels before you pay a cent.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="section sec-odd">
        <div className="container-md">
          <div className="section-header">
            <h2>Instroom vs. a spreadsheet.</h2>
            <p>If your spreadsheet works, keep using it. But here's what you're trading when you move.</p>
          </div>
          <div className="compare-table">
            <div className="compare-header">
              <div className="compare-header-cell">In a spreadsheet</div>
              <div className="compare-header-cell">In Instroom</div>
            </div>
            {comparisons.map((item, index) => (
              <div key={index} className="compare-row">
                <div className="compare-cell">{item.spreadsheet}</div>
                <div className="compare-cell">
                  <span className="compare-icon">✓</span>{item.instroom}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="section sec-even">
        <div className="container-md">
          <div className="founder-inner">
            <div className="founder-label">A note from our founder</div>
            <h2>Why we built Instroom</h2>
            <div className="founder-body">
              <p>Before Instroom, I ran an influencer marketing agency. And still do.</p>
              <p>Over the years we built a pretty organized system. A clean spreadsheet. Clear processes. A team that knew where everything lived. On paper, it worked.</p>
              <p>Then we scaled. We're now managing 30 brands, each with its own spreadsheet, and it's honestly insane. A spreadsheet can only do so much. We were jumping between six different tools to get one campaign out the door. One app for outreach. Another for tracking posts. Another for payments. Another for reporting to the client. Every tool was fine on its own. Together, they were exhausting.</p>
              <p>So we built Instroom. Not because our system was broken (maybe it is), but because the tools around it were. We wanted one workspace that could hold the whole campaign, from the first DM to the final report, without tabbing through five windows to find one number.</p>
              <p>Not everything is ready yet. We're still building, still improving, still listening to the people using it. But it's getting there, and we'd love for you to come along.</p>
            </div>
            <div className="founder-sign">
              <Image 
                src="/images/CEO.jpg" 
                alt="Armand Mañibo, Founder & CEO" 
                width={64} 
                height={64}
                className="rounded-full border-2 border-[#1FAE5B] flex-shrink-0 object-cover"
              />
              <div>
                <div className="font-hand text-3xl font-bold text-[#0F6B3E] leading-none mb-1">Armand Manibo</div>
                <div className="founder-title">Founder &amp; CEO, Instroom</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STANDALONE */}
      <section className="section sec-odd" id="standalone">
        <div className="container-md">
          <div className="section-header">
            <h2>Not ready for the full workspace? Start with a piece.</h2>
            <p>The Chrome Extension and Post Tracker also work on their own. Use one today, grow into the full platform when you're ready.</p>
          </div>
          <div className="standalone-grid">
            <div className="standalone-card">
              <h3>Chrome Extension</h3>
              <p>Capture creator data while you browse Instagram and TikTok. Free forever, or $9/mo for pro tools.</p>
              <a href="#" className="standalone-link">Learn more →</a>
            </div>
            <div className="standalone-card">
              <h3>Post Tracker</h3>
              <p>Download and archive every piece of creator content, automatically. From $19/mo.</p>
              <a href="#" className="standalone-link">Learn more →</a>
            </div>
          </div>
        </div>
      </section>

      {/* EARLY USERS / TESTIMONIAL PLACEHOLDER */}
      <section className="early sec-even">
        <div className="early-inner">
          <h2>No testimonials yet</h2>
          <p className="early-body">We're not going to make any up. Right now, we are our own testimonials. We use Instroom every day to run our agency across 30 brands, and that's the honest proof that it works.</p>
          <p className="font-hand text-3xl font-semibold text-[#0F6B3E] mb-8 leading-snug">
            Hopefully yours will live here soon.<br />Fingers crossed.
          </p>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-[#0F6B3E] to-[#1FAE5B] text-white font-semibold h-12 px-8 hover:from-[#0a5a2f] hover:to-[#158a48] rounded-xl shadow-lg shadow-emerald-600/20">
              Start free for 30 days
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq sec-odd" id="faq">
        <div className="container-md">
          <div className="section-header">
            <h2>Questions you're probably asking.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${expandedFaq === index ? 'open' : ''}`}
              >
                <button
                  className="faq-q"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span>{faq.q}</span>
                  <span className="faq-q-icon">+</span>
                </button>
                {expandedFaq === index && (
                  <div className="faq-a">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section sec-even" id="pricing">
        <div className="container-md">
          <div className="section-header">
            <h2>Simple pricing. No per-seat games.</h2>
            <p>One workspace. Unlimited team members. No hidden fees.</p>
          </div>
          <div className="pricing-grid">
            {/* Solo */}
            <div className="price-card">
              <div className="price-badge">For solo operators</div>
              <h3>Instroom Solo</h3>
              <p className="price-desc">One workspace. Everything you need to run your program.</p>
              <div className="price-amount">$19<span className="price-unit">/mo</span></div>
              <p className="price-annual">or $15/mo billed annually</p>
              <p className="price-trial">30 days free · No card required</p>
              <Link href="/signup">
                <Button className="w-full rounded-xl border border-zinc-200 bg-white text-zinc-900 font-semibold hover:bg-zinc-50">
                  Start free
                </Button>
              </Link>
            </div>

            {/* Team — featured (dark green) */}
            <div className="price-card featured">
              <div className="price-badge">Most popular</div>
              <h3>Instroom Team</h3>
              <p className="price-desc">Three workspaces included. Built for agencies and growing brands.</p>
              <div className="price-amount">$49<span className="price-unit">/mo</span></div>
              {/* FIX: was color:"#9ca3af" (a broken CSS string value). Now correctly white/translucent */}
              <p className="price-annual">or $39/mo billed annually · +$12/mo per extra workspace</p>
              <p className="price-trial">30 days free · No card required</p>
              <Link href="/signup">
                {/* FIX: white text on green button is clearly readable on the dark card */}
                <Button className="w-full rounded-xl bg-[#1FAE5B] text-white font-semibold hover:bg-[#158a48]">
                  Start free
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-center text-sm text-zinc-500 font-medium" style={{ marginTop: "56px" }}>
            Not sure which is right?{" "}
            <a href="#" className="text-[#1FAE5B] font-semibold hover:underline">Compare plans →</a>
            {" "}or{" "}
            <a href="#" className="text-[#1FAE5B] font-semibold hover:underline">Talk to us →</a>
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container-md final-cta-content">
          <h2>The system is ready. Your next campaign is waiting.</h2>
          <p className="final-cta-lead">Stop building the process. Start running the campaign.</p>
          <div className="hero-ctas">
            <Link href="/signup">
              {/* FIX: was text-black on green gradient — changed to text-white for proper contrast */}
              <Button className="bg-gradient-to-r from-[#1FAE5B] to-[#28c96a] text-white font-semibold h-12 px-8 rounded-xl hover:from-[#158a48] hover:to-[#1FAE5B] shadow-lg shadow-emerald-500/30">
                Start free for 30 days
              </Button>
            </Link>
            {/* FIX: outline button on dark bg now uses white text + visible border */}
            <a href="#faq">
              <Button
                variant="outline"
                className="h-12 px-8 rounded-xl border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 font-semibold"
              >
                Book a demo
              </Button>
            </a>
          </div>
          <p className="final-cta-sub">No credit card required · No annual contracts · Cancel anytime</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <Image
              src="/images/instroomLogoWhite.png"
              alt="Instroom logo"
              width={120}
              height={120}
              style={{ marginBottom: "12px" }}
            />
            <p style={{ color: "rgba(255,255,255,0.55)", maxWidth: "260px", fontSize: "0.875rem", lineHeight: 1.65 }}>
              The influencer marketing workspace for eCommerce brands and agencies.
            </p>
          </div>
          <div>
            <h4>Products</h4>
            <ul>
              <li><a href="#">Instroom Platform</a></li>
              <li><a href="#">Chrome Extension</a></li>
              <li><a href="#">Post Tracker</a></li>
              <li><a href="#">Features</a></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Blog</a></li>
              <li><a href="#">FAQ's</a></li>
              <li><a href="#">Demo</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Instroom. All rights reserved.</p>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/terms-of-service" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/refund" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}