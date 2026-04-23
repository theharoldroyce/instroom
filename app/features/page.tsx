"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainHeader } from "@/components/main-header"

export default function FeaturesPage() {
  return (
    <div className="features-page">
      {/* Navigation */}
      <MainHeader />

      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="container">
        <p className="eyebrow" style={{ color: "green" }}>What's Inside</p>
          <h1>Five tools that replace the stack.</h1>
          <p className="lead">Pipeline management, embedded email, creator CRM, reporting, and Brand Partners. One workspace, built for how you actually run campaigns.</p>
        </div>
      </section>

      {/* JUMP NAV */}
      <div className="jumpnav">
        <div className="container jumpnav-inner">
          <a href="#pipeline">Pipeline</a>
          <a href="#email">Email</a>
          <a href="#crm">Creator CRM</a>
          <a href="#reporting">Reporting</a>
          <a href="#brand-partners">Brand Partners</a>
        </div>
      </div>

      {/* FEATURE 1: PIPELINE */}
      <section className="feat" id="pipeline">
        <div className="container">
          <div className="feat-grid">
            <div className="feat-text">
              <p className="feat-label">Feature 01 - Pipeline Management</p>
              <h2>Work the way you want. List, board, or both.</h2>
              <p className="feat-lead">The same data in two views. See everything at a glance in a Kanban board, or scan fast in a spreadsheet view. Switch between them in a single click.</p>
              <div className="feat-body">
                <p>Every campaign comes with pre-built pipeline stages: prospect, reached out, negotiating, confirmed, posted, paid. Customize them or use them as-is. No more setting up a new tracker for every campaign.</p>
                <p>The list view feels exactly like the spreadsheet you already love, because it works. The board view gives you the visual read on where things stand. Same data, same updates, two perspectives.</p>
                <ul className="feat-bullets">
                    <li>Pre-built pipeline stages per campaign type</li>
                    <li>Switch between List and Kanban with one click</li>
                    <li>Drag and drop creators between stages</li>
                    <li>Custom fields for deliverables, fees, deadlines</li>
                    <li>Bulk actions: update, assign, or move in one move</li>
                </ul>
              </div>
            </div>
            <div className="feat-visual">
              <div className="feat-visual-icon">📊</div>
              <p className="feat-visual-label">Pipeline Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 2: EMAIL */}
      <section className="feat reverse" id="email">
        <div className="container">
          <div className="feat-grid">
            <div className="feat-text">
              <p className="feat-label">Feature 02 - Embedded Email</p>
              <h2>Reach out, reply, and track without leaving Instroom.</h2>
              <p className="feat-lead">Your inbox lives inside the workspace. Every email is auto-tagged to the right campaign and pipeline stage, so context never gets lost.</p>
              <div className="feat-body">
                <p>When a creator responds at 11pm and your teammate picks it up at 9am, they have the full thread, the campaign, and the creator's history already loaded. No forwarding. No "wait, which one is this?" No copy-pasting into a spreadsheet after the fact.</p>
                <p>Replies update the pipeline stage automatically. Follow-up reminders live alongside the conversation. Email templates pull creator details so every outreach feels personal without writing every word.</p>
                <ul className="feat-bullets">
                    <li>Connect Gmail or Outlook in one click</li>
                    <li>Every email auto-tagged to campaign and stage</li>
                    <li>Personalized templates with creator variables</li>
                    <li>Follow-up reminders tied to the conversation</li>
                    <li>Full thread history visible on every creator profile</li>
                </ul>
              </div>
            </div>
            <div className="feat-visual">
              <div className="feat-visual-icon">✉️</div>
              <p className="feat-visual-label">Email Interface</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 3: CREATOR CRM */}
      <section className="feat" id="crm">
        <div className="container">
          <div className="feat-grid">
            <div className="feat-text">
              <p className="feat-label">Feature 03 -  Creator CRM</p>
              <h2>Profiles that remember everything.</h2>
              <p className="feat-lead">Every campaign, every post, every payment, every conversation. When you come back to a creator six months later, the full history is waiting.</p>
              <div className="feat-body">
                <p>Stop rebuilding context every time you reach out. A creator's profile shows you what you've done together, what worked, and what's next. The conversation from March, the product gifting in June, the post that drove 40 sales in September, all in one place.</p>
                <p>Tags, notes, custom fields, and a shared team view mean your whole team sees the same creator the same way. No more "wait, who was handling this relationship?"</p>
                <ul className="feat-bullets">
                    <li>Full campaign and content history per creator</li>
                    <li>Payment and deal history attached to the profile</li>
                    <li>Tags, custom fields, and internal notes</li>
                    <li>Shared across your team with role-based access</li>
                    <li>Quick search across your entire creator database</li>
                </ul>
              </div>
            </div>
            <div className="feat-visual">
              <div className="feat-visual-icon">👥</div>
              <p className="feat-visual-label">Creator Database</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 4: REPORTING */}
      <section className="feat reverse" id="reporting">
        <div className="container">
          <div className="feat-grid">
            <div className="feat-text">
              <p className="feat-label">Feature 04 - Reporting & Analytics</p>
              <h2>Client-ready reports, one click away.</h2>
              <p className="feat-lead">Stop building reports the night before a client call. Pull performance by creator, by campaign, or by deliverable. Export clean PDFs or share a live link.</p>
              <div className="feat-body">
                <p>The data was already in Instroom. Now it's presentable. Campaign summaries, creator performance breakdowns, spend vs. return, content posted, and engagement metrics, all in a format a client can actually read.</p>
                <p>Share a live link that updates as the campaign progresses, or export a final PDF when everything's wrapped. Either way, you stop screenshotting and copy-pasting.</p>
                <ul className="feat-bullets">
                    <li>One-click campaign summary reports</li>
                    <li>Per-creator performance breakdowns</li>
                    <li>Live-updating shareable links</li>
                    <li>Clean PDF exports for final deliverables</li>
                    <li>Custom date ranges and filters</li>
                </ul>
              </div>
            </div>
            <div className="feat-visual">
              <div className="feat-visual-icon">📈</div>
              <p className="feat-visual-label">Analytics Dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 5: BRAND PARTNERS */}
      <section className="feat" id="brand-partners">
        <div className="container">
          <div className="feat-grid">
            <div className="feat-text">
              <p className="feat-label">Feature 05 - Brand Partners</p>
              <h2>Creators worth more than a campaign.</h2>
              <p className="feat-lead">Some creators keep delivering, campaign after campaign. Brand Partners gives those relationships structure: tiered status, retainer tracking, and full performance history.</p>
              <div className="feat-body">
                <p>Set your revenue thresholds. Instroom assigns Bronze, Silver, and Gold tiers automatically as creators hit milestones. No manual updating, no missed promotions, just a tier list that reflects reality.</p>
                <p>When the budget conversation comes up, the answer is already in the data. You know exactly who's making you money, who's consistent, and who deserves a retainer. The best influencer programs aren't built on campaigns. They're built on relationships.</p>
                <ul className="feat-bullets">
                  <li>Client workspace access</li>
                  <li>Permission levels</li>
                  <li>Real-time updates</li>
                  <li>White-labeling ready</li>
                </ul>
              </div>
            </div>
            <div className="feat-visual">
              <div className="feat-visual-icon">🤝</div>
              <p className="feat-visual-label">Brand Portal</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>See it for yourself.</h2>
          <p className="final-cta-lead">30 days free. Full platform access. No credit card.</p>
          <div className="final-cta-ctas">
            <Button className="btn-primary btn-large">Start Free Trial</Button>
          </div>
          <p className="final-cta-sub">No annual contracts · Cancel anytime</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <span style={{ fontSize: "1.125rem", fontWeight: "bold", marginBottom: "12px" }}>Instroom</span>
              <p>The all-in-one platform for running influencer marketing campaigns.</p>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="/features">Features</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/dashboard">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Instroom. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        :root {
          --green: #1FAE5B;
          --deep-green: #0F6B3E;
          --charcoal: #1E1E1E;
          --off-white: #F7F9F8;
          --blue: #2C8EC4;
          --amber: #F4B740;
          --border: rgba(30, 30, 30, 0.08);
          --muted: #6B7280;
        }

        .features-page {
          background: white;
          color: var(--charcoal);
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 0.5px solid var(--border);
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          max-width: 1140px;
          margin: 0 auto;
          gap: 24px;
        }

        .logo-link {
          text-decoration: none;
          color: var(--charcoal);
          font-weight: bold;
        }

        .nav-links {
          display: flex;
          gap: 32px;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-links li {
          position: relative;
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

        .nav-active {
          color: var(--green) !important;
        }

        .nav-cta {
          display: flex;
          gap: 18px;
          align-items: center;
        }

        @media (max-width: 900px) {
          .nav-links,
          .nav-cta {
            display: none;
          }
        }

        /* PAGE HERO */
        .page-hero {
          padding: 80px 0 60px;
          text-align: center;
          background: var(--off-white);
        }

        .eyebrow {
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--green);
          margin-bottom: 16px;
          display: block;
        }

        .page-hero h1 {
          max-width: 800px;
          margin: 0 auto 20px;
          font-family: 'Manrope', sans-serif;
          font-size: clamp(2.25rem, 5vw, 3.75rem);
          font-weight: 800;
        }

        .page-hero .lead {
          max-width: 640px;
          margin: 0 auto;
          font-size: 1.1875rem;
          color: #3F3F46;
        }

        /* JUMP NAV */
        .jumpnav {
          position: sticky;
          top: 65px;
          z-index: 50;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 0.5px solid var(--border);
          padding: 14px 0;
        }

        .jumpnav-inner {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .jumpnav a {
          color: var(--charcoal);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
        }

        .jumpnav a:hover {
          color: var(--green);
        }

        @media (max-width: 768px) {
          .jumpnav-inner {
            gap: 18px;
          }
          .jumpnav a {
            font-size: 0.8125rem;
          }
        }

        /* FEATURE BLOCKS */
        .feat {
          padding: 96px 0;
          scroll-margin-top: 140px;
        }

        .feat:nth-child(even) {
          background: var(--off-white);
        }

        .feat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }

        .feat.reverse .feat-grid {
          direction: rtl;
        }

        .feat.reverse .feat-grid > * {
          direction: ltr;
        }

        @media (max-width: 900px) {
          .feat-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .feat.reverse .feat-grid {
            direction: ltr;
          }
        }

        .feat-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--green);
          margin-bottom: 14px;
        }

        .feat-text h2 {
          font-size: clamp(1.75rem, 3vw, 2.25rem);
          margin-bottom: 18px;
          color: var(--charcoal);
          font-family: 'Manrope', sans-serif;
        }

        .feat-lead {
          font-size: 1.1875rem;
          color: #3F3F46;
          line-height: 1.6;
          margin-bottom: 28px;
          font-weight: 500;
        }

        .feat-body p {
          color: #3F3F46;
          margin-bottom: 18px;
          line-height: 1.7;
          font-size: 1rem;
        }

        .feat-bullets {
          list-style: none;
          padding: 0;
          margin: 24px 0 0;
        }

        .feat-bullets li {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
          color: #3F3F46;
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .feat-bullets li::before {
          content: "✓";
          color: var(--green);
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feat-visual {
          background: linear-gradient(135deg, var(--off-white) 0%, #EEF4F0 100%);
          border: 0.5px solid var(--border);
          border-radius: 18px;
          aspect-ratio: 4 / 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 32px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(15, 107, 62, 0.04);
        }

        .feat.reverse .feat-visual,
        .feat:nth-child(even) .feat-visual {
          background: linear-gradient(135deg, white 0%, var(--off-white) 100%);
        }

        .feat-visual-icon {
          width: 72px;
          height: 72px;
          border-radius: 18px;
          background: var(--green);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
        }

        .feat-visual-label {
          font-size: 0.8125rem;
          color: var(--muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 8px;
        }

        /* FINAL CTA */
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
        }

        .final-cta-lead {
          font-size: 1.0625rem;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 32px;
        }

        .final-cta-ctas {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .final-cta-sub {
          margin-top: 20px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        /* FOOTER */
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

        @media (max-width: 768px) {
          .footer-inner {
            grid-template-columns: 1fr 1fr;
          }
        }

        .footer h4 {
          color: white;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 16px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
        }

        .footer ul {
          list-style: none;
          margin: 0;
          padding: 0;
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

        .footer-brand p {
          color: rgba(255, 255, 255, 0.6);
          max-width: 280px;
          font-size: 0.875rem;
        }

        .footer-bottom {
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
          flex-wrap: wrap;
          gap: 12px;
          max-width: 1140px;
          margin-left: auto;
          margin-right: auto;
          padding: 24px 24px 0;
        }

        .footer-legal {
          display: flex;
          gap: 24px;
        }

        .footer-legal a {
          color: rgba(255, 255, 255, 0.6);
        }

        .footer-legal a:hover {
          color: white;
        }

        .btn-primary {
          background: var(--green);
          color: white;
          padding: 12px 22px;
          border-radius: 10px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-size: 0.9375rem;
        }

        .btn-primary:hover {
          background: #1a9a50;
        }

        .btn-large {
          padding: 14px 28px;
          font-size: 1rem;
        }

        .container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }
      `}</style>
    </div>
  )
}
