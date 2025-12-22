/**
 * Shared TypeScript types for client-side code.
 *
 * @author Lindsey Stead
 * @module client/lib/types
 */

/**
 * Extended Error type for API errors with HTTP status code.
 */
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Branding configuration payload for API requests.
 */
export interface BrandingConfigPayload {
  branding?: {
    companyName?: string;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    siteUrl?: string;
  };
  content?: {
    hero?: {
      title?: string;
      description?: string;
      ctaText?: string;
      secondaryCtaText?: string;
      tertiaryCtaText?: string;
      benefits?: Array<{ text: string }>;
    };
    form?: {
      title?: string;
      description?: string;
      submitText?: string;
    };
  };
  header?: {
    ctaText?: string;
    navigation?: Array<{
      label: string;
      sectionId?: string;
      href?: string;
    }>;
  };
  footer?: {
    description?: string;
    socialLinks?: Record<string, string | undefined>;
    quickLinks?: Array<{
      label: string;
      sectionId?: string;
      href?: string;
    }>;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
  };
  seo?: {
    pageTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: string;
    twitterImage?: string;
    canonicalUrl?: string;
    keywords?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    linkedinInsightTag?: string;
    customAnalyticsScript?: string;
  };
}

/**
 * Lead submission with optional honeypot field.
 */
export interface LeadSubmissionWithHoneypot {
  name: string;
  email: string;
  phone?: string;
  message: string;
  _honeypot?: string;
}
