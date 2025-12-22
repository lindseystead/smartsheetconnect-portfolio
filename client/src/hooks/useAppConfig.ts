/**
 * useAppConfig Hook
 *
 * Fetches application configuration (branding, content) from the API.
 *
 * @author Lindsey Stead
 * @module client/hooks/useAppConfig
 */

import { useQuery } from "@tanstack/react-query";

export interface AppConfig {
  branding: {
    companyName: string;
    logo?: string;
    favicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
    siteUrl?: string;
  };
  content: {
    hero: {
      title: string;
      description: string;
      ctaText: string;
      secondaryCtaText?: string;
      tertiaryCtaText?: string;
      benefits?: Array<{
        text: string;
      }>;
    };
    form: {
      title: string;
      description: string;
      submitText: string;
    };
    features?: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  header?: {
    navigation?: Array<{
      label: string;
      sectionId?: string;
      href?: string;
    }>;
    ctaText?: string;
  };
  footer?: {
    description?: string;
    socialLinks?: {
      github?: string;
      twitter?: string;
      linkedin?: string;
      facebook?: string;
      instagram?: string;
      youtube?: string;
      tiktok?: string;
      pinterest?: string;
      snapchat?: string;
      discord?: string;
      [key: string]: string | undefined;
    };
    quickLinks?: Array<{
      label: string;
      href?: string;
      sectionId?: string;
    }>;
    resources?: Array<{
      label: string;
      href: string;
    }>;
    copyright?: string;
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
 * Default configuration fallback when API fails.
 * Ensures app always has valid config to render.
 */
const DEFAULT_CONFIG: AppConfig = {
  branding: {
    companyName: "SmartSheetConnect",
    logo: "/assets/SmartSheetConnect.png",
    primaryColor: "#2563eb",
  },
  content: {
    hero: {
      title: "SmartSheetConnect",
      description: "Automated lead capture that logs to Google Sheets and sends notifications",
      ctaText: "Get Started",
      secondaryCtaText: "Learn More",
      benefits: [],
    },
    form: {
      title: "Get in Touch",
      description: "Fill out the form below and we'll get back to you as soon as possible",
      submitText: "Send Message",
    },
  },
  header: {
    navigation: [],
    ctaText: "Get Started",
  },
  footer: {
    description: "Professional lead capture automation for businesses that value efficiency and never missing an opportunity.",
    socialLinks: {},
    quickLinks: [],
    resources: [],
    copyright: `© ${new Date().getFullYear()} SmartSheetConnect. All rights reserved.`,
  },
};

/**
 * Hook to fetch application configuration with robust error handling.
 *
 * Features:
 * - Automatic retry on transient failures
 * - Fallback to default config if API fails
 * - Proper error handling and logging
 * - Request timeout protection
 *
 * @param {string} baseUrl - Optional base URL for API (for embedding)
 * @returns {Object} Configuration data and loading state
 */
export function useAppConfig(baseUrl?: string) {
  const url = baseUrl ? `${baseUrl}/api/v1/config` : "/api/v1/config";

  return useQuery<AppConfig>({
    queryKey: ["app-config", baseUrl],
    queryFn: async ({ signal }) => {
      // Use the signal from React Query for cancellation
      // Create AbortController for timeout that respects React Query's signal
      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout | null = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Combine signals: abort if either React Query cancels or timeout occurs
      if (signal) {
        signal.addEventListener('abort', () => {
          if (timeoutId) clearTimeout(timeoutId);
          controller.abort();
        });
      }

      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });

        // Clear timeout on successful fetch
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Check if request was aborted
        if (signal?.aborted || controller.signal.aborted) {
          throw new Error('Request was cancelled');
        }

        if (!res.ok) {
          // If server error, log but return default config
          if (res.status >= 500) {
            console.warn(`Config API returned ${res.status}, using default config`);
            return DEFAULT_CONFIG;
          }
          // For client errors (4xx), throw to trigger retry
          throw new Error(`Failed to load configuration: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // Validate response structure
        if (!data || typeof data !== 'object') {
          console.warn('Invalid config response, using default config');
          return DEFAULT_CONFIG;
        }

        // Ensure required fields exist
        if (!data.branding || !data.content) {
          console.warn('Config missing required fields, using default config');
          return { ...DEFAULT_CONFIG, ...data };
        }

        return data as AppConfig;
      } catch (error) {
        // Clear timeout in case of error
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Handle timeout, network errors, etc.
        if (error instanceof Error) {
          // If request was cancelled, don't log (component unmounted or query cancelled)
          if (error.name === 'AbortError' && (signal?.aborted || controller.signal.aborted)) {
            // Request was cancelled - this is expected when component unmounts
            // Return default config silently
            return DEFAULT_CONFIG;
          }
          if (error.name === 'AbortError') {
            console.warn('Config API request timed out, using default config');
          } else if (error.message.includes('fetch') || error.message.includes('cancelled')) {
            // Network error or cancellation - use default config
            return DEFAULT_CONFIG;
          } else {
            console.warn(`Config API error: ${error.message}, using default config`);
          }
        }

        // Return default config instead of throwing
        // This ensures the app always renders, even if config API is down
        return DEFAULT_CONFIG;
      }
    },
    staleTime: 0, // Always refetch when invalidated (for dynamic rebranding)
    refetchOnWindowFocus: true, // Refetch when window regains focus (to catch branding changes)
    refetchOnMount: true, // Always refetch on component mount (to catch branding changes)
    refetchInterval: false, // Never auto-refetch (config is static unless changed)
    retry: (failureCount, error) => {
      // Retry up to 1 time only (reduced from 2 to minimize requests)
      if (failureCount < 1) {
        // Only retry on network errors or 5xx server errors
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('network') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('500') ||
              errorMessage.includes('503') ||
              errorMessage.includes('502')) {
            return true;
          }
        }
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Reduced max delay to 5s
    // Always return default config on error instead of throwing
    throwOnError: false,
  });
}

