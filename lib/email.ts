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
      subject: "Welcome to Instroom! 🎉",
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
              }
              .logo {
                font-size: 28px;
                font-weight: bold;
                color: #1FAE5B;
                margin-bottom: 10px;
              }
              h1 {
                color: #0F6B3E;
                font-size: 24px;
                margin-bottom: 10px;
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
                <div class="logo">Instroom</div>
              </div>
              
              <h1>Welcome to Instroom, ${name}! 🎉</h1>
              
              <div class="content">
                <p>We're thrilled to have you on board! Your account has been successfully created.</p>
                
                <p>You now have access to <span class="highlight">Instroom</span>, your all-in-one platform to simplify your influencer marketing workflow.</p>
                
                <p><strong>Next Step: Choose Your Plan</strong></p>
                <p>To get started, please select a plan that best fits your needs. We offer flexible pricing to support teams of all sizes:</p>
                <ul>
                  <li><strong>Solo</strong> - Perfect for individual creators and small brands</li>
                  <li><strong>Team</strong> - Collaborate with your team members</li>
                  <li><strong>Agency</strong> - Scale your influencer marketing operations</li>
                </ul>
                
                <p>Once you've selected your plan, you'll have full access to:</p>
                <ul>
                  <li>Manage your influencer partnerships</li>
                  <li>Track campaign performance with analytics</li>
                  <li>Organize your influencer pipeline</li>
                  <li>Scale your influencer marketing efforts</li>
                </ul>
                
                <a href="${process.env.NEXTAUTH_URL}/pricing" text-white class="button">Choose Your Plan</a>
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
