import nodemailer from 'nodemailer';

interface EmailData {
  name: string;
  email: string;
  city?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWaitlistConfirmation(userData: EmailData) {
  try {
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SafeSpora — Awareness is the First Line of Defense</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            /* Base styles matching website */
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #f0f2f5; 
              -webkit-font-smoothing: antialiased;
            }
            
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              background-color: #ffffff; 
              border-radius: 32px; 
              overflow: hidden; 
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
            }
            
            .header { 
              background: linear-gradient(135deg, #0B0C0F 0%, #1A1B25 100%); 
              padding: 52px 40px; 
              text-align: center; 
            }
            
            .brand-container {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              margin: 0 auto 24px auto;
              text-align: left;
            }
            
            .brand-logo {
              width: 32px;
              height: 32px;
              display: inline-block;
            }
            
            .brand-name {
              font-size: 18px;
              font-weight: 600;
              color: #ffffff;
              letter-spacing: -0.025em;
            }
            
            .brand-name span {
              color: #ef4444;
            }
            
            .header h1 { 
              color: #ffffff; 
              font-size: 32px; 
              margin: 16px 0 0; 
              font-weight: 600;
              line-height: 1.3;
            }
            
            .header .subhead {
              color: #9ca3af;
              font-size: 16px;
              margin-top: 12px;
              font-weight: 400;
            }
            
            .content { 
              padding: 48px 40px; 
            }
            
            .greeting { 
              font-size: 18px; 
              color: #1e293b; 
              margin-bottom: 20px; 
              font-weight: 500; 
            }
            
            .greeting strong { 
              color: #ef4444; 
              font-weight: 600;
            }
            
            .message { 
              color: #475569; 
              line-height: 1.7; 
              margin-bottom: 32px; 
              font-size: 16px;
            }
            
            .mission-statement {
              background: #f8fafc;
              border-radius: 20px;
              padding: 24px;
              margin: 32px 0;
              border-left: 4px solid #ef4444;
              font-style: italic;
              color: #334155;
            }
            
            .section-title {
              font-size: 20px;
              font-weight: 600;
              color: #0B0C0F;
              margin: 40px 0 24px;
              padding-bottom: 12px;
              border-bottom: 2px solid #e2e8f0;
            }
            
            .principle-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin: 24px 0;
            }
            
            .principle-card {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 20px;
              transition: all 0.2s ease;
            }
            
            .principle-card:hover {
              border-color: #ef4444;
              box-shadow: 0 8px 20px -10px rgba(239, 68, 68, 0.2);
            }
            
            .principle-card .icon {
              font-size: 28px;
              margin-bottom: 12px;
              display: block;
            }
            
            .principle-card h3 {
              font-size: 16px;
              font-weight: 600;
              color: #0B0C0F;
              margin: 0 0 8px;
            }
            
            .principle-card p {
              font-size: 14px;
              color: #64748b;
              line-height: 1.5;
              margin: 0;
            }
            
            .city-update { 
              background: #f0f9ff; 
              border-radius: 20px; 
              padding: 24px; 
              margin: 32px 0; 
              border: 1px solid #bae6fd; 
            }
            
            .city-update .title { 
              font-size: 18px; 
              font-weight: 600; 
              color: #0369a1; 
              margin-bottom: 12px; 
              display: flex; 
              align-items: center; 
              gap: 8px; 
            }
            
            .city-update p { 
              color: #075985; 
              line-height: 1.7; 
              margin: 0; 
              font-size: 15px; 
            }
            
            .feature-list { 
              list-style: none; 
              padding: 0; 
              margin: 0; 
            }
            
            .feature-list li { 
              padding: 12px 0; 
              border-bottom: 1px solid #e2e8f0; 
              color: #334155; 
              display: flex; 
              align-items: center; 
              gap: 12px; 
              font-size: 15px;
            }
            
            .feature-list li:last-child { 
              border-bottom: none; 
            }
            
            .feature-list li:before { 
              content: "✓"; 
              color: #10b981; 
              width: 22px; 
              height: 22px; 
              background-color: #d1fae5; 
              border-radius: 50%; 
              display: inline-flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 13px; 
              font-weight: 600;
              flex-shrink: 0;
            }
            
            .what-it-is-not {
              background: #fef2f2;
              border-radius: 20px;
              padding: 24px;
              margin: 32px 0;
              border: 1px solid #fecaca;
            }
            
            .what-it-is-not .title {
              color: #991b1b;
              font-weight: 600;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .what-it-is-not ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            
            .what-it-is-not li {
              padding: 8px 0;
              color: #7f1d1d;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .what-it-is-not li:before {
              content: "•";
              color: #ef4444;
              font-weight: bold;
              font-size: 18px;
            }
            
            .footer { 
              background-color: #f8fafc; 
              padding: 40px; 
              text-align: center; 
              border-top: 1px solid #e2e8f0; 
            }
            
            .footer p { 
              color: #64748b; 
              font-size: 14px; 
              margin: 8px 0; 
              line-height: 1.6;
            }
            
            .footer-quote {
              font-size: 15px;
              font-weight: 500;
              color: #0B0C0F;
              margin: 24px 0 16px;
              padding: 16px 0;
              border-top: 1px dashed #cbd5e1;
              border-bottom: 1px dashed #cbd5e1;
            }
            
            @media (max-width: 600px) { 
              .header, .content, .footer { 
                padding: 36px 24px; 
              }
              
              .principle-grid {
                grid-template-columns: 1fr;
              }
              
              .header h1 {
                font-size: 28px;
              }
              
              .brand-logo {
                width: 28px;
                height: 28px;
              }
              
              .brand-name {
                font-size: 16px;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f0f2f5;">
          <div class="container">
            <div class="header">
              <div class="brand-container">
                <img src="https://safespora.com/safespora.png" alt="safespora logo" class="brand-logo" width="32" height="32">
                <span class="brand-name"><span>SafeSpora</span></span>
              </div>
              <h1>You're on the waitlist</h1>
              <div class="subhead">Awareness is the first line of defense</div>
            </div>
            
            <div class="content">
              <div class="greeting">
                <strong>${userData.name}</strong>,
              </div>
              
              <div class="message">
                Thank you for joining SafeSpora. You are now part of a community committed to building safer Nigerian neighborhoods through shared awareness and responsible information.
              </div>
              
              <div class="mission-statement">
                "SafeSpora helps Nigerians stay informed about security incidents happening around their neighborhoods, daily routes, and places they care about — in real time."
              </div>
              
              ${userData.city ? `
              <div class="city-update">
                <div class="title">
                  <span>📍</span> About ${userData.city}
                </div>
                <p>
                  We're actively working to bring SafeSpora's real-time alerts to ${userData.city}. As a waitlist member, you'll be among the first to know when we launch in your area and can help shape how the community uses the platform.
                </p>
              </div>
              ` : `
              <div class="city-update">
                <div class="title">
                  <span>🇳🇬</span> Nationwide coverage
                </div>
                <p>
                  SafeSpora is expanding across Nigerian cities. Help us prioritize your area by sharing the waitlist with neighbors and colleagues — stronger communities start with more voices.
                </p>
              </div>
              `}
              
              <h2 class="section-title">How SafeSpora works</h2>
              
              <div class="principle-grid">
                <div class="principle-card">
                  <span class="icon">📍</span>
                  <h3>Select your locations</h3>
                  <p>Choose neighborhoods, streets, and routes you care about — your home, workplace, or daily commute.</p>
                </div>
                <div class="principle-card">
                  <span class="icon">🔔</span>
                  <h3>Receive relevant alerts</h3>
                  <p>Get notifications based on proximity and timing — not noise. See what's happening near you.</p>
                </div>
                <div class="principle-card">
                  <span class="icon">🤔</span>
                  <h3>Make safer decisions</h3>
                  <p>Decide whether to delay, reroute, stay alert, or check on loved ones using real information.</p>
                </div>
                <div class="principle-card">
                  <span class="icon">🤝</span>
                  <h3>Community-driven</h3>
                  <p>Alerts come from people nearby experiencing events — not anonymous viral messages.</p>
                </div>
              </div>
              
              <h2 class="section-title">What to expect as a waitlist member</h2>
              
              <ul class="feature-list">
                <li>Early access to SafeSpora when we launch in your area</li>
                <li>Updates on our progress and city expansion plans</li>
                <li>Invitations to share feedback and help shape the platform</li>
                <li>Knowledge that you're helping build safer communities</li>
              </ul>
              
              <div class="what-it-is-not">
                <div class="title">
                  <span>🛡️</span> What SafeSpora is — and is not
                </div>
                <ul>
                  <li><strong>Is:</strong> A tool for situational awareness from nearby community reports</li>
                  <li><strong>Is not:</strong> A replacement for emergency services (always call official numbers)</li>
                  <li><strong>Is not:</strong> A source of rumors or forwarded messages — only relevant, localized alerts</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 40px 0 16px;">
                <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
                  "In a country where information often travels faster than verification, SafeSpora is built to slow things down just enough to help people think clearly and move safely."
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} SafeSpora. All rights reserved.</p>
              <p style="font-size: 13px; color: #94a3b8;">
                You're receiving this because you joined the SafeSpora waitlist.
              </p>
              <div class="footer-quote">
                Awareness is the first line of defense.
              </div>
              <p style="font-size: 12px; color: #94a3b8;">
                SafeSpora • Building safer Nigerian communities • <a href="#" style="color: #ef4444; text-decoration: none;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `"SafeSpora" <${process.env.SMTP_FROM_EMAIL}>`,
      to: userData.email,
      subject: 'You\'re on the SafeSpora waitlist',
      html: htmlTemplate,
      text: `
        ${userData.name},

        Thank you for joining SafeSpora. You are now part of a community committed to building safer Nigerian neighborhoods through shared awareness and responsible information.

        ${userData.city ? `We're actively working to bring SafeSpora's real-time alerts to ${userData.city}. You'll be among the first to know when we launch in your area.` : 'SafeSpora is expanding across Nigerian cities. Help us prioritize your area by sharing the waitlist.'}

        HOW SAFESPORA WORKS:
        • Select locations you care about (home, work, daily routes)
        • Receive relevant alerts based on proximity, not noise
        • Make safer decisions: delay, reroute, or stay alert
        • Community-driven reports, not anonymous messages

        WHAT TO EXPECT:
        • Early access when we launch in your area
        • Updates on our progress and city expansion
        • Invitations to share feedback
        • Knowledge that you're helping build safer communities

        IMPORTANT: SafeSpora is a tool for awareness, NOT a replacement for emergency services. Always call official numbers in emergencies.

        "Awareness is the first line of defense."

        © ${new Date().getFullYear()} SafeSpora
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}