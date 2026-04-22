"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --green-deep: #0d2b1a;
    --green-mid: #1a4a2e;
    --green-brand: #2d7a4f;
    --green-bright: #3dbd72;
    --green-light: #a8e6c1;
    --cream: #f5f0e8;
    --text-main: #1a1a1a;
    --text-muted: #5a6b5e;
    --border: #d4e8db;
    --white: #ffffff;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pp-body {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--text-main);
    font-size: 16px;
    line-height: 1.75;
  }

  .pp-topbar {
    background: var(--green-deep);
    padding: 0 48px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid #1f3d28;
  }
  .pp-logo {
    display: flex; align-items: center; gap: 10px; text-decoration: none; cursor: pointer;
  }
  .pp-logo-icon {
    width: 36px; height: 36px;
    border: 2.5px solid var(--green-bright);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    color: var(--green-bright);
    font-size: 18px;
  }
  .pp-logo-text {
    font-weight: 600; font-size: 18px; color: var(--white); letter-spacing: -0.3px;
  }
  .pp-doc-label {
    font-size: 12px; font-weight: 500; color: var(--green-light);
    letter-spacing: 0.08em; text-transform: uppercase;
    background: rgba(61,189,114,0.12); padding: 4px 12px;
    border-radius: 20px; border: 1px solid rgba(61,189,114,0.25);
  }

  .pp-hero {
    background: var(--green-deep);
    padding: 72px 48px 64px;
    position: relative; overflow: hidden;
  }
  .pp-hero::before {
    content: ''; position: absolute; top: -60px; right: -60px;
    width: 320px; height: 320px; border-radius: 50%;
    border: 1px solid rgba(61,189,114,0.08);
  }
  .pp-hero::after {
    content: ''; position: absolute; top: 20px; right: 40px;
    width: 180px; height: 180px; border-radius: 50%;
    border: 1px solid rgba(61,189,114,0.12);
  }
  .pp-hero-inner { max-width: 760px; position: relative; z-index: 1; }
  .pp-hero-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--green-bright); margin-bottom: 16px;
  }
  .pp-hero h1 {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(36px, 5vw, 54px);
    font-weight: 400; color: var(--white);
    line-height: 1.1; margin-bottom: 20px; letter-spacing: -0.5px;
  }
  .pp-hero h1 em { color: var(--green-bright); font-style: italic; }
  .pp-hero-meta { display: flex; gap: 24px; flex-wrap: wrap; }
  .pp-meta-item { font-size: 13px; color: rgba(255,255,255,0.5); }
  .pp-meta-item strong { color: rgba(255,255,255,0.85); font-weight: 500; }

  .pp-dpa-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(61,189,114,0.15); border: 1px solid rgba(61,189,114,0.3);
    border-radius: 8px; padding: 10px 16px; margin-top: 24px;
  }
  .pp-dpa-badge-icon { font-size: 18px; }
  .pp-dpa-badge-text { font-size: 13px; color: var(--green-light); font-weight: 400; }
  .pp-dpa-badge-text strong { color: var(--green-bright); }

  .pp-layout {
    max-width: 1100px; margin: 0 auto;
    padding: 60px 48px 80px;
    display: grid; grid-template-columns: 220px 1fr;
    gap: 64px; align-items: start;
  }

  .pp-toc { position: sticky; top: 88px; }
  .pp-toc-title {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
  }
  .pp-toc ol { list-style: none; display: flex; flex-direction: column; gap: 2px; padding-left: 0; }
  .pp-toc ol li a {
    display: block; font-size: 13px; font-weight: 400;
    color: var(--text-muted); text-decoration: none;
    padding: 6px 10px; border-radius: 6px;
    border-left: 2px solid transparent; transition: all 0.15s; line-height: 1.4;
  }
  .pp-toc ol li a:hover {
    color: var(--green-brand); background: rgba(45,122,79,0.06);
    border-left-color: var(--green-brand);
  }
  .pp-toc ol li a.active {
    color: var(--green-brand); background: rgba(45,122,79,0.06);
    border-left-color: var(--green-brand);
  }

  .pp-content section {
    margin-bottom: 52px; padding-bottom: 52px;
    border-bottom: 1px solid var(--border);
    animation: fadeUp 0.4s ease both;
  }
  .pp-content section:last-child { border-bottom: none; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .pp-section-num {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--green-brand); margin-bottom: 8px;
  }
  .pp-content h2 {
    font-family: 'Instrument Serif', serif;
    font-size: 26px; font-weight: 400; color: var(--green-deep);
    margin-bottom: 16px; line-height: 1.2; letter-spacing: -0.2px;
  }
  .pp-content h3 { font-size: 14px; font-weight: 600; color: var(--text-main); margin: 24px 0 8px; }
  .pp-content p { font-size: 15px; color: #2e3d34; margin-bottom: 12px; font-weight: 300; }
  .pp-content ul, .pp-content ol { padding-left: 20px; margin-bottom: 12px; }
  .pp-content li { font-size: 15px; color: #2e3d34; margin-bottom: 6px; font-weight: 300; }

  .pp-callout {
    background: #edf7f1; border: 1px solid #b8dfc7;
    border-left: 3px solid var(--green-brand);
    border-radius: 8px; padding: 16px 20px; margin: 20px 0;
  }
  .pp-callout p { margin: 0; font-size: 14px; color: var(--green-mid); font-weight: 400; }

  .pp-highlight-box {
    background: var(--green-deep); border-radius: 12px;
    padding: 24px 28px; margin: 24px 0;
  }
  .pp-highlight-box p { color: rgba(255,255,255,0.8); margin: 0; font-size: 14px; }
  .pp-highlight-box strong { color: var(--green-bright); }

  .pp-data-table {
    width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;
  }
  .pp-data-table th {
    background: var(--green-mid); color: white;
    padding: 10px 14px; text-align: left; font-weight: 500;
    font-size: 12px; letter-spacing: 0.05em;
  }
  .pp-data-table td {
    padding: 10px 14px; border-bottom: 1px solid var(--border);
    color: #2e3d34; vertical-align: top; font-weight: 300;
  }
  .pp-data-table tr:last-child td { border-bottom: none; }
  .pp-data-table tr:nth-child(even) td { background: rgba(45,122,79,0.03); }

  .pp-rights-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 12px; margin: 20px 0;
  }
  .pp-right-card {
    background: white; border: 1px solid var(--border);
    border-radius: 10px; padding: 16px 18px;
  }
  .pp-right-card h4 {
    font-size: 13px; font-weight: 600; color: var(--green-mid);
    margin-bottom: 6px;
  }
  .pp-right-card p { font-size: 13px; color: var(--text-muted); margin: 0; font-weight: 300; }

  .pp-footer {
    background: var(--green-deep); padding: 36px 48px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 16px;
  }
  .pp-footer p { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0; font-weight: 300; }
  .pp-footer-links { display: flex; gap: 24px; }
  .pp-footer-links a {
    font-size: 13px; color: rgba(255,255,255,0.5); text-decoration: none;
    font-weight: 400; transition: color 0.15s;
  }
  .pp-footer-links a:hover { color: var(--green-bright); }

  @media (max-width: 768px) {
    .pp-layout { grid-template-columns: 1fr; padding: 40px 24px; gap: 40px; }
    .pp-toc { display: none; }
    .pp-hero { padding: 48px 24px; }
    .pp-topbar { padding: 0 24px; }
    .pp-footer { padding: 28px 24px; }
    .pp-rights-grid { grid-template-columns: 1fr; }
  }
`;

const tocItems = [
  { id: "s1", label: "1. Introduction" },
  { id: "s2", label: "2. Data We Collect" },
  { id: "s3", label: "3. How We Use Your Data" },
  { id: "s4", label: "4. Legal Basis" },
  { id: "s5", label: "5. Data Sharing" },
  { id: "s6", label: "6. Influencer Data" },
  { id: "s7", label: "7. Cookies & Tracking" },
  { id: "s8", label: "8. Data Retention" },
  { id: "s9", label: "9. Security" },
  { id: "s10", label: "10. Your Rights" },
  { id: "s11", label: "11. Children's Privacy" },
  { id: "s12", label: "12. Policy Updates" },
  { id: "s13", label: "13. Contact & DPO" },
];

export default function InstroomPrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("s1");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    tocItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="pp-body">
      <style>{styles}</style>

      {/* Top Bar */}
      <nav className="pp-topbar">
        <div className="pp-logo">
          <Image src="/images/instroomLogo.png" alt="Instroom Logo" width={36} height={36} className="pp-logo-icon" />
          <span className="pp-logo-text">instroom</span>
        </div>
        <span className="pp-doc-label">Privacy Policy</span>
      </nav>

      {/* Hero */}
      <header className="pp-hero">
        <div className="pp-hero-inner">
          <div className="pp-hero-eyebrow">Legal Document</div>
          <h1>Privacy <em>Policy</em></h1>
          <div className="pp-hero-meta">
            <span className="pp-meta-item"><strong>Effective:</strong> April 21, 2026</span>
            <span className="pp-meta-item"><strong>Jurisdiction:</strong> Republic of the Philippines</span>
            <span className="pp-meta-item"><strong>Entity:</strong> Armful OPC, trading as Armful Media</span>
          </div>
          <div className="pp-dpa-badge">
            <span className="pp-dpa-badge-icon">🛡️</span>
            <span className="pp-dpa-badge-text">Compliant with <strong>Republic Act No. 10173</strong> — Data Privacy Act of 2012 (Philippines)</span>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="pp-layout">
        {/* TOC */}
        <aside className="pp-toc">
          <div className="pp-toc-title">Contents</div>
          <ol>
            {tocItems.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={activeSection === id ? "active" : ""}
                  onClick={(e) => { e.preventDefault(); scrollTo(id); }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        {/* Content */}
        <main className="pp-content">

          <div className="pp-callout">
            <p>Your privacy is important to us. This Policy explains what personal information Instroom collects, how we use it, and the rights you have under Philippine law. We are committed to full compliance with the Data Privacy Act of 2012 (RA 10173).</p>
          </div>

          <section id="s1">
            <div className="pp-section-num">Section 01</div>
            <h2>Introduction</h2>
            <p>Armful OPC, a One Person Corporation registered in the Republic of the Philippines, trading as Armful Media, owns and operates the Instroom influencer relationship management platform accessible at instroom.io ("we," "us," or "our"). This Privacy Policy describes how we collect, use, store, share, and protect personal information in connection with your use of our platform, Chrome Extension, Post Tracker, and related services (the "Service").</p>
            <p>This Policy applies to all registered users, free trial users, and visitors to our website. It does not apply to third-party services linked from our platform — please review their individual privacy policies.</p>
          </section>

          <section id="s2">
            <div className="pp-section-num">Section 02</div>
            <h2>Data We Collect</h2>
            <p>We collect information in the following categories:</p>
            <h3>Account & Identity Information</h3>
            <ul>
              <li>Name, email address, and password (hashed) upon registration</li>
              <li>Billing information (processed by our payment provider; we do not store full card details)</li>
              <li>Company name and role (optional, for team accounts)</li>
            </ul>
            <h3>Usage & Platform Data</h3>
            <ul>
              <li>Log data: IP address, browser type, pages visited, actions taken within the platform</li>
              <li>Workspace structure, campaign data, and influencer records you create</li>
              <li>Chrome Extension activity (profile captures, searches) associated with your account</li>
              <li>Post Tracker data: post links, content downloads, Google Drive export activity</li>
            </ul>
            <h3>Integration Data</h3>
            <ul>
              <li>OAuth tokens for Google Drive, Shopify, and other connected services</li>
              <li>Data returned from Instagram and TikTok APIs when using the Discovery add-on</li>
              <li>GoAffPro data (discount codes, affiliate links, sales data) when using Affiliate Tracking</li>
            </ul>
            <table className="pp-data-table">
              <thead>
                <tr>
                  <th>Data Type</th>
                  <th>Source</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Account information</td>
                  <td>You, directly</td>
                  <td>Account creation, authentication, billing</td>
                </tr>
                <tr>
                  <td>Usage data</td>
                  <td>Automatically collected</td>
                  <td>Platform operation, analytics, troubleshooting</td>
                </tr>
                <tr>
                  <td>Campaign & influencer data</td>
                  <td>You, directly</td>
                  <td>Service delivery</td>
                </tr>
                <tr>
                  <td>Third-party API data</td>
                  <td>Instagram, TikTok, Shopify, GoAffPro</td>
                  <td>Feature functionality (Discovery, Affiliate Tracking)</td>
                </tr>
                <tr>
                  <td>Payment data</td>
                  <td>Payment processor</td>
                  <td>Billing and subscription management</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="s3">
            <div className="pp-section-num">Section 03</div>
            <h2>How We Use Your Data</h2>
            <p>We use the personal information we collect for the following purposes:</p>
            <ul>
              <li><strong>To provide and operate the Service</strong> — including managing workspaces, campaigns, influencer lists, and add-on features.</li>
              <li><strong>To process payments</strong> — billing, subscription management, and invoicing.</li>
              <li><strong>To communicate with you</strong> — transactional emails, product updates, security alerts, and support responses.</li>
              <li><strong>To improve the Service</strong> — analyzing usage patterns to enhance features and fix issues.</li>
              <li><strong>To enforce our Terms</strong> — detecting fraud, abuse, and violations of our acceptable use policy.</li>
              <li><strong>To comply with legal obligations</strong> — including requirements under Philippine law.</li>
            </ul>
            <p>We do not sell your personal information to third parties for their own marketing purposes.</p>
          </section>

          <section id="s4">
            <div className="pp-section-num">Section 04</div>
            <h2>Legal Basis for Processing</h2>
            <p>Under the Data Privacy Act of 2012 (RA 10173), we process personal information on the following legal bases:</p>
            <ul>
              <li><strong>Contractual necessity</strong> — Processing required to deliver the Service you have subscribed to.</li>
              <li><strong>Consent</strong> — For optional communications and certain cookies. You may withdraw consent at any time.</li>
              <li><strong>Legitimate interests</strong> — For security monitoring, fraud prevention, and improving the Service, provided our interests are not overridden by your rights.</li>
              <li><strong>Legal obligation</strong> — Where processing is required to comply with applicable Philippine law.</li>
            </ul>
          </section>

          <section id="s5">
            <div className="pp-section-num">Section 05</div>
            <h2>Data Sharing & Disclosure</h2>
            <p>We share personal information only in the following circumstances:</p>
            <h3>Service Providers</h3>
            <p>We engage trusted third-party service providers who assist us in operating the platform, including payment processors, cloud infrastructure providers, and analytics services. These parties are contractually bound to process data only on our instructions and to maintain appropriate security.</p>
            <h3>Third-Party Integrations</h3>
            <p>When you connect third-party services (Google Drive, Shopify, GoAffPro), data may be exchanged with those platforms as necessary to fulfill the integration. Your use of those services is governed by their respective privacy policies.</p>
            <h3>Legal Requirements</h3>
            <p>We may disclose information if required to do so by law, court order, or government authority in the Philippines or another jurisdiction, or when necessary to protect our rights, users, or the public.</p>
            <h3>Business Transfers</h3>
            <p>In the event of a merger, acquisition, or sale of all or part of our business, user data may be transferred as part of that transaction. We will notify you before any such transfer and your data becomes subject to a different privacy policy.</p>
            <div className="pp-highlight-box">
              <p><strong>We do not sell, rent, or trade your personal information</strong> to third parties for advertising or marketing purposes.</p>
            </div>
          </section>

          <section id="s6">
            <div className="pp-section-num">Section 06</div>
            <h2>Influencer Data</h2>
            <p>Instroom is a B2B tool. When you use the platform to manage influencer campaigns, you may input personal information about third-party individuals (influencers), such as their name, social media handles, contact details, engagement metrics, and performance data.</p>
            <p>As the user creating and managing this data, <strong>you act as the data controller</strong> for that information. You are responsible for ensuring you have a lawful basis for collecting and processing influencer personal data, and for complying with applicable data protection laws when using Instroom's features to contact or manage those individuals.</p>
            <p>Instroom acts as a data processor with respect to influencer data stored in your workspace. We process it only to deliver the Service to you.</p>
          </section>

          <section id="s7">
            <div className="pp-section-num">Section 07</div>
            <h2>Cookies & Tracking Technologies</h2>
            <p>We use cookies and similar technologies to operate and improve the Service. These include:</p>
            <ul>
              <li><strong>Essential cookies</strong> — Required for authentication, session management, and platform security. Cannot be disabled.</li>
              <li><strong>Analytics cookies</strong> — Help us understand how users interact with the platform so we can improve it. You may opt out via your browser settings or our cookie preference center.</li>
              <li><strong>Preference cookies</strong> — Remember your settings and workspace preferences.</li>
            </ul>
            <p>The Chrome Extension does not inject tracking scripts into third-party websites. It reads publicly visible profile data from Instagram and TikTok pages you browse while signed in and logged into the extension.</p>
          </section>

          <section id="s8">
            <div className="pp-section-num">Section 08</div>
            <h2>Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as necessary to provide the Service. Specific retention periods:</p>
            <ul>
              <li><strong>Account data</strong> — Retained for the duration of your subscription, plus 30 days after cancellation to allow for data export requests.</li>
              <li><strong>Billing records</strong> — Retained for a minimum of 5 years to comply with Philippine tax and accounting regulations.</li>
              <li><strong>Usage logs</strong> — Retained for up to 12 months for security and troubleshooting purposes.</li>
              <li><strong>Workspace and campaign data</strong> — Deleted within 60 days of account termination unless a longer retention period is required by law.</li>
            </ul>
            <p>You may request deletion of your account and associated personal data at any time by contacting us at privacy@instroom.io.</p>
          </section>

          <section id="s9">
            <div className="pp-section-num">Section 09</div>
            <h2>Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction. These include encrypted data transmission (TLS/HTTPS), hashed passwords, access controls based on the principle of least privilege, and regular security reviews.</p>
            <p>While we take reasonable steps to protect your data, no method of transmission over the internet or electronic storage is 100% secure. We encourage you to use a strong, unique password and to enable any additional security features available in your account settings.</p>
            <p>In the event of a personal data breach that affects your rights and freedoms, we will notify the National Privacy Commission (NPC) and affected users in accordance with the requirements of RA 10173 and its Implementing Rules and Regulations.</p>
          </section>

          <section id="s10">
            <div className="pp-section-num">Section 10</div>
            <h2>Your Privacy Rights</h2>
            <p>Under the Data Privacy Act of 2012, you have the following rights with respect to your personal information:</p>
            <div className="pp-rights-grid">
              <div className="pp-right-card">
                <h4>Right to be Informed</h4>
                <p>You have the right to know whether your personal data is being collected and processed, and for what purpose.</p>
              </div>
              <div className="pp-right-card">
                <h4>Right to Access</h4>
                <p>You may request a copy of the personal information we hold about you at any time.</p>
              </div>
              <div className="pp-right-card">
                <h4>Right to Correction</h4>
                <p>You may request correction of inaccurate, outdated, or incomplete personal information.</p>
              </div>
              <div className="pp-right-card">
                <h4>Right to Erasure</h4>
                <p>You may request deletion of your personal information, subject to legal retention obligations.</p>
              </div>
              <div className="pp-right-card">
                <h4>Right to Object</h4>
                <p>You may object to the processing of your personal data for purposes other than those consented to or required by law.</p>
              </div>
              <div className="pp-right-card">
                <h4>Right to Data Portability</h4>
                <p>You may request your personal data in a structured, machine-readable format for transfer to another service.</p>
              </div>
            </div>
            <p>To exercise any of these rights, contact us at <strong>privacy@instroom.io</strong>. We will respond within 15 business days. You also have the right to file a complaint with the <strong>National Privacy Commission (NPC)</strong> at www.privacy.gov.ph if you believe we have not handled your data lawfully.</p>
          </section>

          <section id="s11">
            <div className="pp-section-num">Section 11</div>
            <h2>Children's Privacy</h2>
            <p>The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal information without parental consent, we will take steps to delete it promptly. If you believe a minor has submitted information to us, please contact privacy@instroom.io.</p>
          </section>

          <section id="s12">
            <div className="pp-section-num">Section 12</div>
            <h2>Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or via a prominent notice within the platform, with at least 15 days' notice before the new policy takes effect.</p>
            <p>We encourage you to review this Policy periodically. Continued use of the Service after the effective date of changes constitutes your acceptance of the updated Policy.</p>
          </section>

          <section id="s13">
            <div className="pp-section-num">Section 13</div>
            <h2>Contact & Data Protection Officer</h2>
            <p>For any questions, concerns, or requests related to this Privacy Policy or your personal data, please contact our Data Protection Officer (DPO):</p>
            <h3>Armful OPC, trading as Armful Media — Data Protection Officer</h3>
            <ul>
              <li>SEC Registration No.: <strong>2024090169123-01</strong></li>
              <li>Registered Address: <strong>2/F Armful Media Bldg., Santiago, Naujan, Oriental Mindoro, Philippines 5204</strong></li>
              <li>Email: <strong>privacy@instroom.io</strong></li>
              <li>Website: <strong>instroom.io</strong></li>
              <li>Jurisdiction: Republic of the Philippines</li>
            </ul>
            <div className="pp-callout">
              <p>You also have the right to lodge a complaint with the <strong>National Privacy Commission (NPC)</strong> of the Philippines. Visit www.privacy.gov.ph for more information.</p>
            </div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="pp-footer">
        <p>© 2026 Armful OPC, trading as Armful Media (SEC Reg. No. 2024090169123-01). Instroom is a product of Armful OPC. 2/F Armful Media Bldg., Santiago, Naujan, Oriental Mindoro, Philippines 5204. Compliant with RA 10173.</p>
        <div className="pp-footer-links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Refund Policy</a>
        </div>
      </footer>
    </div>
  );
}