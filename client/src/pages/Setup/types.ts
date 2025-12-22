/**
 * Type definitions for Setup wizard.
 *
 * @author Lindsey Stead
 * @module client/pages/Setup/types
 */

export interface SetupStatus {
  configured: boolean;
  missing: string[];
  details: Record<string, boolean>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface BrandingState {
  companyName: string;
  logo: string;
  logoFile: File | null;
  logoPreview: string;
  primaryColor: string;
  secondaryColor: string;
  siteUrl: string;
}

export interface ContentState {
  heroTitle: string;
  heroDescription: string;
  heroCtaText: string;
  heroSecondaryCtaText: string;
  heroTertiaryCtaText: string;
  heroBenefits: string[];
  formTitle: string;
  formDescription: string;
  formSubmitText: string;
}

export interface HeaderFooterState {
  headerCtaText: string;
  navigation: Array<{ label: string; sectionId: string; href?: string }>;
  footerDescription: string;
  socialGithub: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  socialTiktok: string;
  socialPinterest: string;
  socialSnapchat: string;
  socialDiscord: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

export interface NotificationPreferences {
  wantsEmail: boolean;
  wantsSlack: boolean;
  wantsWebhook: boolean;
}

export interface CredentialsState {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NOTIFICATION_EMAIL: string;
  SLACK_WEBHOOK_URL: string;
  WEBHOOK_URL: string;
}

export interface EmailTemplate {
  subject: string;
  introMessage: string;
  closingSignature: string;
}
