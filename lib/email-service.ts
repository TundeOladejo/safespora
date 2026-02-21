// lib/email-service.ts
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private config = {
    apiKey: process.env.ZEPTOMAIL_API_KEY,
    apiUrl: 'https://api.zeptomail.in/v1.1/email',
    fromEmail: process.env.ZEPTOMAIL_FROM_EMAIL || 'noreply@safespora.com',
    fromName: process.env.ZEPTOMAIL_FROM_NAME || 'SafeSpora Admin',
  };

  /**
   * Send an email using ZeptoMail REST API
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
    try {
      if (!options.to || !options.subject || !options.html) {
        throw new Error('Missing required email fields: to, subject, or html');
      }

      if (!this.config.apiKey) {
        throw new Error('ZeptoMail API key is not configured');
      }

      const textContent = options.text || this.htmlToText(options.html);

      console.log('📧 Sending email via ZeptoMail:', {
        to: options.to,
        subject: options.subject,
      });

      return await this.sendViaZeptoMailAPI({ ...options, text: textContent });
    } catch (error: any) {
      console.error('❌ Email sending failed:', error.message || error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  private async sendViaZeptoMailAPI(options: SendEmailOptions): Promise<EmailResponse> {
    const cleanApiKey = this.config.apiKey!.trim().replace(/^['"]|['"]$/g, '');

    const recipients = (Array.isArray(options.to) ? options.to : [options.to])
      .map(email => ({
        email_address: {
          address: email.trim().toLowerCase(),
        }
      }));

    const requestBody: any = {
      from: {
        address: this.config.fromEmail.trim().toLowerCase(),
        name: this.config.fromName,
      },
      to: recipients,
      subject: options.subject,
      htmlbody: options.html,
      textbody: options.text,
      track_clicks: true,
      track_opens: true,
      client_reference: `safespora_admin_${Date.now()}`,
    };

    if (options.replyTo) {
      requestBody.reply_to = [{
        address: options.replyTo.trim().toLowerCase()
      }];
    }

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': cleanApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let data: any = {};
    
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
      }
    }

    if (!response.ok) {
      throw new Error(
        data.error?.message || data.message || `ZeptoMail API error (${response.status})`
      );
    }

    console.log('✅ Email sent successfully');

    return {
      success: true,
      messageId: data.data?.[0]?.message_id || data.request_id || `zeptomail-${Date.now()}`,
    };
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}

export const emailService = new EmailService();
