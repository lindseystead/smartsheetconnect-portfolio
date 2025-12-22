/**
 * Shared validation schemas and types.
 *
 * Zod schemas and TypeScript types shared between client and server
 * for runtime validation and compile-time type safety.
 *
 * @author Lindsey Stead
 */

import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

// ============================================================================
// SANITIZATION UTILITIES
// ============================================================================

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Remove all HTML tags
    ALLOWED_ATTR: [], // Remove all attributes
  }).trim();
}

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Phone number validation regex.
 * - With spaces: 555 123 4567
 * - Plain digits: 5551234567
 *
 * Pattern breakdown:
 * - ^[\+]? - Optional leading + for international format
 * - [(]? - Optional opening parenthesis
 * - [0-9]{3} - Three digits (area code)
 * - [)]? - Optional closing parenthesis
 * - [-\s\.]? - Optional separator (dash, space, or dot)
 * - [0-9]{3} - Three digits (exchange code)
 * - [-\s\.]? - Optional separator
 * - [0-9]{4,6} - Four to six digits (subscriber number)
 * - $ - End of string
 */
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

// ============================================================================
// LEAD SUBMISSION SCHEMA
// ============================================================================

/**
 * Zod schema for lead submission validation.
 *
 * Validates lead form submission data with the following rules:
 * - name: Required string, 1-100 characters, trimmed
 * - email: Required valid email, max 255 chars, lowercase and trimmed
 * - phone: Optional string, must match phone format if provided
 * - message: Required string, 1-1000 characters, trimmed
 *
 * This schema is used on both client (pre-submission validation) and server
 * (post-submission validation) to ensure data integrity.
 */
export const leadSubmissionSchema = z.object({
  // Name: Required, must be 1-100 characters after trimming whitespace
  // Sanitized to prevent XSS attacks
  name: z.string()
    .min(1, "Name is required") // Must have at least 1 character
    .max(100, "Name is too long") // Maximum 100 characters
    .transform(sanitizeInput) // Sanitize to prevent XSS
    .pipe(z.string().min(1, "Name is required")), // Re-validate after sanitization

  // Email: Required, must be valid email format, max 255 chars, lowercase
  // Validated for email injection attacks (no newlines) and sanitized for XSS
  email: z.string()
    .trim() // Remove leading/trailing whitespace first
    .email("Please enter a valid email address") // Must match email regex pattern
    .max(255, "Email is too long") // Maximum 255 characters (RFC 5321 standard)
    .refine((val) => !/[\r\n]/.test(val), "Email cannot contain newlines") // Prevent email injection
    .transform((val) => sanitizeInput(val).toLowerCase()), // Sanitize and lowercase

  // Phone: Optional, but if provided must match phone number format
  phone: z.string()
    .optional() // Phone number is not required
    .refine((val) => !val || phoneRegex.test(val.replace(/\s/g, "")), {
      // Custom validation: if phone is provided, it must match phone regex
      // Remove all spaces before testing to allow flexible formatting
      message: "Please enter a valid phone number",
    }),

  // Message: Required, must be 1-1000 characters after trimming
  // Sanitized to prevent XSS attacks
  message: z.string()
    .min(1, "Message is required") // Must have at least 1 character
    .max(1000, "Message is too long") // Maximum 1000 characters
    .transform(sanitizeInput) // Sanitize to prevent XSS
    .pipe(z.string().min(1, "Message is required").max(1000, "Message is too long")), // Re-validate after sanitization
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * TypeScript type for lead submission data.
 *
 * Derived from leadSubmissionSchema using Zod's type inference.
 * This provides compile-time type safety that matches runtime validation.
 *
 * @example
 * const lead: LeadSubmission = {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   phone: "555-1234", // Optional
 *   message: "I'm interested in your services"
 * };
 */
export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;

/**
 * Enrichment data structure.
 */
export interface EnrichmentData {
  companyName: string | null;
  companyDomain: string | null;
  industry: string | null;
  employeeCount: string | null;
  location: string | null;
  website: string | null;
}

/**
 * Lead score structure.
 */
export interface LeadScore {
  score: number; // 0-100
  factors: {
    messageIntent: number;
    messageUrgency: number;
    emailDomain: number;
    messageLength: number;
    phoneProvided: number;
  };
  reasoning: string;
}

/**
 * Source tracking data structure.
 */
export interface SourceData {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrer: string | null;
  landingPage: string | null;
  source: string; // Combined source string
}

/**
 * API response type for lead submission endpoint.
 *
 * Used for both success and error responses from POST /api/submit-lead.
 *
 * @property success - Whether the submission was successful
 * @property message - Human-readable status message
 * @property rowNumber - Optional row number in Google Sheets (only on success)
 * @property isDuplicate - Whether this lead was a duplicate (only present if duplicate detected)
 * @property existingRowNumber - Row number of existing lead if duplicate (only present if duplicate)
 * @property enrichment - Enriched company data (optional)
 * @property score - Lead score and factors (optional)
 * @property source - Source tracking data (optional)
 */
export interface LeadSubmissionResponse {
  /** Whether the operation was successful */
  success: boolean;

  /** Human-readable status message */
  message: string;

  /**
   * Row number in Google Sheets where the lead was added.
   * Only present when success is true and lead was added.
   */
  rowNumber?: number;

  /**
   * Whether this lead submission was a duplicate (email already exists).
   * Only present when duplicate is detected.
   */
  isDuplicate?: boolean;

  /**
   * Row number of the existing lead if duplicate was detected.
   * Only present when isDuplicate is true.
   */
  existingRowNumber?: number;

  /**
   * Enriched company data from email domain.
   * Only present when enrichment is enabled and successful.
   */
  enrichment?: EnrichmentData;

  /**
   * Lead score (0-100) with factors and reasoning.
   * Only present when scoring is enabled.
   */
  score?: LeadScore;

  /**
   * Source tracking data (UTM parameters, referrer, etc.).
   * Always present if available.
   */
  source?: SourceData;
}
