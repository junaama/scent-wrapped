import { NextResponse } from "next/server";
import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

interface ValidateEmailRequest {
  email: string;
}

// Basic email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Common disposable email domains to block
const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "fakeinbox.com",
  "trashmail.com",
  "10minutemail.com",
  "temp-mail.org",
];

/**
 * POST /api/email/validate
 * Validates an email address format and checks if the domain has valid MX records
 */
export async function POST(request: Request) {
  try {
    const body: ValidateEmailRequest = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { valid: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check basic format
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { valid: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Extract domain
    const domain = normalizedEmail.split("@")[1];

    // Check for disposable email domains
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { valid: false, error: "Please use a non-disposable email address" },
        { status: 400 }
      );
    }

    // Check MX records to verify domain can receive emails
    try {
      const mxRecords = await resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return NextResponse.json(
          { valid: false, error: "This email domain doesn't appear to exist" },
          { status: 400 }
        );
      }
    } catch {
      // DNS lookup failed - domain likely doesn't exist
      return NextResponse.json(
        { valid: false, error: "This email domain doesn't appear to exist" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("[Email Validate] Error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate email" },
      { status: 500 }
    );
  }
}
