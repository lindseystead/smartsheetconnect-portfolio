/**
 * Validation Constants and Helpers
 *
 * Defines max lengths and validation rules for setup wizard fields
 * to prevent layout breaking and ensure data quality.
 *
 * @author Lindsey Stead
 * @module client/lib/validation
 */

/**
 * Maximum field lengths matching backend validation
 */
export const FIELD_MAX_LENGTHS = {
  // Branding
  companyName: 255,
  logo: 500,
  primaryColor: 20,
  secondaryColor: 20,
  siteUrl: 500,

  // Content - Hero
  heroTitle: 200,
  heroDescription: 1000,
  heroCtaText: 100,
  heroSecondaryCtaText: 100,
  heroTertiaryCtaText: 100,

  // Content - Form
  formTitle: 200,
  formDescription: 1000,
  formSubmitText: 100,

  // Header/Footer
  headerCtaText: 100,
  footerDescription: 1000,
  navigationLabel: 50,

  // SEO
  pageTitle: 100,
  metaDescription: 300,
  ogTitle: 100,
  ogDescription: 300,
  keywords: 200,

  // Analytics
  googleAnalyticsId: 50,
  googleTagManagerId: 50,
  facebookPixelId: 50,
  linkedinInsightTag: 50,
  customAnalyticsScript: 5000,

  // Social Links
  socialLink: 500,

  // URLs
  url: 500,
} as const;

/**
 * Recommended field lengths for optimal display
 */
export const FIELD_RECOMMENDED_LENGTHS = {
  companyName: 50, // Fits in header on mobile
  heroTitle: 60, // 1-2 lines on mobile
  heroDescription: 150, // 2-3 lines on mobile
  formTitle: 50,
  formDescription: 150,
  navigationLabel: 20, // Fits in header nav
  footerDescription: 200,
  metaDescription: 160, // Optimal for search results
} as const;

/**
 * Validates if a value exceeds max length
 */
export function exceedsMaxLength(field: keyof typeof FIELD_MAX_LENGTHS, value: string): boolean {
  const maxLength = FIELD_MAX_LENGTHS[field];
  return value.length > maxLength;
}

/**
 * Gets remaining characters for a field
 */
export function getRemainingChars(field: keyof typeof FIELD_MAX_LENGTHS, value: string): number {
  const maxLength = FIELD_MAX_LENGTHS[field];
  return Math.max(0, maxLength - value.length);
}

/**
 * Gets character count display text
 */
export function getCharCountText(field: keyof typeof FIELD_MAX_LENGTHS, value: string): string {
  const current = value.length;
  const max = FIELD_MAX_LENGTHS[field];
  const remaining = getRemainingChars(field, value);
  const isWarning = remaining < max * 0.1; // Warning when < 10% remaining
  const isError = remaining < 0;

  if (isError) {
    return `${current}/${max} (${Math.abs(remaining)} over limit)`;
  }
  if (isWarning) {
    return `${current}/${max} (${remaining} remaining)`;
  }
  return `${current}/${max}`;
}

/**
 * Validates hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validation helpers for UX feedback
 */
export const validateTitle = (value: string): { valid: boolean; suggestion?: string } => {
  if (!value) return { valid: false, suggestion: "Title is required" };
  if (value.length < 5) return { valid: false, suggestion: "Title should be at least 5 characters" };
  if (value.length > 60) return { valid: false, suggestion: "Title should be under 60 characters for best display" };
  return { valid: true };
};

export const validateDescription = (value: string): { valid: boolean; suggestion?: string } => {
  if (!value) return { valid: false, suggestion: "Description is required" };
  if (value.length < 10) return { valid: false, suggestion: "Description should be at least 10 characters" };
  if (value.length > 300) return { valid: false, suggestion: "Description should be under 300 characters" };
  return { valid: true };
};

