import "server-only"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const mailOptions = {
      from: `Instroom <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to Instroom!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #1E1E1E;
                background-color: #F7F9F8;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                border: 1px solid #0F6B3E/15;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #1FAE5B/20;
              }
              .logo {
                display: inline-block;
                margin-bottom: 15px;
              }
              .logo img {
                height: 50px;
                width: auto;
              }
              h1 {
                color: #0F6B3E;
                font-size: 24px;
                margin: 15px 0 0 0;
              }
              .content {
                margin: 30px 0;
                line-height: 1.8;
              }
              .highlight {
                color: #1FAE5B;
                font-weight: 600;
              }
              .button {
                display: inline-block;
                background-color: #1FAE5B;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
                font-weight: 600;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #0F6B3E/10;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">
                  <img src="/images/instroomLogo.png" alt="Instroom Logo" width="50" height="50" />
                </div>
                <h1>Welcome to Instroom!</h1>
              </div>
              
              <div class="content">
                <p>Hi ${name},</p>
                
                <p>We're thrilled to have you on board! Your account has been successfully created.</p>
                
                <p>You now have access to <span class="highlight">Instroom</span>, your all-in-one platform to simplify your influencer marketing workflow.</p>
                
                <p><strong>Next Step: Choose Your Plan</strong></p>
                <p>To get started, please select a plan that best fits your needs. We offer flexible pricing to support teams of all sizes:</p>
                <ul>
                  <li><strong>Solo</strong> - Perfect for individual creators and small workspaces</li>
                  <li><strong>Team</strong> - Collaborate with your team members</li>
                </ul>
                
                <p>Once you've selected your plan, you'll have full access to:</p>
                <ul>
                  <li>Manage your influencer partnerships</li>
                  <li>Track campaign performance with analytics</li>
                  <li>Organize your influencer pipeline</li>
                  <li>Scale your influencer marketing efforts</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXTAUTH_URL}/pricing" class="button">Choose Your Plan</a>
                </div>
              </div>
              
              <div class="footer">
                <p>© 2026 Instroom. All rights reserved.<br/>
                Simplify your Influencer Marketing Workflow</p>
              </div>
            </div>
          </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Email error:", error instanceof Error ? error.message : String(error))
    return false
  }
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  try {
    const mailOptions = {
      from: `Instroom <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset Your Instroom Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #1E1E1E;
                background-color: #F7F9F8;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                border: 1px solid #0F6B3E/15;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #1FAE5B/20;
              }
              .logo {
                display: inline-block;
                margin-bottom: 15px;
              }
              .logo img {
                height: 50px;
                width: auto;
              }
              h1 {
                color: #0F6B3E;
                font-size: 24px;
                margin: 15px 0 0 0;
              }
              .content {
                margin: 30px 0;
                line-height: 1.8;
              }
              .highlight {
                color: #1FAE5B;
                font-weight: 600;
              }
              .button {
                display: inline-block;
                background-color: #1FAE5B;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
                font-weight: 600;
                text-align: center;
                width: 200px;
              }
              .warning {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
                font-size: 14px;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #0F6B3E/10;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">
                  <img src="/images/instroomLogo.png" alt="Instroom Logo" width="50" height="50" />
                </div>
                <h1>Reset Your Password</h1>
              </div>
              
              <div class="content">
                <p>Hi ${name},</p>
                
                <p>We received a request to reset your password. Click the button below to create a new password.</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p style="text-align: center; font-size: 12px; color: #666;">Or copy and paste this link in your browser:</p>
                <p style="text-align: center; font-size: 12px; word-break: break-all;">
                  <code>${resetUrl}</code>
                </p>
                
                <div class="warning">
                  <strong>⏰ This link expires in 1 hour</strong><br/>
                  If you don't reset your password within 1 hour, you'll need to submit a new password reset request.
                </div>
                
                <p><strong>Didn't request a password reset?</strong><br/>
                If you didn't request this email, you can safely ignore it. Your account remains secure.</p>
              </div>
              
              <div class="footer">
                <p>© 2026 Instroom. All rights reserved.<br/>
                Simplify your Influencer Marketing Workflow</p>
              </div>
            </div>
          </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Password reset email error:", error instanceof Error ? error.message : String(error))
    return false
  }
}

export async function sendOTPEmail(email: string, name: string, otp: string) {
  try {
    const mailOptions = {
      from: `Instroom <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify Your Instroom Account - OTP Code",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #1E1E1E;
                background-color: #F7F9F8;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                border: 1px solid #0F6B3E/15;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #1FAE5B/20;
              }
              .logo {
                display: inline-block;
                margin-bottom: 15px;
              }
              .logo img {
                height: 50px;
                width: auto;
              }
              h1 {
                color: #0F6B3E;
                font-size: 24px;
                margin: 15px 0 0 0;
              }
              .content {
                margin: 30px 0;
                line-height: 1.8;
              }
              .otp-box {
                background-color: #F7F9F8;
                border: 2px solid #1FAE5B;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 30px 0;
              }
              .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #1FAE5B;
                letter-spacing: 4px;
                font-family: 'Courier New', monospace;
              }
              .warning {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
                font-size: 14px;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #0F6B3E/10;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">
                  <img src="/images/instroomLogo.png" alt="Instroom Logo" width="50" height="50" />
                </div>
                <h1>Verify Your Email</h1>
              </div>
              
              <div class="content">
                <p>Hi ${name},</p>
                
                <p>Welcome to Instroom! To complete your signup, please verify your email using the OTP code below:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                
                <p style="text-align: center;">This code will expire in <strong>10 minutes</strong></p>
                
                <div class="warning">
                  <strong>⚠️ Keep this code confidential</strong><br/>
                  Never share this code with anyone. Instroom staff will never ask for it.
                </div>
                
                <p><strong>Didn't sign up for Instroom?</strong><br/>
                If you didn't create this account, you can safely ignore this email.</p>
              </div>
              
              <div class="footer">
                <p>© 2026 Instroom. All rights reserved.<br/>
                Simplify your Influencer Marketing Workflow</p>
              </div>
            </div>
          </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("OTP email error:", error instanceof Error ? error.message : String(error))
    return false
  }
}

export async function sendBrandInvitationEmail(
  email: string,
  brandName: string,
  inviterName: string,
  invitationLink: string,
  role: string = "collaborator"
) {
  try {
    // Role configurations with capabilities
    const roleConfigs: Record<string, { label: string; can: string[]; cannot: string[] }> = {
      manager: {
        label: "Manager",
        can: [
          "Approve influencers",
          "Manage outreach campaigns",
          "Oversee all operational tasks",
          "View workspace analytics",
        ],
        cannot: ["Manage workspace settings (Admin only)", "Invite or remove members", "Transfer Admin role"],
      },
      researcher: {
        label: "Researcher",
        can: [
          "Search for influencers",
          "Add influencers to lists",
          "Fill in details and notes",
          "Submit influencers for approval",
        ],
        cannot: ["Approve influencers", "Manage outreach", "Export data", "Manage workspace settings"],
      },
      viewer: {
        label: "Viewer",
        can: [
          "View campaigns",
          "View reports",
          "View workspace analytics",
          "Access read-only information",
        ],
        cannot: ["Create or edit campaigns", "Approve influencers", "Manage any workspace features"],
      },
      collaborator: {
        label: "Collaborator",
        can: [
          "Collaborate on projects",
          "Manage influencer relationships",
          "Track campaign performance",
          "Access workspace resources",
        ],
        cannot: ["Manage workspace settings", "Invite members"],
      },
    }

    const roleConfig = roleConfigs[role] || roleConfigs.collaborator
    const mailOptions = {
      from: `Instroom <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `You're invited to join ${brandName} on Instroom!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                line-height: 1.6;
                color: #1E1E1E;
                background-color: #F7F9F8;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
              }
              .header {
                padding: 40px 20px;
                text-align: center;
                border-bottom: 1px solid #E0E0E0;
              }
              .logo {
                display: inline-block;
                margin-bottom: 20px;
                font-size: 24px;
                font-weight: 700;
                color: #0F6B3E;
              }
              .main-heading {
                color: #0F6B3E;
                font-size: 28px;
                font-weight: 700;
                margin: 0;
                word-break: break-word;
              }
              .subheading {
                color: #666;
                font-size: 16px;
                margin: 10px 0 0 0;
                font-weight: 400;
              }
              .content {
                padding: 40px 30px;
              }
              .intro-text {
                font-size: 15px;
                color: #1E1E1E;
                margin: 0 0 25px 0;
                line-height: 1.7;
              }
              .inviter-name {
                color: #0F6B3E;
                font-weight: 700;
              }
              .brand-name {
                color: #0F6B3E;
                font-weight: 700;
              }
              .role-badge {
                display: inline-block;
                background-color: white;
                color: #0F6B3E;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 14px;
                margin-left: 8px;
              }
              .capabilities-box {
                background-color: #F5F5F5;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
              }
              .capabilities-title {
                color: #0F6B3E;
                font-weight: 700;
                font-size: 16px;
                margin: 0 0 15px 0;
              }
              .capability-list {
                list-style: none;
                padding: 0;
                margin: 0 0 20px 0;
              }
              .capability-item {
                display: flex;
                align-items: flex-start;
                margin: 12px 0;
                font-size: 14px;
                line-height: 1.5;
              }
              .capability-item.can {
                color: #1F7E3F;
              }
              .capability-item.cannot {
                color: #999;
              }
              .icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                margin-right: 10px;
                flex-shrink: 0;
                font-weight: bold;
              }
              .icon.checkmark {
                color: #1FAE5B;
              }
              .icon.xmark {
                color: #CCC;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .button {
                display: inline-block;
                background-color: #1FAE5B !important;
                color: white !important;
                padding: 14px 40px;
                text-decoration: none !important;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                border: none;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              .button:hover {
                background-color: #0F6B3E;
              }
              .expiry-notice {
                text-align: center;
                font-size: 13px;
                color: #999;
                margin-top: 15px;
              }
              .footer {
                background-color: #F9F9F9;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #E0E0E0;
                font-size: 12px;
                color: #999;
              }
              .footer-text {
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo" style="font-size: 28px; font-weight: 700; color: #0F6B3E; margin-bottom: 25px; display: block;">Instroom</div>
                <h1 class="main-heading">You're invited to ${brandName}</h1>
                <p class="subheading">Join as <span class="role-badge">${roleConfig.label}</span></p>
              </div>
              
              <div class="content">
                <p class="intro-text">
                  <span class="inviter-name">${inviterName}</span> added you as a <strong>${roleConfig.label}</strong> to the <span class="brand-name">${brandName}</span> workspace. You'll have full access to create and manage campaigns and track influencer posts.
                </p>
                
                <div class="capabilities-box">
                  <div class="capabilities-title">As a ${roleConfig.label}, you can:</div>
                  <ul class="capability-list">
                    ${roleConfig.can.map(capability => `
                      <li class="capability-item can">
                        <span class="icon checkmark">✓</span>
                        <span>${capability}</span>
                      </li>
                    `).join('')}
                  </ul>
                  
                  ${roleConfig.cannot.length > 0 ? `
                    <div style="border-top: 1px solid #E0E0E0; padding-top: 15px; margin-top: 15px;">
                      <div style="font-size: 12px; color: #999; margin-bottom: 10px;">Not available in this role:</div>
                      <ul class="capability-list">
                        ${roleConfig.cannot.map(capability => `
                          <li class="capability-item cannot">
                            <span class="icon xmark">✕</span>
                            <span>${capability}</span>
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  ` : ''}
                </div>
                
                <div class="button-container">
                  <a href="${invitationLink}" class="button" style="display: inline-block; background-color: #1FAE5B !important; color: white !important; padding: 14px 40px; text-decoration: none !important; border-radius: 6px; font-weight: 600; font-size: 16px; border: none; cursor: pointer;">Accept Invitation →</a>
                  <div class="expiry-notice">This link expires in 7 days.</div>
                </div>
              </div>
              
              <div class="footer">
                <div class="footer-text">© 2026 Instroom. All rights reserved.</div>
                <div class="footer-text">Simplify your Influencer Marketing Workflow</div>
              </div>
            </div>
          </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Brand invitation email error:", error instanceof Error ? error.message : String(error))
    return false
  }
}
