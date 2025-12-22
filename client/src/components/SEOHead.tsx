/**
 * SEO Head Component
 *
 * Dynamically renders meta tags, Open Graph tags, and Twitter Card tags
 * based on configuration from the setup wizard.
 *
 * @author Lindsey Stead
 * @module client/components/SEOHead
 */

import { Helmet } from "react-helmet-async";
import { useAppConfig } from "@/hooks/useAppConfig";

export function SEOHead(): JSX.Element {
  const { data: config } = useAppConfig();
  const seo = config?.seo;
  const branding = config?.branding;

  // Default values
  const pageTitle = seo?.pageTitle || branding?.companyName || "SmartSheetConnect";
  const metaDescription = seo?.metaDescription || "Professional lead capture automation for businesses that value efficiency and never missing an opportunity.";
  const ogImage = seo?.ogImage || branding?.logo || "/assets/SmartSheetConnect.png";
  const ogTitle = seo?.ogTitle || pageTitle;
  const ogDescription = seo?.ogDescription || metaDescription;
  const canonicalUrl = seo?.canonicalUrl || branding?.siteUrl;
  const keywords = seo?.keywords;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      {branding?.siteUrl && <meta property="og:url" content={branding.siteUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content={seo?.twitterCard || "summary_large_image"} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={seo?.twitterImage || ogImage} />
    </Helmet>
  );
}

