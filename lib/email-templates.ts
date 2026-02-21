// lib/email-templates.ts

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .header {
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    color: white;
    padding: 30px;
    text-align: center;
    border-radius: 8px 8px 0 0;
  }
  .content {
    background: #ffffff;
    padding: 30px;
    border: 1px solid #e5e7eb;
    border-top: none;
  }
  .footer {
    background: #f9fafb;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: #6b7280;
    border-radius: 0 0 8px 8px;
  }
  .button {
    display: inline-block;
    padding: 12px 24px;
    background: #dc2626;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    margin: 20px 0;
  }
  .credentials {
    background: #f3f4f6;
    padding: 15px;
    border-radius: 6px;
    margin: 20px 0;
    font-family: monospace;
  }
  .warning {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 15px;
    margin: 20px 0;
  }
  .info {
    background: #dbeafe;
    border-left: 4px solid #3b82f6;
    padding: 15px;
    margin: 20px 0;
  }
  .permissions-list {
    background: #f9fafb;
    padding: 15px;
    border-radius: 6px;
    margin: 15px 0;
  }
  .permission-item {
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .permission-item:last-child {
    border-bottom: none;
  }
  .badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }
  .badge-success {
    background: #d1fae5;
    color: #065f46;
  }
  .badge-danger {
    background: #fee2e2;
    color: #991b1b;
  }
`;

export const EMAIL_TEMPLATES = {
  /**
   * Admin Invitation Email
   */
  ADMIN_INVITATION: (email: string, tempPassword: string, role: string, invitedBy: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="header">
        <h1>🛡️ SafeSpora Admin Portal</h1>
        <p>You've been invited as an administrator</p>
      </div>
      <div class="content">
        <h2>Welcome to the SafeSpora Admin Team!</h2>
        <p>Hello,</p>
        <p>You have been invited by <strong>${invitedBy}</strong> to join the SafeSpora Admin Portal as a <strong>${role === 'super_admin' ? 'Super Admin' : 'Admin'}</strong>.</p>
        
        <div class="credentials">
          <p><strong>Your Login Credentials:</strong></p>
          <p>Email: <strong>${email}</strong></p>
          <p>Temporary Password: <strong>${tempPassword}</strong></p>
        </div>

        <div class="warning">
          <p><strong>⚠️ Important Security Notice:</strong></p>
          <ul>
            <li>This is a temporary password that must be changed on first login</li>
            <li>Do not share these credentials with anyone</li>
            <li>You will be required to set a new password immediately</li>
          </ul>
        </div>

        <p>To get started:</p>
        <ol>
          <li>Visit the admin portal login page</li>
          <li>Enter your email and temporary password</li>
          <li>You'll be prompted to create a new secure password</li>
          <li>Complete your profile setup</li>
        </ol>

        <a href="${process.env.NEXT_PUBLIC_ADMIN_URL || 'https://safespora.com'}/auth/login" class="button">
          Access Admin Portal
        </a>

        <p>If you have any questions or did not expect this invitation, please contact the admin team immediately.</p>
      </div>
      <div class="footer">
        <p>SafeSpora Admin Portal</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `,

  /**
   * Permission Update Email
   */
  PERMISSION_UPDATE: (
    adminEmail: string,
    updatedBy: string,
    changes: { module: string; action: string; oldValue: boolean; newValue: boolean }[]
  ) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Permission Update</h1>
        <p>Your admin permissions have been modified</p>
      </div>
      <div class="content">
        <h2>Permission Changes Notification</h2>
        <p>Hello,</p>
        <p>Your admin permissions have been updated by <strong>${updatedBy}</strong>.</p>

        <div class="info">
          <p><strong>📋 Changes Made:</strong></p>
        </div>

        <div class="permissions-list">
          ${changes.map(change => `
            <div class="permission-item">
              <strong>${change.module}</strong> - ${change.action}:
              <span class="badge ${change.oldValue ? 'badge-success' : 'badge-danger'}">
                ${change.oldValue ? 'Allowed' : 'Denied'}
              </span>
              →
              <span class="badge ${change.newValue ? 'badge-success' : 'badge-danger'}">
                ${change.newValue ? 'Allowed' : 'Denied'}
              </span>
            </div>
          `).join('')}
        </div>

        <p>These changes are effective immediately. You may need to log out and log back in to see the updated permissions reflected in your admin portal.</p>

        <div class="warning">
          <p><strong>⚠️ Security Notice:</strong></p>
          <p>If you did not expect these changes or believe this is an error, please contact a super administrator immediately.</p>
        </div>

        <a href="${process.env.NEXT_PUBLIC_ADMIN_URL || 'https://safespora.com'}/admin/profile" class="button">
          View Your Profile
        </a>
      </div>
      <div class="footer">
        <p>SafeSpora Admin Portal</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `,

  /**
   * Account Status Change Email
   */
  ACCOUNT_STATUS_CHANGE: (adminEmail: string, isActive: boolean, changedBy: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="header">
        <h1>${isActive ? '✅' : '🚫'} Account Status Update</h1>
        <p>Your admin account has been ${isActive ? 'activated' : 'deactivated'}</p>
      </div>
      <div class="content">
        <h2>Account Status Change</h2>
        <p>Hello,</p>
        <p>Your SafeSpora admin account has been <strong>${isActive ? 'activated' : 'deactivated'}</strong> by <strong>${changedBy}</strong>.</p>

        ${isActive ? `
          <div class="info">
            <p><strong>✅ Your account is now active</strong></p>
            <p>You can now log in to the admin portal and access your assigned features.</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_ADMIN_URL || 'https://safespora.com'}/auth/login" class="button">
            Login to Admin Portal
          </a>
        ` : `
          <div class="warning">
            <p><strong>🚫 Your account has been deactivated</strong></p>
            <p>You will no longer be able to access the admin portal. If you believe this is an error, please contact a super administrator.</p>
          </div>
        `}

        <p>If you have any questions about this change, please contact the admin team.</p>
      </div>
      <div class="footer">
        <p>SafeSpora Admin Portal</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `,

  /**
   * Waitlist Confirmation Email
   */
  WAITLIST_CONFIRMATION: (email: string, position?: number) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Welcome to SafeSpora!</h1>
        <p>You're on the waitlist</p>
      </div>
      <div class="content">
        <h2>Thank You for Joining!</h2>
        <p>Hello,</p>
        <p>Thank you for your interest in SafeSpora! We're excited to have you join our community safety network.</p>

        ${position ? `
          <div class="info">
            <p><strong>Your Position:</strong> #${position} on the waitlist</p>
          </div>
        ` : ''}

        <p><strong>What happens next?</strong></p>
        <ul>
          <li>We'll keep you updated on our launch progress</li>
          <li>You'll be among the first to know when we go live</li>
          <li>Early access members get exclusive features and benefits</li>
        </ul>

        <div class="info">
          <p><strong>📱 Stay Connected:</strong></p>
          <p>Follow us on social media for updates and community safety tips!</p>
        </div>

        <p>We're working hard to bring SafeSpora to your community. Thank you for your patience and support!</p>
      </div>
      <div class="footer">
        <p>SafeSpora - Building Safer Communities Together</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `,

  /**
   * Waitlist Launch Notification
   */
  WAITLIST_LAUNCH: (email: string, downloadLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="header">
        <h1>🚀 SafeSpora is Live!</h1>
        <p>Your wait is over</p>
      </div>
      <div class="content">
        <h2>We're Officially Launched!</h2>
        <p>Hello,</p>
        <p>Great news! SafeSpora is now live and ready for you to download.</p>

        <p>As a waitlist member, you're getting early access to all our features:</p>
        <ul>
          <li>Real-time safety alerts in your area</li>
          <li>Community incident reporting</li>
          <li>Verified staff directory</li>
          <li>Emergency contact management</li>
          <li>And much more!</li>
        </ul>

        <a href="${downloadLink}" class="button">
          Download SafeSpora Now
        </a>

        <div class="info">
          <p><strong>🎁 Early Access Bonus:</strong></p>
          <p>As a thank you for your patience, you'll receive premium features for free during your first month!</p>
        </div>

        <p>Join thousands of community members making their neighborhoods safer. Download SafeSpora today!</p>
      </div>
      <div class="footer">
        <p>SafeSpora - Building Safer Communities Together</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `,
};
