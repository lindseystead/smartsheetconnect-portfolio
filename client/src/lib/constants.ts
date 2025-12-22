/**
 * Shared Constants
 *
 * Centralized constants for demo data and configuration.
 * Used across components to ensure consistency and reduce repetition.
 *
 * @author Lindsey Stead
 * @module client/lib/constants
 */

import type { EnrichmentData, LeadScore, SourceData } from "@shared/schema";

/**
 * Demo lead data for UI demonstrations.
 * Matches the structure of actual lead submissions with enrichment, scoring, and source tracking.
 */
export const LEAD_DEMO = {
  name: "John Smith",
  email: "john@acme.com",
  phone: "+1 (555) 123-4567",
  message: "I'm interested in your services, ready to discuss pricing and implementation timeline.",

  enrichment: {
    companyName: "Acme",
    companyDomain: "acme.com",
    industry: null,
    employeeCount: null,
    location: null,
    website: "https://acme.com",
  } as EnrichmentData,

  score: {
    score: 85,
    factors: {
      messageIntent: 25,
      messageUrgency: 10,
      emailDomain: 20,
      messageLength: 10,
      phoneProvided: 10,
    },
    reasoning: "High buying intent, urgent request, company email, phone provided, detailed message",
  } as LeadScore,

  source: {
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "summer-campaign",
    utmTerm: null,
    utmContent: null,
    referrer: "https://www.google.com",
    landingPage: "/contact",
    source: "google / cpc (summer-campaign)",
  } as SourceData,
} as const;

/**
 * Animation variants for consistent motion throughout the app.
 * Follows Linear.app-style smooth, subtle animations.
 */
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
} as const;

/**
 * Animation timing constants for consistent durations.
 */
export const ANIMATION_TIMING = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
} as const;

/**
 * Common transition configurations.
 */
export const TRANSITIONS = {
  smooth: {
    duration: ANIMATION_TIMING.normal,
    ease: [0.4, 0, 0.2, 1], // Custom cubic bezier for smooth motion
  },
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
  gentle: {
    duration: ANIMATION_TIMING.slow,
    ease: [0.25, 0.1, 0.25, 1],
  },
} as const;

