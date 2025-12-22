/**
 * Live Preview Component for Setup Wizard
 *
 * Displays a lightweight preview of the homepage as the user edits fields.
 *
 * @author Lindsey Stead
 */

import { useMemo, useState, useEffect, useRef } from "react";
import { Zap } from "lucide-react";

interface PreviewProps {
  branding: {
    companyName: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
  content: {
    heroTitle: string;
    heroDescription: string;
    heroCtaText: string;
    heroSecondaryCtaText: string;
    formTitle: string;
    formDescription: string;
    formSubmitText: string;
  };
  headerFooter?: {
    headerCtaText?: string;
  };
}

export function SetupPreview({ branding, content, headerFooter }: PreviewProps): JSX.Element {
  const previewData = useMemo(() => {
    return {
      companyName: branding.companyName || "Your Company",
      logo: branding.logo || "/assets/SmartSheetConnect.png",
      primaryColor: branding.primaryColor || "#2563eb",
      secondaryColor: branding.secondaryColor || "#10B981",
      heroTitle: content.heroTitle || "Welcome to Your Company",
      heroDescription: content.heroDescription || "Your description will appear here",
      heroCtaText: content.heroCtaText || "Get Started",
      heroSecondaryCtaText: content.heroSecondaryCtaText || "Learn More",
      formTitle: content.formTitle || "Get in Touch",
      formDescription: content.formDescription || "Fill out the form below",
      formSubmitText: content.formSubmitText || "Send Message",
      headerCtaText: headerFooter?.headerCtaText || "Get Started",
    };
  }, [branding.companyName, branding.logo, branding.primaryColor, branding.secondaryColor, content.heroTitle, content.heroDescription, content.heroCtaText, content.heroSecondaryCtaText, content.formTitle, content.formDescription, content.formSubmitText, headerFooter?.headerCtaText]);

  // Stabilize logo URL to prevent flashing
  const [stableLogoUrl, setStableLogoUrl] = useState(previewData.logo);
  const [hasLogoError, setHasLogoError] = useState(false);
  const logoUrlRef = useRef(previewData.logo);
  const errorCountRef = useRef(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only update if the logo URL actually changed
    if (previewData.logo !== logoUrlRef.current) {
      logoUrlRef.current = previewData.logo;
      errorCountRef.current = 0;
      // Clear any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      // Batch state updates to avoid synchronous setState in effect
      updateTimeoutRef.current = setTimeout(() => {
        setHasLogoError(false);
        setStableLogoUrl(previewData.logo);
      }, 0);
    }
    // Cleanup timeout on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [previewData.logo]);

  // Check if we have a valid logo (not empty and not default placeholder)
  const hasValidLogo = stableLogoUrl &&
    stableLogoUrl !== "/assets/SmartSheetConnect.png" &&
    stableLogoUrl.trim() !== "" &&
    !hasLogoError;

  return (
    <div className="w-full h-full bg-white rounded-lg border border-border shadow-lg overflow-hidden">
      <div className="h-full overflow-y-auto">
        {/* Header Preview */}
        <header className="border-b border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {hasValidLogo ? (
                <img
                  src={stableLogoUrl}
                  alt={previewData.companyName}
                  className="h-8 w-8 object-contain flex-shrink-0 rounded-lg"
                  onError={() => {
                    errorCountRef.current += 1;
                    if (errorCountRef.current >= 1) {
                      setHasLogoError(true);
                    }
                  }}
                  onLoad={() => {
                    // Reset error count on successful load
                    errorCountRef.current = 0;
                    setHasLogoError(false);
                  }}
                />
              ) : (
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${previewData.primaryColor}15`,
                    color: previewData.primaryColor
                  }}
                >
                  <Zap className="h-4 w-4" />
                </div>
              )}
              <span className="font-semibold text-sm break-words min-w-0" title={previewData.companyName}>
                {previewData.companyName}
              </span>
            </div>
            <button
              className="text-xs px-3 py-1 rounded-md"
              style={{
                backgroundColor: previewData.primaryColor,
                color: "white"
              }}
            >
              {previewData.headerCtaText}
            </button>
          </div>
        </header>

        {/* Hero Section Preview */}
        <section className="p-6 text-center space-y-4" style={{ backgroundColor: `${previewData.primaryColor}10` }}>
          <h1
            className="text-2xl font-bold"
            style={{ color: previewData.primaryColor }}
          >
            {previewData.heroTitle}
          </h1>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {previewData.heroDescription}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              className="text-xs px-4 py-2 rounded-md text-white"
              style={{ backgroundColor: previewData.primaryColor }}
            >
              {previewData.heroCtaText}
            </button>
            {previewData.heroSecondaryCtaText && (
              <button
                className="text-xs px-4 py-2 rounded-md border"
                style={{
                  borderColor: previewData.secondaryColor,
                  color: previewData.secondaryColor
                }}
              >
                {previewData.heroSecondaryCtaText}
              </button>
            )}
          </div>
        </section>

        {/* Form Section Preview */}
        <section className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <h2 className="font-semibold text-lg">{previewData.formTitle}</h2>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {previewData.formDescription}
            </p>
          </div>
          <div className="space-y-3 border border-border rounded-lg p-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Name</div>
              <div className="h-8 bg-muted rounded border"></div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="h-8 bg-muted rounded border"></div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Message</div>
              <div className="h-16 bg-muted rounded border"></div>
            </div>
            <button
              className="w-full text-xs py-2 rounded-md text-white"
              style={{ backgroundColor: previewData.primaryColor }}
            >
              {previewData.formSubmitText}
            </button>
          </div>
        </section>

        {/* Footer Preview */}
        <footer className="border-t border-border p-4 bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            © {new Date().getFullYear()} {previewData.companyName}
          </p>
        </footer>
      </div>
    </div>
  );
}

