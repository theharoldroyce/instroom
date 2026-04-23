"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { MainHeader } from "@/components/main-header"

export function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

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
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#1E1E1E", background: "#FFFFFF" }}>
      <style jsx>{`
        :root {
          --green: #1FAE5B;
          --deep-green: #0F6B3E;
          --charcoal: #1E1E1E;
          --off-white: #F7F9F8;
          --blue: #2C8EC4;
          --border: rgba(30,30,30,0.08);
          --muted: #9ca3af;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 0.5px solid var(--border);
          padding: 14px 24px;
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1140px;
          margin: 0 auto;
          gap: 24px;
        }

        .nav-links {
          display: flex;
          gap: 32px;
          align-items: center;
          list-style: none;
        }

        .nav-links a {
          color: var(--charcoal);
          font-size: 0.9375rem;
          font-weight: 500;
          text-decoration: none;
        }

        .nav-links a:hover {
          color: var(--green);
        }

        .nav-cta {
          display: flex;
          gap: 18px;
          align-items: center;
        }

        .hero {
          padding: 80px 0 60px;
          text-align: center;
          background: var(--off-white);
        }

        .container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .hero h1 {
          max-width: 880px;
          margin: 0 auto 24px;
          font-size: clamp(2rem, 5vw, 3.75rem);
          font-weight: 800;
          font-family: 'Manrope', sans-serif;
        }

        .hero-lead {
          max-width: 680px;
          margin: 0 auto 32px;
          font-size: 1.1875rem;
          color: #3F3F46;
        }

        .lead {
          font-size: 1.125rem;
          color: #3F3F46;
        }

        .hero-ctas {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .hero-sub {
          font-size: 0.875rem;
          color: var(--muted);
        }

        .hero-mockup {
          max-width: 980px;
          margin: 56px auto 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(15, 107, 62, 0.12);
          border: 0.5px solid var(--border);
          background: white;
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          font-size: 0.875rem;
        }

        .stats {
          padding: 56px 0 40px;
          background: white;
          text-align: center;
        }

        .stats-row {
          display: flex;
          justify-content: center;
          align-items: baseline;
          gap: 48px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-num {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(1.75rem, 3.5vw, 2.25rem);
          font-weight: 800;
          color: var(--green);
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-label {
          font-size: 0.8125rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 500;
        }

        .trust {
          padding: 32px 0 56px;
          background: white;
          border-bottom: 0.5px solid var(--border);
        }

        .trust-label {
          text-align: center;
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--muted);
          margin-bottom: 28px;
        }

        .trust-logos {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 32px;
          align-items: center;
          opacity: 0.7;
          justify-items: center;
        }

        .trust-logo {
          height: 36px;
          background: rgba(30,30,30,0.04);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          color: var(--muted);
          font-weight: 500;
        }

        .problem-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 56px;
        }

        .problem-card {
          background: var(--off-white);
          border-radius: 14px;
          padding: 32px;
          border: 0.5px solid var(--border);
        }

        .problem-card h3 {
          color: var(--deep-green);
          margin-bottom: 12px;
          font-size: 1.125rem;
          font-family: 'Manrope', sans-serif;
        }

        .problem-card p {
          color: #3F3F46;
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .outcomes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 56px;
        }

        .outcome {
          background: white;
          border: 0.5px solid var(--border);
          border-radius: 16px;
          padding: 32px;
          display: flex;
          flex-direction: column;
        }

        .outcome-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--muted);
          margin-bottom: 12px;
        }

        .outcome-problem {
          font-size: 0.9375rem;
          color: var(--muted);
          text-decoration: line-through;
          margin-bottom: 16px;
        }

        .outcome h3 {
          color: var(--deep-green);
          margin-bottom: 12px;
          font-size: 1.1875rem;
          font-family: 'Manrope', sans-serif;
        }

        .outcome p {
          color: #3F3F46;
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .inside-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          margin-bottom: 96px;
        }

        .inside-row.reverse {
          direction: rtl;
        }

        .inside-row.reverse > * {
          direction: ltr;
        }

        .inside-eyebrow {
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--green);
          margin-bottom: 12px;
        }

        .inside-text h3 {
          font-size: clamp(1.5rem, 2.5vw, 1.875rem);
          margin-bottom: 16px;
          color: var(--charcoal);
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
        }

        .inside-text p {
          font-size: 1.0625rem;
          line-height: 1.7;
          color: #3F3F46;
          margin-bottom: 20px;
        }

        .inside-link {
          font-weight: 600;
          color: var(--green);
          text-decoration: none;
        }

        .inside-link:hover {
          text-decoration: underline;
        }

        .inside-visual {
          aspect-ratio: 4 / 3;
          background: linear-gradient(135deg, #EEF4F0 0%, #E1EDE5 100%);
          border-radius: 16px;
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          font-size: 0.875rem;
          overflow: hidden;
          position: relative;
        }

        .inside-visual-placeholder {
          text-align: center;
          padding: 24px;
          color: var(--deep-green);
          font-weight: 500;
        }

        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          max-width: 960px;
          margin: 0 auto;
          margin-top: 56px;
        }

        .how-step {
          text-align: center;
          padding: 24px;
        }

        .how-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--green);
          color: white;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
          margin-bottom: 20px;
        }

        .how-step h3 {
          margin-bottom: 10px;
          color: var(--deep-green);
          font-family: 'Manrope', sans-serif;
        }

        .how-step p {
          color: #3F3F46;
          font-size: 0.9375rem;
        }

        .compare-table {
          max-width: 900px;
          margin: 0 auto;
          border-radius: 16px;
          overflow: hidden;
          border: 0.5px solid var(--border);
          margin-top: 56px;
        }

        .compare-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--off-white);
          border-bottom: 0.5px solid var(--border);
        }

        .compare-header-cell {
          padding: 20px 28px;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 1rem;
        }

        .compare-header-cell:first-child {
          color: var(--muted);
        }

        .compare-header-cell:last-child {
          color: var(--deep-green);
          border-left: 0.5px solid var(--border);
        }

        .compare-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 0.5px solid var(--border);
        }

        .compare-row:last-child {
          border-bottom: none;
        }

        .compare-cell {
          padding: 18px 28px;
          font-size: 0.9375rem;
          color: var(--charcoal);
        }

        .compare-row > .compare-cell:first-child {
          color: var(--muted);
          background: white;
        }

        .compare-row > .compare-cell:last-child {
          color: var(--charcoal);
          font-weight: 500;
          border-left: 0.5px solid var(--border);
          background: rgba(31, 174, 91, 0.03);
        }

        .compare-icon {
          display: inline-block;
          margin-right: 8px;
          color: var(--green);
          font-weight: 700;
        }

        .founder-inner {
          max-width: 720px;
          margin: 0 auto;
          background: white;
          padding: 56px;
          border-radius: 20px;
          border: 0.5px solid var(--border);
          box-shadow: 0 8px 32px rgba(15, 107, 62, 0.04);
        }

        .founder-label {
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--green);
          margin-bottom: 16px;
        }

        .founder-inner h2 {
          font-size: 1.75rem;
          margin-bottom: 32px;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
        }

        .founder-body p {
          font-size: 1.0625rem;
          line-height: 1.75;
          color: #3F3F46;
          margin-bottom: 20px;
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
        }

        .founder-title {
          font-size: 0.875rem;
          color: var(--muted);
        }

        .standalone-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 820px;
          margin: 0 auto;
          margin-top: 56px;
        }

        .standalone-card {
          background: white;
          border: 0.5px solid var(--border);
          border-radius: 16px;
          padding: 32px;
        }

        .standalone-card h3 {
          margin-bottom: 12px;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
        }

        .standalone-card p {
          color: #3F3F46;
          margin-bottom: 20px;
          font-size: 0.9375rem;
        }

        .standalone-link {
          font-weight: 600;
          color: var(--green);
        }

        .early {
          background: linear-gradient(135deg, #EEF4F0 0%, #E1EDE5 100%);
          text-align: center;
          padding: 80px 0;
        }

        .early-inner {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .early h2 {
          margin-bottom: 24px;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
        }

        .early-body {
          font-size: 1.0625rem;
          color: #3F3F46;
          margin-bottom: 20px;
        }

        .faq {
          padding: 96px 0;
          background: white;
        }

        .faq-list {
          max-width: 780px;
          margin: 0 auto;
          margin-top: 56px;
        }

        .faq-item {
          border-bottom: 0.5px solid var(--border);
          padding: 24px 0;
        }

        .faq-item:first-child {
          padding-top: 0;
        }

        .faq-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .faq-q {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          cursor: pointer;
          font-family: 'Manrope', sans-serif;
          font-size: 1.0625rem;
          font-weight: 600;
          color: var(--charcoal);
          gap: 24px;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
        }

        .faq-q:hover {
          color: var(--green);
        }

        .faq-q-icon {
          color: var(--green);
          font-size: 1.25rem;
          font-weight: 700;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .faq-item.open .faq-q-icon {
          transform: rotate(45deg);
        }

        .faq-a {
          margin-top: 14px;
          color: #3F3F46;
          font-size: 0.9375rem;
          line-height: 1.7;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 24px;
          max-width: 820px;
          margin: 0 auto;
          align-items: center;
          margin-top: 56px;
        }

        .price-card {
          background: white;
          border: 0.5px solid var(--border);
          border-radius: 16px;
          padding: 36px 32px;
          position: relative;
        }

        .price-card.featured {
          background: var(--deep-green);
          color: white;
          border: none;
          box-shadow: 0 16px 40px rgba(15, 107, 62, 0.2);
          transform: scale(1.03);
        }

        .price-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(31, 174, 91, 0.12);
          color: var(--green);
          margin-bottom: 16px;
        }

        .featured .price-badge {
          background: var(--green);
          color: white;
        }

        .price-card h3 {
          margin-bottom: 8px;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
        }

        .featured h3 {
          color: white;
        }

        .price-desc {
          font-size: 0.9375rem;
          margin-bottom: 24px;
          color: #3F3F46;
        }

        .featured .price-desc {
          color: rgba(255, 255, 255, 0.85);
        }

        .price-amount {
          font-family: 'Manrope', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: var(--charcoal);
          margin-bottom: 4px;
        }

        .featured .price-amount {
          color: white;
        }

        .price-unit {
          font-size: 1rem;
          font-weight: 500;
          color: var(--muted);
        }

        .featured .price-unit {
          color: rgba(255, 255, 255, 0.75);
        }

        .price-annual {
          font-size: 0.8125rem;
          color: var(--muted);
          margin-bottom: 16px;
        }

        .featured .price-annual {
          color:"#9ca3af";
        }

        .price-trial {
          font-size: 0.8125rem;
          color: var(--muted);
          margin-bottom: 24px;
        }

        .featured .price-trial {
          color: rgba(255, 255, 255, 0.75);
        }

        .pricing-help {
          text-align: center;
          margin-top: 32px;
          font-size: 0.9375rem;
          color: var(--muted);
        }

        .btn-featured {
          background: var(--green);
          color: white;
          width: 100%;
        }

        .btn-featured:hover {
          background: #1a9a50;
          color: white;
        }

        .btn-plain {
          background: white;
          color: var(--charcoal);
          border: 1px solid rgba(30, 30, 30, 0.15);
          width: 100%;
        }

        .final-cta {
          background: var(--charcoal);
          color: white;
          text-align: center;
          padding: 96px 0;
        }

        .final-cta h2 {
          color: white;
          max-width: 760px;
          margin: 0 auto 16px;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
        }

        .final-cta-lead {
          font-size: 1.0625rem;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 32px;
        }

        .final-cta-sub {
          margin-top: 20px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .footer {
          background: #111;
          color: rgba(255, 255, 255, 0.7);
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
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 16px;
          font-family: 'Manrope', sans-serif;
          font-weight: 600;
        }

        .footer ul {
          list-style: none;
        }

        .footer li {
          margin-bottom: 8px;
        }

        .footer a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
        }

        .footer a:hover {
          color: white;
        }

        .footer-bottom {
          padding: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
          flex-wrap: wrap;
          gap: 12px;
          max-width: 1140px;
          margin: 0 auto;
        }

        .section {
          padding: 96px 0;
        }

        .section-header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 56px;
        }

        .section-header h2 {
          margin-bottom: 16px;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
        }

        .section-header p {
          font-size: 1.125rem;
          color: #3F3F46;
        }

        .section-alt {
          background: var(--off-white);
        }

        @media (max-width: 900px) {
          .nav-links,
          .nav-text-link {
            display: none;
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
          }

          .compare-header,
          .compare-row {
            grid-template-columns: 1fr;
          }

          .compare-header-cell:last-child,
          .compare-cell:last-child {
            border-left: none;
            border-top: 0.5px solid var(--border);
          }

          .footer-inner {
            grid-template-columns: 1fr 1fr;
          }

          .price-card.featured {
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 60px 0 40px;
          }

          .stats-row {
            gap: 32px;
          }

          .trust-logos {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }
      `}</style>

      {/* NAV */}
      <MainHeader />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <h1>Influencer marketing isn't complicated. Managing it without the right system is.</h1>
          <p className="hero-lead">Instroom is the system. Every creator, every campaign, every result, in one workspace. Built by people who've done the work.</p>
          <div className="hero-ctas">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-[#0F6B3E] to-[#1FAE5B] text-white font-semibold h-12 px-8 hover:from-[#0a5a2f] hover:to-[#158a48] shadow-lg shadow-emerald-500/30">
                Start Free Trial
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" className="h-12 px-8 border-emerald-300/30 bg-black/20 text-zinc-100 hover:bg-emerald-500/10 hover:text-emerald-300">
                Learn More
              </Button>
            </a>
          </div>
          <p className="hero-sub">No credit card required.</p>
          <div className="hero-mockup">[Product screenshot / dashboard hero image]</div>
        </div>
      </section>


{/* STATS */}
      <section className="stats">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="stats-row" style={{ display: "flex", justifyContent: "center", gap: 80 }}>
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
          <p style={{ fontSize: "0.8125rem", color: "#9ca3af", fontStyle: "italic", marginTop: 16 }}>Approximate totals across the brands we've worked with.</p>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust">
        <div className="container" style={{ textAlign: "center" }}>
          <p className="trust-label" style={{ textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.08em", fontSize: "0.8125rem", marginBottom: 24 }}>Brands we've managed campaigns for</p>
          <div className="trust-logos" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="trust-logo"><Image src="/images/instroomLogo.png" alt="Brand 1" width={100} height={36} /></div>
            <div className="trust-logo"><Image src="/images/instroomLogo.png" alt="Brand 2" width={100} height={36} /></div>
            <div className="trust-logo"><Image src="/images/instroomLogo.png" alt="Brand 3" width={100} height={36} /></div>
            <div className="trust-logo"><Image src="/images/instroomLogo.png" alt="Brand 4" width={100} height={36} /></div>
            <div className="trust-logo"><Image src="/images/instroomLogo.png" alt="Brand 5" width={100} height={36} /></div>
            <div className="trust-logo"><Image src="/images/instroomLogo.png" alt="Brand 6" width={100} height={36} /></div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: "96px 0", background: "white" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 56px" }}>
            <h2 style={{ marginBottom: "20px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}>You didn't start your brand to live in a spreadsheet.</h2>
            <p style={{ fontSize: "1.125rem", color: "#3F3F46" }}>But here you are. Multiple tabs. Multiple tools. A nagging feeling that you're paying creators and hoping it's working.</p>
          </div>
          <div className="problem-cards">
            {problems.map((problem, index) => (
              <div key={index} className="problem-card">
                <h3>{problem.title}</h3>
                <p>{problem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>Here's what changes with Instroom.</h2>
          </div>
          <div className="outcomes-grid">
            {outcomes.map((outcome, index) => (
              <div key={index} className="outcome">
                <div className="outcome-label">{outcome.label}</div>
                <div className="outcome-problem">{outcome.problem}</div>
                <h3>{outcome.solution}</h3>
                <p>{outcome.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section style={{ padding: "96px 0", background: "white" }}>
        <div className="container">
          <div className="section-header">
            <h2>What's inside</h2>
            <p className="lead">A closer look at the parts you'll actually use every day.</p>
          </div>

          {features.map((feature, index) => (
            <div key={index} className={`inside-row ${index % 2 === 1 ? 'reverse' : ''}`}>
              <div className="inside-text">
                <div className="inside-eyebrow">{feature.eyebrow}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <a href={feature.link} className="inside-link">Learn more →</a>
              </div>
              <div className="inside-visual">
                <div className="inside-visual-placeholder">[Feature screenshot]</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section-alt">
        <div className="container">
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
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <div className="section-header">
            <h2>Instroom vs. a spreadsheet.</h2>
            <p style={{ fontSize: "1.125rem", color: "#3F3F46" }}>If your spreadsheet works, keep using it. But here's what you're trading when you move.</p>
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
      <section style={{ background: "linear-gradient(180deg, var(--off-white) 0%, #EEF4F0 100%)", padding: "96px 0" }}>
        <div className="container">
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
              <div className="founder-avatar">
                <div style={{ width: "100%", height: "100%", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Avatar</div>
              </div>
              <div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "2rem", fontWeight: 700, color: "var(--deep-green)", lineHeight: 1, marginBottom: "4px" }}>Armand Manibo</div>
                <div className="founder-title">Founder & CEO, Instroom</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STANDALONE */}
      <section className="section section-alt" id="standalone">
        <div className="container">
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

      {/* EARLY USERS */}
      <section className="early">
        <div className="early-inner">
          <h2>No testimonials yet</h2>
          <p className="early-body">We're not going to make any up. Right now, we are our own testimonials. We use Instroom every day to run our agency across 30 brands, and that's the honest proof that it works.</p>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.75rem", color: "var(--deep-green)", fontWeight: 600, marginBottom: "32px", lineHeight: 1.3 }}>Hopefully yours will live here soon.<br />Fingers crossed.</p>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-[#0F6B3E] to-[#1FAE5B] text-white font-semibold h-12 px-8 hover:from-[#0a5a2f] hover:to-[#158a48]">
              Start free for 30 days
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="container">
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
      <section className="section section-alt" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Simple pricing. No per-seat games.</h2>
            <p>One workspace. Unlimited team members. No hidden fees.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="price-badge">For solo operators</div>
              <h3>Instroom Solo</h3>
              <p className="price-desc">One workspace. Everything you need to run your program.</p>
              <div className="price-amount">$19<span className="price-unit">/mo</span></div>
              <p className="price-annual">or $15/mo billed annually</p>
              <p className="price-trial">30 days free · No card</p>
              <Link href="/signup">
                <Button className="w-full bg-gradient-to-r from-[#0F6B3E] to-[#1FAE5B] text-white font-semibold hover:from-[#0a5a2f] hover:to-[#158a48]">
                  Start free
                </Button>
              </Link>
            </div>
            <div className="price-card featured">
              <div className="price-badge">Most popular</div>
              <h3>Instroom Team</h3>
              <p className="price-desc">Three workspaces included. Built for agencies and growing brands.</p>
              <div className="price-amount">$49<span className="price-unit">/mo</span></div>
              <p className="price-annual">or $39/mo billed annually · +$12/mo per extra workspace</p>
              <p className="price-trial">30 days free · No card</p>
              <Link href="/signup">
                <Button className="w-full bg-[#1FAE5B] text-white font-semibold hover:bg-[#158a48]">
                  Start free
                </Button>
              </Link>
            </div>
          </div>
          <p style={{ textAlign: "center", marginTop: "32px", fontSize: "0.9375rem", color: "var(--muted)" }}>
            Not sure which is right? <a href="#" style={{ color: "var(--green)", fontWeight: 600 }}>Compare plans →</a> or <a href="#" style={{ color: "var(--green)", fontWeight: 600 }}>Talk to us →</a>
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>The system is ready. Your next campaign is waiting.</h2>
          <p className="final-cta-lead">Stop building the process. Start running the campaign.</p>
          <div className="hero-ctas">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-[#0F6B3E] to-[#1FAE5B] text-black font-semibold h-12 px-8 hover:from-emerald-400 hover:to-lime-300 shadow-lg shadow-emerald-500/50">
                Start free for 30 days
              </Button>
            </Link>
            <a href="#faq">
              <Button variant="outline" className="h-12 px-8 border-emerald-300/30 text-white hover:bg-emerald-500/10 hover:text-emerald-300">
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
              width={128}
              height={128}
              style={{ marginBottom: "12px" }}
            />
            <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: "280px", fontSize: "0.875rem" }}>
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
            <Link href="/terms-of-service" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/refund" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
