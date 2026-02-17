import * as EmailValidator from 'email-validator';
import disposableDomains from 'disposable-email-domains';

// List of common spam domains (you can expand this)
const spamDomains = [
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  '10minutemail.com',
  'throwawaymail.com',
  'yopmail.com',
  'sharklasers.com',
  'grr.la',
  'mailcatch.com',
  'spam4.me',
  'trashmail.com',
  'temp-mail.org',
  'fakeinbox.com',
  'maildrop.cc',
  'getnada.com',
  'tmpmail.net',
  'discard.email',
  'emailondeck.com',
  'mohmal.com',
  ' Guerrillamail',
];

// Combine with disposable-email-domains package
const allBlockedDomains = [...new Set([...spamDomains, ...disposableDomains])];

export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
  suggestions?: string[];
}

export function validateEmail(email: string): EmailValidationResult {
  // Basic format validation
  if (!EmailValidator.validate(email)) {
    return {
      valid: false,
      reason: 'Invalid email format',
    };
  }

  // Check length
  if (email.length > 254) {
    return {
      valid: false,
      reason: 'Email is too long',
    };
  }

  // Extract domain
  const domain = email.split('@')[1].toLowerCase();

  // Check if domain is blocked (disposable/temporary)
  if (allBlockedDomains.includes(domain)) {
    return {
      valid: false,
      reason: 'Temporary or disposable email addresses are not allowed',
      suggestions: ['Please use a permanent email address'],
    };
  }

  // Check for common typos in popular domains
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const suggestions: string[] = [];
  
  for (const commonDomain of commonDomains) {
    if (domain.includes(commonDomain.split('.')[0]) && domain !== commonDomain) {
      suggestions.push(`Did you mean @${commonDomain}?`);
    }
  }

  // Check for common spam patterns
  const spamPatterns = [
    /test/i,
    /spam/i,
    /fake/i,
    /noreply/i,
    /no-reply/i,
    /mailer-daemon/i,
    /postmaster/i,
  ];

  const localPart = email.split('@')[0].toLowerCase();
  for (const pattern of spamPatterns) {
    if (pattern.test(localPart)) {
      return {
        valid: false,
        reason: 'This email appears to be a test or spam address',
      };
    }
  }

  // Check for consecutive dots or special characters
  if (/\.{2,}/.test(localPart) || /[!#$%^&*()+]/.test(localPart)) {
    return {
      valid: false,
      reason: 'Email contains invalid characters',
    };
  }

  return { 
    valid: true,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

// MX Record validation (optional - requires DNS lookup)
export async function validateEmailWithMX(email: string): Promise<EmailValidationResult> {
  const basicValidation = validateEmail(email);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  const domain = email.split('@')[1];

  try {
    // Note: This requires a DNS lookup API or a service
    // You can use a service like https://dns.google/resolve
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await response.json();
    
    if (!data.Answer || data.Answer.length === 0) {
      return {
        valid: false,
        reason: 'Domain does not accept emails',
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('MX validation error:', error);
    // Fall back to basic validation if MX check fails
    return { valid: true };
  }
}