// lib/email-service.ts
import { SendMailClient } from "zeptomail";

// Define proper types for ZeptoMail responses
interface ZeptoMailResponse {
  data?: Array<{
    message_id?: string;
    [key: string]: any;
  }>;
  message?: string;
  error?: {
    message: string;
    code?: string;
  };
  request_id?: string;
  [key: string]: any;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

class EmailService {
  private client: SendMailClient;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const url = "https://api.zeptomail.com/v1.1/email";
    // The token should include the "Zoho-enczapikey" prefix as shown in the example
    const token = process.env.ZEPTOMAIL_API_KEY || "";
    this.client = new SendMailClient({ url, token });
    this.fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || 'noreply@safespora.com';
    this.fromName = process.env.ZEPTOMAIL_FROM_NAME || 'SafeSpora Admin';
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
    try {
      if (!options.to || !options.subject || !options.html) {
        throw new Error('Missing required email fields: to, subject, or html');
      }

      // Format recipients according to the official example
      const recipients = (Array.isArray(options.to) ? options.to : [options.to])
        .map(email => ({
          email_address: {
            address: email.trim().toLowerCase(),
            name: "" // You can add name if available
          }
        }));

      // Build request according to official documentation
      const mailRequest: any = {
        from: {
          address: this.fromEmail,
          name: this.fromName
        },
        to: recipients,
        subject: options.subject,
        htmlbody: options.html,
      };

      // Add text version if provided
      if (options.text) {
        mailRequest.textbody = options.text;
      } else {
        // Generate text version from HTML
        mailRequest.textbody = this.htmlToText(options.html);
      }

      // Add reply-to if provided
      if (options.replyTo) {
        mailRequest.reply_to = [
          {
            address: options.replyTo.trim().toLowerCase(),
            name: ""
          }
        ];
      }

      // Add tracking options (optional but recommended)
      mailRequest.track_clicks = true;
      mailRequest.track_opens = true;
      mailRequest.client_reference = `safespora_admin_${Date.now()}`;

      // Use the official client to send - properly type the response
      const response = await this.client.sendMail(mailRequest) as ZeptoMailResponse;
      
      // Extract message ID safely - handle different response formats
      let messageId: string | undefined;
      
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        messageId = response.data[0]?.message_id;
      } else if (response?.request_id) {
        messageId = response.request_id;
      } else if (response?.message_id) {
        messageId = response.message_id;
      } else {
        // If we can't find a message ID, create a fallback
        messageId = `sent-${Date.now()}`;
        console.log('Could not extract message ID from response, using fallback');
      }
      
      return {
        success: true,
        messageId,
        details: response // Include full response for debugging
      };

    } catch (error: any) {
      console.error('❌ Email sending failed:', {
        error: error.message,
        response: error.response?.data || error.response || error,
        stack: error.stack
      });

      // Extract detailed error information
      let errorMessage = error.message || 'Failed to send email';
      let errorDetails = error;
      
      // Check if error has response data
      if (error.response?.data) {
        errorDetails = error.response.data;
        errorMessage = error.response.data.message || error.response.data.error?.message || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
        details: errorDetails
      };
    }
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