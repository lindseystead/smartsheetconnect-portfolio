/**
 * Setup Wizard Page
 *
 * Step-by-step guided setup flow for non-technical users.
 *
 * @author Lindsey Stead
 * @module client/pages/Setup
 */

/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCsrfToken } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, XCircle, Loader2, ExternalLink, AlertCircle, Mail, MessageSquare, ArrowRight, ArrowLeft, Sparkles, CheckCircle, Webhook, Reply, X, FileSpreadsheet, Search, BarChart3, Eye, EyeOff } from "lucide-react";
import { FIELD_MAX_LENGTHS, getCharCountText, getRemainingChars, exceedsMaxLength, validateDescription } from "@/lib/validation";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SetupPreview } from "@/components/SetupPreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SETUP_STORAGE_KEY, safeLocalStorage } from "./Setup/utils/localStorage";
import { WelcomeStep } from "./Setup/steps/WelcomeStep";
import { CompletionStep } from "./Setup/steps/CompletionStep";
import { SetupCompleteCard } from "./Setup/components/SetupCompleteCard";
import type { SetupStatus, ValidationResult } from "./Setup/types";

/* eslint-disable react/no-unescaped-entities */
import type { BrandingConfigPayload } from "@/lib/types";

function SetupWizard() {
  // Track if user wants to restart/edit setup even when configured
  const [restartSetup, setRestartSetup] = useState(false);

  // Restore step from localStorage on mount with robust error handling
  const [step, setStep] = useState(() => {
    const saved = safeLocalStorage.getItem(SETUP_STORAGE_KEY);
    if (saved) {
      const savedStep = parseInt(saved, 10);
      // Validate step is within valid range (1-9) and is a valid number
      if (!isNaN(savedStep) && savedStep >= 1 && savedStep <= 9) {
        return savedStep;
      }
    }
    return 1;
  });

  // Save step to localStorage whenever it changes with robust error handling
  useEffect(() => {
    const success = safeLocalStorage.setItem(SETUP_STORAGE_KEY, step.toString());
    if (!success) {
      // Log warning only in development to avoid console spam
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to save setup progress to localStorage (may be in private browsing mode)');
      }
    }
  }, [step]);

  const [notificationPreferences, setNotificationPreferences] = useState({
    wantsEmail: true,
    wantsSlack: false,
    wantsWebhook: false,
  });

  // Calculate total steps based on preferences
  // Steps: 1 (Welcome), 2 (Branding), 3 (Content), 4 (Header/Footer), 5 (Notifications), 6 (Google Setup), 7 (Credentials), 8 (OAuth), 9 (Slack if enabled), 10 (Completion)
  // If Slack is wanted, add step 9 for Slack setup, then step 10 for completion
  // If no Slack, step 9 is completion
  const TOTAL_STEPS = notificationPreferences.wantsSlack ? 10 : 9;

  // Branding & Customization State
  const [branding, setBranding] = useState({
    companyName: "",
    logo: "",
    logoFile: null as File | null,
    logoPreview: "",
    primaryColor: "",
    secondaryColor: "",
    siteUrl: "",
  });

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  // Content Customization State
  const [content, setContent] = useState({
    heroTitle: "",
    heroDescription: "",
    heroCtaText: "",
    heroSecondaryCtaText: "",
    heroTertiaryCtaText: "",
    heroBenefits: ["Enterprise-ready security", "Real-time notifications", "Zero manual data entry"],
    formTitle: "",
    formDescription: "",
    formSubmitText: "",
  });

  // Header & Footer State
  const [headerFooter, setHeaderFooter] = useState({
    headerCtaText: "",
    navigation: [
      { label: "Features", sectionId: "features" },
      { label: "How It Works", sectionId: "how-it-works" },
      { label: "Contact Us", sectionId: "demo-form" },
    ],
    footerDescription: "",
    socialGithub: "",
    socialTwitter: "",
    socialLinkedin: "",
    socialFacebook: "",
    socialInstagram: "",
    socialYouTube: "",
    socialTikTok: "",
    socialPinterest: "",
    socialSnapchat: "",
    socialDiscord: "",
    privacyPolicyUrl: "",
    termsOfServiceUrl: "",
  });

  // SEO State
  const [seo, setSeo] = useState({
    pageTitle: "",
    metaDescription: "",
    ogImage: "",
    ogTitle: "",
    ogDescription: "",
    twitterCard: "",
    twitterImage: "",
    canonicalUrl: "",
    keywords: "",
  });

  // Analytics State
  const [analytics, setAnalytics] = useState({
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    linkedinInsightTag: "",
    customAnalyticsScript: "",
  });

  const [credentials, setCredentials] = useState({
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    NOTIFICATION_EMAIL: "",
    SLACK_WEBHOOK_URL: "",
    WEBHOOK_URL: "",
    ENABLE_SLACK_NOTIFICATIONS: "false",
    ENABLE_EMAIL_NOTIFICATIONS: "true",
    ENABLE_WEBHOOK_NOTIFICATIONS: "false",
    ENABLE_AUTO_RESPONDER: "false",
    // ORGANIZATION_NAME is auto-populated from branding.companyName (Step 2)
    ORGANIZATION_NAME: "",
    AUTO_RESPONDER_SUBJECT: "",
    AUTO_RESPONDER_BODY: "",
    // AI Scoring (optional)
    OPENAI_API_KEY: "",
    // Enrichment (optional)
    // Google Sheets (optional - auto-created if not provided)
    SPREADSHEET_ID: "",
  });

  // Track auto-responder preview
  const [showAutoResponderPreview, setShowAutoResponderPreview] = useState(false);

  // Track if we've been rate limited to stop polling
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Track webhook test state
  const [webhookTestState, setWebhookTestState] = useState<{
    testing: boolean;
    result: { valid: boolean; error?: string } | null;
  }>({ testing: false, result: null });

  // Track which webhook service the user wants to connect
  const [selectedWebhookService, setSelectedWebhookService] = useState<string | null>(null);

  // Preview state
  const [showPreview, setShowPreview] = useState(true);

  // Hide branding state
  const [hideBranding, setHideBranding] = useState(false);

  // Email template state
  const [emailTemplate, setEmailTemplate] = useState({
    subject: "",
    introMessage: "",
    closingSignature: "",
  });

  // Check setup status
  // Only poll when on OAuth step (step 8) to check if OAuth completed
  // Include step in query key so refetchInterval updates reactively when step changes
  const { data: setupStatus, refetch: refetchStatus } = useQuery<SetupStatus>({
    queryKey: ["setup-status", step], // Include step so query re-initializes when step changes
    queryFn: async (): Promise<SetupStatus> => {
      const res = await fetch("/api/v1/setup/status");
      if (!res.ok) {
        // If rate limited, stop polling and return default status
        if (res.status === 429) {
          setIsRateLimited(true);
          return { configured: false, missing: [], details: {} };
        }
        throw new Error(`Failed to check setup status: ${res.statusText}`);
      }
      // If we get a successful response, we're no longer rate limited
      setIsRateLimited(false);
      return res.json();
    },
    // Only poll on step 8 (OAuth) to check if OAuth completed, otherwise fetch once
    // Use a function so it reactively checks the current step value from query key
    refetchInterval: (query) => {
      // Stop polling if setup is complete
      if (query.state.data?.configured) {
        return false;
      }
      // Get current step from query key (it's the second element)
      const currentStep = query.queryKey[1] as number;
      // Only poll on step 8 (OAuth step) and not rate limited
      if (currentStep === 8 && !isRateLimited) {
        return 5000; // Check every 5 seconds
      }
      return false; // No polling on other steps
    },
    retry: false, // Don't retry on errors to avoid hitting rate limits repeatedly
    refetchOnWindowFocus: false, // Don't refetch when window regains focus (reduces requests)
    refetchOnMount: true, // Fetch once on mount
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  // Clear setup progress when setup is complete
  useEffect(() => {
    if (setupStatus?.configured) {
      safeLocalStorage.removeItem(SETUP_STORAGE_KEY);
    }
  }, [setupStatus?.configured]);

  // Validate credentials mutation
  const validateMutation = useMutation<ValidationResult>({
    mutationFn: async () => {
      // Get CSRF token
      let token: string;
      try {
        token = await getCsrfToken();
        if (!token) {
          throw new Error("CSRF token not found in response");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to get CSRF token";
        if (!errorMessage.includes("Backend service unavailable")) {
          console.error("CSRF token error:", errorMessage);
        }
        throw new Error(errorMessage);
      }

      const res = await fetch("/api/v1/setup/validate", {
        method: "POST",
        headers: {
          "X-CSRF-Token": token,
        },
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType?.includes("text/html")) {
          throw new Error("Backend service unavailable. This is expected when running the portfolio frontend without backend services.");
        }
      }

      return res.json();
    },
    onSuccess: async (data) => {
      if (data.valid) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refetchStatus();
        // If OAuth is complete, go to Slack if enabled, otherwise completion
        if (step === 8) {
          setStep(notificationPreferences.wantsSlack ? 9 : 9);
        }
      }
    },
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);

      // Get CSRF token using the utility function
      let token: string;
      try {
        token = await getCsrfToken();
        if (!token) {
          throw new Error("CSRF token not found in response");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to get CSRF token";
        // Only log if it's not a backend unavailability error (expected in portfolio mode)
        if (!errorMessage.includes("Backend service unavailable")) {
          console.error("CSRF token error:", errorMessage);
        }
        throw new Error(errorMessage);
      }

      const res = await fetch("/api/v1/setup/upload-logo", {
        method: "POST",
        headers: {
          "X-CSRF-Token": token,
        },
        body: formData,
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        let errorMessage = `Failed to upload logo: ${res.status} ${res.statusText}`;

        try {
          if (contentType?.includes("application/json")) {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            // Response is HTML or text, not JSON
            const text = await res.text();
            console.error("Upload error response (non-JSON):", text.substring(0, 200));
            if (text.includes("<!DOCTYPE") || text.includes("<html")) {
              errorMessage = `Server returned HTML error page (${res.status}). Check if the upload endpoint exists.`;
            } else {
              errorMessage = text.substring(0, 100) || errorMessage;
            }
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorMessage = res.statusText || `HTTP ${res.status} error`;
        }

        console.error("Upload error:", errorMessage, res.status);
        throw new Error(errorMessage);
      }

      // Check if response is JSON before parsing
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await res.text();
        console.error("Upload response is not JSON:", text.substring(0, 200));
        throw new Error("Server returned non-JSON response");
      }

      const result = await res.json();
      if (!result.url) {
        throw new Error("Upload succeeded but no URL returned");
      }
      return result;
    },
  });

  // Save branding mutation
  const saveBrandingMutation = useMutation({
    mutationFn: async (brandingConfig: BrandingConfigPayload) => {
      try {
        // Get CSRF token using the utility function
        let token: string;
        try {
          token = await getCsrfToken();
          if (!token) {
            throw new Error("CSRF token not found in response");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to get CSRF token";
          // Only log if it's not a backend unavailability error (expected in portfolio mode)
          if (!errorMessage.includes("Backend service unavailable")) {
            console.error("CSRF token error:", errorMessage);
          }
          throw new Error(errorMessage);
        }

        const res = await fetch("/api/v1/setup/branding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          body: JSON.stringify(brandingConfig),
        });

        if (!res.ok) {
          let errorMessage = "Failed to save branding configuration";
          const contentType = res.headers.get("content-type");

          // Check if backend is unavailable (HTML response)
          if (contentType?.includes("text/html")) {
            throw new Error("Backend service unavailable. This is expected when running the portfolio frontend without backend services.");
          }

          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = res.statusText || `HTTP ${res.status} error`;
          }
          throw new Error(errorMessage);
        }

        return res.json();
      } catch (error) {
        throw error instanceof Error ? error : new Error("Failed to save branding configuration");
      }
    },
    onSuccess: async () => {
      // Invalidate app-config query to refetch branding immediately
      const { queryClient } = await import("@/lib/queryClient");
      await queryClient.invalidateQueries({ queryKey: ["app-config"] });

      // Move to next step
      if (step === 2) setStep(3); // Branding -> Content
      else if (step === 3) setStep(4); // Content -> Header/Footer
      else if (step === 4) setStep(5); // Header/Footer -> Notifications
    },
    onError: (error) => {
      // Only log if it's not a backend unavailability error (expected in portfolio mode)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("Backend service unavailable") && !errorMessage.includes("Invalid CSRF token")) {
        console.error("Failed to save branding:", error);
      }
    },
  });

  // Handle logo file selection
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      // Reset file input
      e.target.value = "";
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setLogoUploadError("Please select a valid image file (JPG, PNG, GIF, SVG, or WebP)");
      e.target.value = "";
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setLogoUploadError("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    setLogoUploadError(null);
    setLogoUploading(true);

    // Create preview first
    const reader = new FileReader();
    const previewPromise = new Promise<string>((resolve, reject) => {
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

    try {
      const preview = await previewPromise;
      setBranding(prev => ({ ...prev, logoFile: file, logoPreview: preview }));

      // Upload file
      try {
        const result = await uploadLogoMutation.mutateAsync(file);
        if (result?.url) {
          setBranding(prev => ({
            ...prev,
            logo: result.url,
            logoFile: file,
            logoPreview: preview
          }));
          setLogoUploadError(null);
        } else {
          throw new Error("Upload succeeded but no URL returned");
        }
      } catch (uploadError) {
        const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload logo";
        setLogoUploadError(errorMessage);
        setBranding(prev => ({ ...prev, logoFile: null, logoPreview: "" }));
        throw uploadError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload logo";
      if (!logoUploadError) {
        setLogoUploadError(errorMessage);
      }
      setBranding(prev => ({ ...prev, logoFile: null, logoPreview: "" }));
      console.error("Logo upload error:", error);
    } finally {
      setLogoUploading(false);
      // Reset file input to allow re-uploading the same file
      e.target.value = "";
    }
  };

  // Save credentials mutation
  const saveCredentialsMutation = useMutation({
    mutationFn: async (creds: Record<string, string>) => {
      // Get CSRF token
      let token: string;
      try {
        token = await getCsrfToken();
        if (!token) {
          throw new Error("CSRF token not found in response");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to get CSRF token";
        if (!errorMessage.includes("Backend service unavailable")) {
          console.error("CSRF token error:", errorMessage);
        }
        throw new Error(errorMessage);
      }

      const res = await fetch("/api/v1/setup/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": token,
        },
        body: JSON.stringify(creds),
      });
      if (!res.ok) {
        // Try to parse as JSON, but handle non-JSON error responses
        let errorMessage = "Failed to save credentials";
        const contentType = res.headers.get("content-type");

        // Check if backend is unavailable (HTML response)
        if (contentType?.includes("text/html")) {
          throw new Error("Backend service unavailable. This is expected when running the portfolio frontend without backend services.");
        }

        try {
          if (contentType && contentType.includes("application/json")) {
            const error = await res.json();
            errorMessage = error.message || errorMessage;
          } else {
            // Non-JSON response (e.g., rate limit page)
            const textResponse = await res.text();
            if (textResponse.includes("Too many")) {
              errorMessage = "Too many requests. Please wait a few minutes and try again.";
            } else {
              errorMessage = `Server error: ${res.status} ${res.statusText}`;
            }
          }
        } catch {
          // If parsing fails, use status text
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }
      return res.json();
    },
    onSuccess: async () => {
      // Invalidate app-config and credentials queries to ensure UI updates immediately
      const { queryClient } = await import("@/lib/queryClient");
      await queryClient.invalidateQueries({ queryKey: ["app-config"] });

      await new Promise(resolve => setTimeout(resolve, 500));
      await refetchStatus();
      setStep(8); // Move to OAuth step
    },
  });

  // Check for OAuth success/error redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");

    if (success === "true") {
      const timeoutId = setTimeout(() => {
        validateMutation.mutate();
        // After OAuth, always go to step 6 (Slack setup or completion)
        setStep(9);
      }, 500);
      window.history.replaceState({}, "", "/setup");

      // Cleanup timeout on unmount
      return () => clearTimeout(timeoutId);
    } else if (error) {
      setStep(8);
      window.history.replaceState({}, "", "/setup");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If already configured, show success with option to restart
  if (setupStatus?.configured && !restartSetup) {
    return (
      <SetupCompleteCard
        onRestart={() => {
          setStep(1);
          setRestartSetup(true);
        }}
        onEdit={() => {
          setRestartSetup(true);
          setStep(1);
        }}
      />
    );
  }

  const progress = (step / TOTAL_STEPS) * 100;

  // Determine if preview should be shown (steps 2-4)
  const shouldShowPreview = showPreview && (step === 2 || step === 3 || step === 4);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background p-4 sm:p-6">
      <div className={`w-full ${shouldShowPreview ? 'max-w-7xl' : 'max-w-3xl'} transition-all duration-300`}>
        <div className={`${shouldShowPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
          <Card className={`${shouldShowPreview ? '' : 'w-full'} shadow-elevated-lg border-border/50`}>
            <CardHeader className="pb-4 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Setup</CardTitle>
                <div className="flex items-center gap-3">
                  {shouldShowPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="h-8 text-xs"
                    >
                      {showPreview ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 mr-1" />
                          Hide Preview
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Show Preview
                        </>
                      )}
                    </Button>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Step {step} of {TOTAL_STEPS}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              </div>
              <Progress value={progress} className="h-1.5" />
            </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Step 1: Welcome */}
          {step === 1 && <WelcomeStep onNext={() => setStep(2)} />}

          {/* Step 2: Branding & Customization */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Customize Your Branding</h3>
                <p className="text-muted-foreground">
                  Make SmartSheetConnect your own! Customize your company name, logo, and colors. This will appear throughout your lead capture system.
                </p>
              </div>

            <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={branding.companyName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= FIELD_MAX_LENGTHS.companyName) {
                        setBranding({ ...branding, companyName: value });
                      }
                    }}
                    placeholder="Acme Corporation"
                    required
                    maxLength={FIELD_MAX_LENGTHS.companyName}
                    className={`w-full ${exceedsMaxLength("companyName", branding.companyName) ? "border-destructive" : ""}`}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">This will appear in the header, footer, and notifications</p>
                    <span className={`text-xs ${getRemainingChars("companyName", branding.companyName) < 20 ? "text-destructive" : "text-muted-foreground"}`}>
                      {getCharCountText("companyName", branding.companyName)}
                    </span>
                  </div>
                  {getRemainingChars("companyName", branding.companyName) < 20 && (
                    <p className="text-xs text-destructive">Keep under 50 characters for best display on mobile</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="logo" className="text-sm font-medium">Logo</Label>
                  <div className="flex items-start gap-4">
                    {branding.logoPreview || branding.logo ? (
                      <div className="relative flex-shrink-0">
                        <img
                          key={`${branding.logoPreview || branding.logo}-${branding.logoFile ? 'file' : 'url'}`}
                          src={branding.logoPreview || branding.logo}
                          alt="Logo preview"
                          className="w-16 h-16 object-contain rounded-lg bg-muted border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== "/assets/SmartSheetConnect.png") {
                              target.src = "/assets/SmartSheetConnect.png";
                            }
                          }}
                        />
                        {(branding.logo || branding.logoFile) && (
                          <button
                            type="button"
                            onClick={() => {
                              setBranding({ ...branding, logo: "", logoFile: null, logoPreview: "" });
                              setLogoUploadError(null);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors"
                            aria-label="Remove logo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground">No logo</span>
                      </div>
                    )}
                    <div className="flex-1 space-y-2 min-w-0">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp"
                        onChange={handleLogoFileChange}
                        disabled={logoUploading}
                        className="h-9 text-xs cursor-pointer file:cursor-pointer file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      <Input
                        id="logoUrl"
                        value={branding.logo}
                        onChange={(e) => {
                          const newLogo = e.target.value.trim();
                          setLogoUploadError(null);
                          if (newLogo) {
                            setBranding({ ...branding, logo: newLogo, logoFile: null, logoPreview: newLogo });
                          } else {
                            setBranding({ ...branding, logo: "", logoFile: null, logoPreview: "" });
                          }
                        }}
                        placeholder="Or enter logo URL"
                        type="url"
                        className="h-9 text-xs"
                        disabled={logoUploading}
                      />
                      {logoUploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                      {logoUploadError && <p className="text-xs text-destructive">{logoUploadError}</p>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-sm font-medium">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      placeholder="#3B82F6"
                      type="color"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-sm font-medium">Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      placeholder="#10B981"
                      type="color"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteUrl" className="text-sm font-medium whitespace-nowrap">Website URL</Label>
                  <Input
                    id="siteUrl"
                    value={branding.siteUrl}
                    onChange={(e) => setBranding({ ...branding, siteUrl: e.target.value })}
                    placeholder="https://yourdomain.com"
                    type="url"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (!branding.companyName.trim()) {
                        return;
                      }
                      saveBrandingMutation.mutate({
                        branding: {
                          companyName: branding.companyName.trim(),
                          logo: branding.logo?.trim() || undefined,
                          primaryColor: branding.primaryColor?.trim() || undefined,
                          secondaryColor: branding.secondaryColor?.trim() || undefined,
                          siteUrl: branding.siteUrl?.trim() || undefined,
                        },
                      });
                    }}
                    disabled={saveBrandingMutation.isPending || !branding.companyName.trim()}
                    className="flex-1"
                  >
                    {saveBrandingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4 text-white" />
                      </>
                    )}
                  </Button>
                </div>
                {saveBrandingMutation.isError && (
                  <p className="text-xs text-destructive text-center">
                    {saveBrandingMutation.error instanceof Error
                      ? saveBrandingMutation.error.message
                      : "Failed to save branding configuration"}
                  </p>
                )}
              </div>

              {/* White-Label Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="hideBranding" className="text-sm font-medium">
                    Remove SmartSheetConnect Branding
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Hide SmartSheetConnect references in footer and branding
                  </p>
                </div>
                <Switch
                  id="hideBranding"
                  checked={hideBranding}
                  onCheckedChange={setHideBranding}
                />
              </div>
            </div>
          )}

          {/* Step 3: Content Customization */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Content</h3>
                <p className="text-sm text-muted-foreground">
                  Customize text and messaging for your homepage and form
                </p>
              </div>

              {/* Template Presets */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quick Start Templates</Label>
                <Select
                  onValueChange={(value) => {
                    const presets: Record<string, Partial<typeof content>> = {
                      professional: {
                        heroTitle: "Professional Services That Deliver Results",
                        heroDescription: "Trusted by businesses nationwide. We provide expert solutions tailored to your needs.",
                        heroCtaText: "Get Started",
                        heroSecondaryCtaText: "View Services",
                        formTitle: "Request a Consultation",
                        formDescription: "Tell us about your project and we'll get back to you within 24 hours.",
                        formSubmitText: "Send Request",
                      },
                      realestate: {
                        heroTitle: "Find Your Dream Home Today",
                        heroDescription: "Expert real estate services with personalized attention. Your next home is just a click away.",
                        heroCtaText: "Browse Properties",
                        heroSecondaryCtaText: "Schedule Tour",
                        formTitle: "Contact Our Team",
                        formDescription: "Interested in a property? Get in touch and we'll help you find the perfect match.",
                        formSubmitText: "Contact Agent",
                      },
                      agency: {
                        heroTitle: "Creative Agency That Drives Growth",
                        heroDescription: "We help brands stand out with innovative marketing strategies and stunning creative work.",
                        heroCtaText: "Start Project",
                        heroSecondaryCtaText: "View Portfolio",
                        formTitle: "Let's Work Together",
                        formDescription: "Ready to elevate your brand? Share your vision and we'll bring it to life.",
                        formSubmitText: "Get Quote",
                      },
                      contractor: {
                        heroTitle: "Quality Construction & Renovation Services",
                        heroDescription: "Licensed, insured, and experienced. We deliver exceptional results on time and on budget.",
                        heroCtaText: "Get Estimate",
                        heroSecondaryCtaText: "View Projects",
                        formTitle: "Request a Free Estimate",
                        formDescription: "Tell us about your project and we'll provide a detailed quote within 48 hours.",
                        formSubmitText: "Request Estimate",
                      },
                      coach: {
                        heroTitle: "Transform Your Life with Expert Coaching",
                        heroDescription: "Personalized coaching programs designed to help you achieve your goals and unlock your potential.",
                        heroCtaText: "Book Session",
                        heroSecondaryCtaText: "Learn More",
                        formTitle: "Schedule Your Consultation",
                        formDescription: "Take the first step toward transformation. Book a free discovery call today.",
                        formSubmitText: "Book Now",
                      },
                    };
                    if (presets[value]) {
                      setContent({ ...content, ...presets[value] });
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional Services</SelectItem>
                    <SelectItem value="realestate">Real Estate</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="coach">Coach / Consultant</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Templates will fill in suggested content. You can edit any field after selecting.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4 p-5 rounded-2xl bg-muted/20">
                  <h4 className="text-sm font-medium">Hero Section</h4>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="heroTitle" className="text-sm font-medium">Title</Label>
                      <Input
                        id="heroTitle"
                        value={content.heroTitle}
                        onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                        placeholder="Never Miss a Lead Again"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heroDescription" className="text-sm font-medium">
                        Description <span className="text-muted-foreground text-xs">(10-300 chars recommended)</span>
                      </Label>
                      <textarea
                        maxLength={FIELD_MAX_LENGTHS.heroDescription}
                        id="heroDescription"
                        value={content.heroDescription}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= FIELD_MAX_LENGTHS.heroDescription) {
                            setContent({ ...content, heroDescription: value });
                          }
                        }}
                        placeholder="Professional lead capture system..."
                        className={`w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none ${
                          exceedsMaxLength("heroDescription", content.heroDescription)
                            ? "border-destructive"
                            : content.heroDescription && !validateDescription(content.heroDescription).valid
                            ? "border-amber-500"
                            : ""
                        }`}
                        rows={3}
                      />
                      <div className="flex justify-between items-center">
                        {content.heroDescription && !validateDescription(content.heroDescription).valid && (
                          <p className="text-xs text-amber-600">{validateDescription(content.heroDescription).suggestion}</p>
                        )}
                        <span className={`text-xs ml-auto ${getRemainingChars("heroDescription", content.heroDescription) < 50 ? "text-destructive" : "text-muted-foreground"}`}>
                          {getCharCountText("heroDescription", content.heroDescription)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="heroCtaText" className="text-xs font-medium">Primary CTA</Label>
                        <Input
                          id="heroCtaText"
                          value={content.heroCtaText}
                          onChange={(e) => setContent({ ...content, heroCtaText: e.target.value })}
                          placeholder="Try Demo"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heroSecondaryCtaText" className="text-xs font-medium">Secondary CTA</Label>
                        <Input
                          id="heroSecondaryCtaText"
                          value={content.heroSecondaryCtaText}
                          onChange={(e) => setContent({ ...content, heroSecondaryCtaText: e.target.value })}
                          placeholder="Set Up Your Own"
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heroTertiaryCtaText" className="text-xs font-medium">Tertiary CTA</Label>
                        <Input
                          id="heroTertiaryCtaText"
                          value={content.heroTertiaryCtaText}
                          onChange={(e) => setContent({ ...content, heroTertiaryCtaText: e.target.value })}
                          placeholder="Learn More"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5 rounded-2xl bg-muted/20">
                  <h4 className="text-sm font-medium">Contact Form</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="formTitle" className="text-sm font-medium">Title</Label>
                      <Input
                        id="formTitle"
                        value={content.formTitle}
                        onChange={(e) => setContent({ ...content, formTitle: e.target.value })}
                        placeholder="Get in Touch"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formDescription" className="text-sm font-medium">Description</Label>
                      <textarea
                        id="formDescription"
                        value={content.formDescription}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= FIELD_MAX_LENGTHS.formDescription) {
                            setContent({ ...content, formDescription: value });
                          }
                        }}
                        placeholder="Fill out the form below..."
                        className={`w-full min-h-[60px] px-3 py-2 text-sm border rounded-lg resize-none ${exceedsMaxLength("formDescription", content.formDescription) ? "border-destructive" : ""}`}
                        rows={2}
                        maxLength={FIELD_MAX_LENGTHS.formDescription}
                      />
                      <div className="flex justify-end">
                        <span className={`text-xs ${getRemainingChars("formDescription", content.formDescription) < 50 ? "text-destructive" : "text-muted-foreground"}`}>
                          {getCharCountText("formDescription", content.formDescription)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formSubmitText" className="text-sm font-medium">Submit Button Text</Label>
                      <Input
                        id="formSubmitText"
                        value={content.formSubmitText}
                        onChange={(e) => setContent({ ...content, formSubmitText: e.target.value })}
                        placeholder="Send Message"
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    saveBrandingMutation.mutate({
                      content: {
                        hero: {
                          title: content.heroTitle || undefined,
                          description: content.heroDescription || undefined,
                          ctaText: content.heroCtaText || undefined,
                          secondaryCtaText: content.heroSecondaryCtaText || undefined,
                          tertiaryCtaText: content.heroTertiaryCtaText || undefined,
                          benefits: content.heroBenefits.map(text => ({ text })),
                        },
                        form: {
                          title: content.formTitle || undefined,
                          description: content.formDescription || undefined,
                          submitText: content.formSubmitText || undefined,
                        },
                      },
                    });
                  }}
                  disabled={saveBrandingMutation.isPending}
                  className="flex-1"
                >
                  {saveBrandingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4 text-white" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Header & Footer Customization */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Header & Footer</h3>
                <p className="text-sm text-muted-foreground">
                  Configure navigation, social links, and footer content
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4 p-5 rounded-2xl bg-muted/20">
                  <h4 className="text-sm font-medium">Header</h4>

                  <div className="space-y-2">
                    <Label htmlFor="headerCtaText">Header CTA Button Text</Label>
                    <Input
                      id="headerCtaText"
                      value={headerFooter.headerCtaText}
                      onChange={(e) => setHeaderFooter({ ...headerFooter, headerCtaText: e.target.value })}
                      placeholder="Get Started"
                    />
                  </div>

                </div>

                <div className="space-y-4 p-5 rounded-2xl bg-muted/20">
                  <h4 className="text-sm font-medium">Footer</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="footerDescription" className="text-sm font-medium">Description</Label>
                      <textarea
                        id="footerDescription"
                        value={headerFooter.footerDescription}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= FIELD_MAX_LENGTHS.footerDescription) {
                            setHeaderFooter({ ...headerFooter, footerDescription: value });
                          }
                        }}
                        placeholder="Professional lead capture automation..."
                        className={`w-full min-h-[60px] px-3 py-2 text-sm border rounded-lg resize-none ${exceedsMaxLength("footerDescription", headerFooter.footerDescription) ? "border-destructive" : ""}`}
                        rows={2}
                        maxLength={FIELD_MAX_LENGTHS.footerDescription}
                      />
                      <div className="flex justify-end">
                        <span className={`text-xs ${getRemainingChars("footerDescription", headerFooter.footerDescription) < 50 ? "text-destructive" : "text-muted-foreground"}`}>
                          {getCharCountText("footerDescription", headerFooter.footerDescription)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Social Links</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Input
                          placeholder="GitHub URL"
                          value={headerFooter.socialGithub}
                          onChange={(e) => setHeaderFooter({ ...headerFooter, socialGithub: e.target.value })}
                          type="url"
                          className="h-9 text-sm"
                        />
                        <Input
                          placeholder="Twitter/X URL"
                          value={headerFooter.socialTwitter}
                          onChange={(e) => setHeaderFooter({ ...headerFooter, socialTwitter: e.target.value })}
                          type="url"
                          className="h-9 text-sm"
                        />
                        <Input
                          placeholder="LinkedIn URL"
                          value={headerFooter.socialLinkedin}
                          onChange={(e) => setHeaderFooter({ ...headerFooter, socialLinkedin: e.target.value })}
                          type="url"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Legal Pages</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Input
                          placeholder="Privacy Policy URL"
                          value={headerFooter.privacyPolicyUrl}
                          onChange={(e) => setHeaderFooter({ ...headerFooter, privacyPolicyUrl: e.target.value })}
                          type="url"
                          className="h-9 text-sm"
                        />
                        <Input
                          placeholder="Terms of Service URL"
                          value={headerFooter.termsOfServiceUrl}
                          onChange={(e) => setHeaderFooter({ ...headerFooter, termsOfServiceUrl: e.target.value })}
                          type="url"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    {/* SEO Section */}
                    <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20 mt-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-primary" />
                          <Label className="text-sm font-semibold">SEO & Meta Tags</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Optimize your site for search engines and social sharing (all optional)
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="pageTitle" className="text-sm font-medium">Page Title</Label>
                          <Input
                            id="pageTitle"
                            value={seo.pageTitle}
                            onChange={(e) => setSeo({ ...seo, pageTitle: e.target.value })}
                            placeholder="My Company - Lead Capture"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="metaDescription" className="text-sm font-medium">Meta Description</Label>
                          <textarea
                            id="metaDescription"
                            value={seo.metaDescription}
                            onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                            placeholder="Professional lead capture automation..."
                            className="w-full min-h-[60px] px-3 py-2 text-sm border rounded-lg resize-none"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ogImage" className="text-sm font-medium">Open Graph Image URL</Label>
                          <Input
                            id="ogImage"
                            value={seo.ogImage}
                            onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                            placeholder="https://example.com/og-image.jpg"
                            type="url"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ogTitle" className="text-sm font-medium">Open Graph Title</Label>
                          <Input
                            id="ogTitle"
                            value={seo.ogTitle}
                            onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                            placeholder="My Company - Lead Capture"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ogDescription" className="text-sm font-medium">Open Graph Description</Label>
                          <textarea
                            id="ogDescription"
                            value={seo.ogDescription}
                            onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                            placeholder="Professional lead capture automation..."
                            className="w-full min-h-[60px] px-3 py-2 text-sm border rounded-lg resize-none"
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="keywords" className="text-sm font-medium">Keywords (comma-separated)</Label>
                          <Input
                            id="keywords"
                            value={seo.keywords}
                            onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                            placeholder="lead capture, automation, CRM"
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Analytics Section */}
                    <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20 mt-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <Label className="text-sm font-semibold">Analytics Integration</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Track visitors and conversions (all optional)
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="googleAnalyticsId" className="text-sm font-medium">Google Analytics ID (GA4)</Label>
                          <Input
                            id="googleAnalyticsId"
                            value={analytics.googleAnalyticsId}
                            onChange={(e) => setAnalytics({ ...analytics, googleAnalyticsId: e.target.value })}
                            placeholder="G-XXXXXXXXXX"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="googleTagManagerId" className="text-sm font-medium">Google Tag Manager ID</Label>
                          <Input
                            id="googleTagManagerId"
                            value={analytics.googleTagManagerId}
                            onChange={(e) => setAnalytics({ ...analytics, googleTagManagerId: e.target.value })}
                            placeholder="GTM-XXXXXXX"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="facebookPixelId" className="text-sm font-medium">Facebook Pixel ID</Label>
                          <Input
                            id="facebookPixelId"
                            value={analytics.facebookPixelId}
                            onChange={(e) => setAnalytics({ ...analytics, facebookPixelId: e.target.value })}
                            placeholder="123456789012345"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedinInsightTag" className="text-sm font-medium">LinkedIn Insight Tag</Label>
                          <Input
                            id="linkedinInsightTag"
                            value={analytics.linkedinInsightTag}
                            onChange={(e) => setAnalytics({ ...analytics, linkedinInsightTag: e.target.value })}
                            placeholder="123456"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customAnalyticsScript" className="text-sm font-medium">Custom Analytics Script</Label>
                          <textarea
                            id="customAnalyticsScript"
                            value={analytics.customAnalyticsScript}
                            onChange={(e) => setAnalytics({ ...analytics, customAnalyticsScript: e.target.value })}
                            placeholder="<!-- Custom analytics code -->"
                            className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-lg resize-none font-mono"
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Paste custom analytics code (e.g., Hotjar, Mixpanel)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    saveBrandingMutation.mutate({
                      header: {
                        ctaText: headerFooter.headerCtaText || undefined,
                        navigation: headerFooter.navigation,
                      },
                      footer: {
                        description: headerFooter.footerDescription || undefined,
                        socialLinks: {
                          github: headerFooter.socialGithub || undefined,
                          twitter: headerFooter.socialTwitter || undefined,
                          linkedin: headerFooter.socialLinkedin || undefined,
                          facebook: headerFooter.socialFacebook || undefined,
                          instagram: headerFooter.socialInstagram || undefined,
                          youtube: headerFooter.socialYouTube || undefined,
                          tiktok: headerFooter.socialTikTok || undefined,
                          pinterest: headerFooter.socialPinterest || undefined,
                          snapchat: headerFooter.socialSnapchat || undefined,
                          discord: headerFooter.socialDiscord || undefined,
                        },
                        privacyPolicyUrl: headerFooter.privacyPolicyUrl || undefined,
                        termsOfServiceUrl: headerFooter.termsOfServiceUrl || undefined,
                      },
                      seo: {
                        pageTitle: seo.pageTitle || undefined,
                        metaDescription: seo.metaDescription || undefined,
                        ogImage: seo.ogImage || undefined,
                        ogTitle: seo.ogTitle || undefined,
                        ogDescription: seo.ogDescription || undefined,
                        twitterCard: seo.twitterCard || undefined,
                        twitterImage: seo.twitterImage || undefined,
                        canonicalUrl: seo.canonicalUrl || undefined,
                        keywords: seo.keywords || undefined,
                      },
                      analytics: {
                        googleAnalyticsId: analytics.googleAnalyticsId || undefined,
                        googleTagManagerId: analytics.googleTagManagerId || undefined,
                        facebookPixelId: analytics.facebookPixelId || undefined,
                        linkedinInsightTag: analytics.linkedinInsightTag || undefined,
                        customAnalyticsScript: analytics.customAnalyticsScript || undefined,
                      },
                    });
                  }}
                  disabled={saveBrandingMutation.isPending}
                  className="flex-1"
                >
                  {saveBrandingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4 text-white" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Notification Preferences */}
          {step === 5 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Choose how you want to be notified when leads are submitted
                </p>
              </div>

              <div className="space-y-3">
                {/* Email Notifications */}
                <div className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors bg-muted/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Label htmlFor="email-notif" className="text-sm font-semibold cursor-pointer">
                            Email Notifications
                          </Label>
                          <Switch
                            id="email-notif"
                            checked={notificationPreferences.wantsEmail}
                            onCheckedChange={(checked) =>
                              setNotificationPreferences({ ...notificationPreferences, wantsEmail: checked })
                            }
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Instant email alerts via Gmail
                        </p>
                        {notificationPreferences.wantsEmail && (
                          <div className="mt-3 space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="notification-email" className="text-xs font-medium">
                                Email Address <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="notification-email"
                                type="email"
                                value={credentials.NOTIFICATION_EMAIL}
                                onChange={(e) =>
                                  setCredentials({ ...credentials, NOTIFICATION_EMAIL: e.target.value })
                                }
                                placeholder="you@example.com"
                                className="h-9 text-sm"
                              />
                            </div>

                            {/* Email Template Editor */}
                            <Accordion type="single" collapsible className="border rounded-lg">
                              <AccordionItem value="email-template" className="border-0">
                                <AccordionTrigger className="text-xs font-medium px-3 py-2">
                                  Customize Email Template (Optional)
                                </AccordionTrigger>
                                <AccordionContent className="px-3 pb-3 space-y-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="email-subject" className="text-xs font-medium">
                                      Email Subject
                                    </Label>
                                    <Input
                                      id="email-subject"
                                      value={emailTemplate.subject}
                                      onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
                                      placeholder="New Lead: {name}"
                                      className="h-8 text-xs"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Use {"{name}"}, {"{email}"}, {"{company}"} for dynamic values
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="email-intro" className="text-xs font-medium">
                                      Intro Message
                                    </Label>
                                    <textarea
                                      id="email-intro"
                                      value={emailTemplate.introMessage}
                                      onChange={(e) => setEmailTemplate({ ...emailTemplate, introMessage: e.target.value })}
                                      placeholder="You have received a new lead submission:"
                                      className="w-full min-h-[60px] px-2 py-1.5 text-xs border rounded-lg resize-none"
                                      rows={2}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="email-closing" className="text-xs font-medium">
                                      Closing / Signature
                                    </Label>
                                    <textarea
                                      id="email-closing"
                                      value={emailTemplate.closingSignature}
                                      onChange={(e) => setEmailTemplate({ ...emailTemplate, closingSignature: e.target.value })}
                                      placeholder="Best regards,&#10;Your Team"
                                      className="w-full min-h-[60px] px-2 py-1.5 text-xs border rounded-lg resize-none"
                                      rows={2}
                                    />
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slack Notifications */}
                <div className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors bg-muted/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Label htmlFor="slack-notif" className="text-sm font-semibold cursor-pointer">
                            Slack Notifications
                          </Label>
                          <Switch
                            id="slack-notif"
                            checked={notificationPreferences.wantsSlack}
                            onCheckedChange={(checked) =>
                              setNotificationPreferences({ ...notificationPreferences, wantsSlack: checked })
                            }
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Team notifications in Slack workspace
                        </p>
                        {notificationPreferences.wantsSlack && (
                          <div className="mt-3 space-y-2">
                            <Label htmlFor="slack-webhook-step2" className="text-xs font-medium">
                              Webhook URL (optional)
                            </Label>
                            <Input
                              id="slack-webhook-step2"
                              type="url"
                              value={credentials.SLACK_WEBHOOK_URL}
                              onChange={(e) =>
                                setCredentials({ ...credentials, SLACK_WEBHOOK_URL: e.target.value })
                              }
                              placeholder="https://hooks.slack.com/services/..."
                              className="h-9 text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              We&apos;ll help you create one later if needed
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generic Webhook Notifications */}
                <div className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors bg-muted/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Webhook className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Label htmlFor="webhook-notif" className="text-sm font-semibold cursor-pointer">
                            Webhooks (Zapier, Make.com, etc.)
                          </Label>
                          <Switch
                            id="webhook-notif"
                            checked={notificationPreferences.wantsWebhook}
                            onCheckedChange={(checked) => {
                              setNotificationPreferences({ ...notificationPreferences, wantsWebhook: checked });
                              if (!checked) setSelectedWebhookService(null);
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Connect to Zapier, Make.com, or 1000+ apps
                        </p>
                        {notificationPreferences.wantsWebhook && (
                          <div className="mt-4 space-y-4">
                            {/* Service Selection */}
                  <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Which service do you want to connect?
                              </Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  variant={selectedWebhookService === "zapier" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedWebhookService("zapier")}
                                  className="justify-start"
                                >
                                  <span className="mr-2">⚡</span>
                                  Zapier
                                </Button>
                                <Button
                                  type="button"
                                  variant={selectedWebhookService === "make" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedWebhookService("make")}
                                  className="justify-start"
                                >
                                  <span className="mr-2">🔧</span>
                                  Make.com
                                </Button>
                                <Button
                                  type="button"
                                  variant={selectedWebhookService === "other" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedWebhookService("other")}
                                  className="justify-start"
                                >
                                  <span className="mr-2">🔗</span>
                                  Other Service
                                </Button>
                                <Button
                                  type="button"
                                  variant={selectedWebhookService === "later" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedWebhookService("later")}
                                  className="justify-start"
                                >
                                  <span className="mr-2">⏰</span>
                                  Set Up Later
                                </Button>
                              </div>
                            </div>

                            {/* Zapier Guide */}
                            {selectedWebhookService === "zapier" && (
                              <Alert className="bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-xs text-blue-900">
                                  <strong className="block mb-2">📋 Quick Zapier Setup:</strong>
                                  <ol className="list-decimal list-inside space-y-1 ml-2">
                                    <li>Go to <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="underline">zapier.com</a> and sign in</li>
                                    <li>Click &quot;Create Zap&quot;</li>
                                    <li>Search for &quot;Webhooks by Zapier&quot; and select it</li>
                                    <li>Choose &quot;Catch Hook&quot; as the trigger</li>
                                    <li>Copy the webhook URL that appears</li>
                                    <li>Paste it below (or in Step 4)</li>
                                  </ol>
                                  <p className="mt-2 text-xs">
                                    <a href="https://zapier.com/help/create/guide/create-zap-from-webhook" target="_blank" rel="noopener noreferrer" className="underline">
                                      Need more help? View detailed guide →
                                    </a>
                                  </p>
                                </AlertDescription>
                              </Alert>
                            )}

                            {/* Make.com Guide */}
                            {selectedWebhookService === "make" && (
                              <Alert className="bg-purple-50 border-purple-200">
                                <AlertCircle className="h-4 w-4 text-purple-600" />
                                <AlertDescription className="text-xs text-purple-900">
                                  <strong className="block mb-2">📋 Quick Make.com Setup:</strong>
                                  <ol className="list-decimal list-inside space-y-1 ml-2">
                                    <li>Go to <a href="https://www.make.com" target="_blank" rel="noopener noreferrer" className="underline">make.com</a> and sign in</li>
                                    <li>Create a new scenario</li>
                                    <li>Add "Webhooks" module</li>
                                    <li>Choose "Custom webhook"</li>
                                    <li>Copy the webhook URL that appears</li>
                                    <li>Paste it below (or in Step 4)</li>
                                  </ol>
                                  <p className="mt-2 text-xs">
                                    <a href="https://www.make.com/en/help/apps/webhooks" target="_blank" rel="noopener noreferrer" className="underline">
                                      Need more help? View detailed guide →
                                    </a>
                                  </p>
                                </AlertDescription>
                              </Alert>
                            )}

                            {/* Other Service Guide */}
                            {selectedWebhookService === "other" && (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  <strong>No problem!</strong> Most services work the same way:
                                  <ol className="list-decimal list-inside space-y-1 mt-2 ml-2">
                                    <li>Find the webhook URL in your service's settings</li>
                                    <li>Copy the URL (it usually starts with https://)</li>
                                    <li>Paste it below (or in Step 4)</li>
                                    <li>Click "Test" to make sure it works</li>
                                  </ol>
                                  <p className="mt-2">
                                    <strong>Popular services:</strong> HubSpot, Salesforce, Pipedrive, Mailchimp, and many more!
                                  </p>
                                </AlertDescription>
                              </Alert>
                            )}

                            {/* Set Up Later */}
                            {selectedWebhookService === "later" && (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  <strong>That's totally fine!</strong> You can set up webhooks anytime after completing the main setup.
                                  Just come back to the settings and add your webhook URL when you're ready.
                                </AlertDescription>
                              </Alert>
                            )}

                            {/* Webhook URL Input - Show if not "later" */}
                            {selectedWebhookService && selectedWebhookService !== "later" && (
                              <div>
                                <Label htmlFor="webhook-url-step2" className="text-sm font-medium">
                                  {selectedWebhookService === "zapier" ? "Paste your Zapier webhook URL here:" :
                                   selectedWebhookService === "make" ? "Paste your Make.com webhook URL here:" :
                                   "Paste your webhook URL here:"}
                                </Label>
                                <Input
                                  id="webhook-url-step2"
                                  type="url"
                                  value={credentials.WEBHOOK_URL}
                                  onChange={(e) =>
                                    setCredentials({ ...credentials, WEBHOOK_URL: e.target.value })
                                  }
                                  placeholder={selectedWebhookService === "zapier" ? "https://hooks.zapier.com/hooks/catch/..." :
                                               selectedWebhookService === "make" ? "https://hook.integromat.com/..." :
                                               "https://your-service.com/webhook"}
                                  className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {selectedWebhookService === "zapier" || selectedWebhookService === "make"
                                    ? "💡 Tip: You can also paste this in Step 4 if you don't have it ready yet."
                                    : "The URL should start with https://"}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto-Responder Emails */}
                <div className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors bg-muted/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Reply className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Label htmlFor="auto-responder" className="text-sm font-semibold cursor-pointer">
                            Auto-Responder Emails
                          </Label>
                          <Switch
                            id="auto-responder"
                            checked={credentials.ENABLE_AUTO_RESPONDER === "true"}
                            onCheckedChange={(checked) =>
                              setCredentials({ ...credentials, ENABLE_AUTO_RESPONDER: checked ? "true" : "false" })
                            }
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Automatically send thank-you emails to leads
                        </p>
                        {credentials.ENABLE_AUTO_RESPONDER === "true" && (
                          <div className="mt-4 space-y-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                            <Alert className="bg-muted/50">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                Organization name will use <strong>{branding?.companyName || "your company name from Step 2"}</strong> automatically.
                              </AlertDescription>
                            </Alert>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="auto-responder-subject" className="text-xs font-medium">
                                  Email Subject
                                </Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowAutoResponderPreview(!showAutoResponderPreview)}
                                  className="h-7 text-xs"
                                >
                                  {showAutoResponderPreview ? "Hide" : "Preview"}
                                </Button>
                              </div>
                              <Input
                                id="auto-responder-subject"
                                type="text"
                                value={credentials.AUTO_RESPONDER_SUBJECT}
                                onChange={(e) =>
                                  setCredentials({ ...credentials, AUTO_RESPONDER_SUBJECT: e.target.value })
                                }
                                placeholder="Thank you for contacting us!"
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="auto-responder-body" className="text-xs font-medium">
                                Email Message
                              </Label>
                              <textarea
                                id="auto-responder-body"
                                value={credentials.AUTO_RESPONDER_BODY}
                                onChange={(e) =>
                                  setCredentials({ ...credentials, AUTO_RESPONDER_BODY: e.target.value })
                                }
                                placeholder="Hi {{leadName}},\n\nThank you for reaching out..."
                                className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-lg resize-none"
                                rows={4}
                              />
                              <p className="text-xs text-muted-foreground">
                                Use <code className="bg-muted px-1 rounded text-xs">{"{{leadName}}"}</code> and <code className="bg-muted px-1 rounded text-xs">{"{{organizationName}}"}</code> for personalization
                              </p>
                            </div>
                            {showAutoResponderPreview && (
                              <Alert className="bg-muted/30">
                                <AlertDescription className="text-xs">
                                  <strong className="block mb-2">Preview:</strong>
                                  <div className="space-y-1 text-muted-foreground">
                                    <div><strong>To:</strong> lead@example.com</div>
                                    <div><strong>Subject:</strong> {credentials.AUTO_RESPONDER_SUBJECT || `Thank you for contacting ${branding?.companyName || "Your Company"}!`}</div>
                                    <div className="mt-2 whitespace-pre-wrap border-t pt-2 text-xs">
                                      {(credentials.AUTO_RESPONDER_BODY || `Hi John,\n\nThank you for reaching out to ${branding?.companyName || "Your Company"}! We've received your message and will get back to you as soon as possible.\n\nBest regards,\nThe ${branding?.companyName || "Your Company"} Team`)
                                        .replace(/\{\{leadName\}\}/g, "John")
                                        .replace(/\{\{organizationName\}\}/g, branding?.companyName || "Your Company")}
                                    </div>
                                  </div>
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    // Update credentials with preferences
                    // Auto-populate ORGANIZATION_NAME from branding.companyName if not already set
                    setCredentials({
                      ...credentials,
                      ENABLE_EMAIL_NOTIFICATIONS: notificationPreferences.wantsEmail ? "true" : "false",
                      ENABLE_SLACK_NOTIFICATIONS: notificationPreferences.wantsSlack ? "true" : "false",
                      ENABLE_WEBHOOK_NOTIFICATIONS: notificationPreferences.wantsWebhook ? "true" : "false",
                      // Use companyName from branding (Step 2) for ORGANIZATION_NAME
                      ORGANIZATION_NAME: branding?.companyName || credentials.ORGANIZATION_NAME || "",
                    });
                    setStep(6);
                  }}
                  className="flex-1"
                  disabled={
                    (notificationPreferences.wantsEmail && !credentials.NOTIFICATION_EMAIL) ||
                    (notificationPreferences.wantsWebhook && (!credentials.WEBHOOK_URL || !credentials.WEBHOOK_URL.trim()))
                  }
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Google Cloud Setup Instructions */}
          {step === 6 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Google Cloud Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Connect to your Google account to save leads automatically
                </p>
              </div>

              <Alert className="bg-muted/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>What is Google Cloud?</strong> Google's platform for managing apps. You'll create a free project to securely connect SmartSheetConnect.
                </AlertDescription>
              </Alert>

              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="step1" className="border rounded-xl px-4">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">1</span>
                      <span>Create Google Cloud Project</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Free and takes about 30 seconds. This connects SmartSheetConnect to your Google account.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("https://console.cloud.google.com/projectcreate", "_blank")}
                      className="w-full justify-start"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Google Cloud Console
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step2" className="border rounded-xl px-4">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">2</span>
                      <span>Enable Required APIs</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Click each button below, then click "Enable" on each page.
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open("https://console.cloud.google.com/apis/library/sheets.googleapis.com", "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Enable Google Sheets API
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => window.open("https://console.cloud.google.com/apis/library/drive.googleapis.com", "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Enable Google Drive API
                      </Button>
                      {notificationPreferences.wantsEmail && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => window.open("https://console.cloud.google.com/apis/library/gmail.googleapis.com", "_blank")}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Enable Gmail API
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step3" className="border rounded-xl px-4">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">3</span>
                      <span>Create OAuth Credentials</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      A secure key that lets SmartSheetConnect access your Google account.
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                      <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">APIs & Services → Credentials</a></li>
                      <li>Click <strong>"+ CREATE CREDENTIALS"</strong> → <strong>"OAuth client ID"</strong></li>
                      <li>Choose <strong>"Web application"</strong></li>
                      <li>Name it <strong>"SmartSheetConnect"</strong></li>
                      <li>Add this redirect URI:</li>
                    </ol>
                    <div className="bg-muted/50 p-2.5 rounded-lg border border-dashed flex items-center justify-between gap-2">
                      <code className="text-xs break-all flex-1">
                        {window.location.origin}/api/v1/oauth/callback
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/api/v1/oauth/callback`);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-destructive font-medium">
                      ⚠️ Copy exactly as shown - no extra spaces or trailing slash
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step4" className="border rounded-xl px-4">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">4</span>
                      <span>Copy Your Credentials</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      After clicking "CREATE", Google shows a popup with:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      <li><strong>Client ID</strong> - ends with <code className="bg-muted px-1 rounded">.apps.googleusercontent.com</code></li>
                      <li><strong>Client Secret</strong> - starts with <code className="bg-muted px-1 rounded">GOCSPX-</code></li>
                    </ul>
                    <p className="text-xs text-muted-foreground">
                      Copy both - you'll paste them in the next step.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep(5)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(7)} className="flex-1">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 7: Enter Credentials */}
          {step === 7 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Google Credentials</h3>
                <p className="text-sm text-muted-foreground">
                  Paste the Client ID and Client Secret from Google Cloud Console
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="clientId" className="text-sm font-medium">
                    Client ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="clientId"
                    type="text"
                    value={credentials.GOOGLE_CLIENT_ID}
                    onChange={(e) =>
                      setCredentials({ ...credentials, GOOGLE_CLIENT_ID: e.target.value })
                    }
                    placeholder="123456789-abc.apps.googleusercontent.com"
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usually ends with <code className="bg-muted px-1 rounded text-xs">.apps.googleusercontent.com</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSecret" className="text-sm font-medium">
                    Client Secret <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={credentials.GOOGLE_CLIENT_SECRET}
                    onChange={(e) =>
                      setCredentials({ ...credentials, GOOGLE_CLIENT_SECRET: e.target.value })
                    }
                    placeholder="GOCSPX-xxxxxxxxxxxx"
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usually starts with <code className="bg-muted px-1 rounded text-xs">GOCSPX-</code>
                  </p>
                </div>

                {notificationPreferences.wantsSlack && (
                  <div className="space-y-2">
                    <Label htmlFor="slack-webhook-step4" className="text-sm font-medium">Slack Webhook URL (Optional)</Label>
                    <Input
                      id="slack-webhook-step4"
                      type="url"
                      value={credentials.SLACK_WEBHOOK_URL}
                      onChange={(e) =>
                        setCredentials({ ...credentials, SLACK_WEBHOOK_URL: e.target.value })
                      }
                      placeholder="https://hooks.slack.com/services/..."
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Can be set up later if needed
                    </p>
                  </div>
                )}

                {notificationPreferences.wantsWebhook && (
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url-step4" className="text-sm font-medium">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="webhook-url-step4"
                        type="url"
                        value={credentials.WEBHOOK_URL}
                        onChange={(e) =>
                          setCredentials({ ...credentials, WEBHOOK_URL: e.target.value })
                        }
                        placeholder={
                          selectedWebhookService === "zapier"
                            ? "https://hooks.zapier.com/hooks/catch/..."
                            : selectedWebhookService === "make"
                            ? "https://hook.integromat.com/..."
                            : "https://your-service.com/webhook"
                        }
                        className="flex-1 h-10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!credentials.WEBHOOK_URL || !credentials.WEBHOOK_URL.trim()) return;

                          setWebhookTestState({ testing: true, result: null });

                          try {
                            // Get CSRF token
                            let token: string;
                            try {
                              token = await getCsrfToken();
                              if (!token) {
                                throw new Error("CSRF token not found in response");
                              }
                            } catch (error) {
                              const errorMessage = error instanceof Error ? error.message : "Failed to get CSRF token";
                              if (!errorMessage.includes("Backend service unavailable")) {
                                console.error("CSRF token error:", errorMessage);
                              }
                              setWebhookTestState({
                                testing: false,
                                result: { valid: false, error: "Backend service unavailable. This is expected when running the portfolio frontend without backend services." }
                              });
                              return;
                            }

                            const res = await fetch("/api/v1/setup/test-webhook", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-Token": token,
                              },
                              body: JSON.stringify({ webhookUrl: credentials.WEBHOOK_URL }),
                            });

                            if (!res.ok) {
                              const contentType = res.headers.get("content-type");
                              if (contentType?.includes("text/html")) {
                                setWebhookTestState({
                                  testing: false,
                                  result: { valid: false, error: "Backend service unavailable. This is expected when running the portfolio frontend without backend services." }
                                });
                                return;
                              }
                            }

                            const result = await res.json();
                            setWebhookTestState({ testing: false, result });
                          } catch {
                            setWebhookTestState({
                              testing: false,
                              result: { valid: false, error: "Failed to test webhook. Please check the URL and try again." }
                            });
                          }
                        }}
                        disabled={!credentials.WEBHOOK_URL || !credentials.WEBHOOK_URL.trim() || webhookTestState.testing}
                        className="h-10"
                      >
                        {webhookTestState.testing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                            Testing...
                          </>
                        ) : (
                          "Test"
                        )}
                      </Button>
                    </div>
                    {!credentials.WEBHOOK_URL && (
                      <Alert className="bg-blue-50 border-blue-200 mt-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-xs text-blue-900">
                          <strong>Need help finding your webhook URL?</strong>
                          <div className="mt-2 space-y-2">
                            {selectedWebhookService === "zapier" && (
                              <div>
                                <strong>For Zapier:</strong>
                                <ol className="list-decimal list-inside space-y-1 ml-2 mt-1">
                                  <li>Create a new Zap</li>
                                  <li>Choose "Webhooks by Zapier" → "Catch Hook"</li>
                                  <li>Copy the webhook URL shown</li>
                                </ol>
                                <a href="https://zapier.com/help/create/guide/create-zap-from-webhook" target="_blank" rel="noopener noreferrer" className="underline mt-1 inline-block">
                                  View detailed Zapier guide →
                                </a>
                              </div>
                            )}
                            {selectedWebhookService === "make" && (
                              <div>
                                <strong>For Make.com:</strong>
                                <ol className="list-decimal list-inside space-y-1 ml-2 mt-1">
                                  <li>Create a new scenario</li>
                                  <li>Add "Webhooks" → "Custom webhook"</li>
                                  <li>Copy the webhook URL shown</li>
                                </ol>
                                <a href="https://www.make.com/en/help/apps/webhooks" target="_blank" rel="noopener noreferrer" className="underline mt-1 inline-block">
                                  View detailed Make.com guide →
                                </a>
                              </div>
                            )}
                            {(!selectedWebhookService || selectedWebhookService === "other") && (
                              <div>
                                <strong>For other services:</strong>
                                <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                                  <li>Check your service's documentation for "webhook" or "incoming webhook"</li>
                                  <li>Look in Settings → Integrations → Webhooks</li>
                                  <li>The URL usually starts with https://</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    {webhookTestState.result && (
                      <Alert variant={webhookTestState.result.valid ? "default" : "destructive"} className="mt-2">
                        {webhookTestState.result.valid ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                              ✅ Webhook URL is valid and working! Your webhook will receive lead data when submissions come in.
                            </AlertDescription>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                              ❌ Webhook test failed: {webhookTestState.result.error || "Unknown error"}
                            </AlertDescription>
                          </>
                        )}
                      </Alert>
                    )}
                  </div>
                )}

                {/* AI Scoring Section */}
                <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">AI-Enhanced Lead Scoring (Optional)</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optional: Enable AI-enhanced lead scoring using OpenAI. If not provided, the system will use keyword-based scoring.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openai-api-key" className="text-sm font-medium">
                      OpenAI API Key
                    </Label>
                    <Input
                      id="openai-api-key"
                      type="password"
                      value={credentials.OPENAI_API_KEY}
                      onChange={(e) =>
                        setCredentials({ ...credentials, OPENAI_API_KEY: e.target.value })
                      }
                      placeholder="sk-..."
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Platform</a>. Leave empty to use keyword-based scoring only.
                    </p>
                  </div>
                </div>

                {/* Google Sheets Section */}
                <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Google Sheets</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optional: Specify an existing Google Sheet ID. If left empty, a new sheet will be created automatically on first lead submission.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spreadsheet-id" className="text-sm font-medium">
                      Spreadsheet ID (Optional)
                    </Label>
                    <Input
                      id="spreadsheet-id"
                      type="text"
                      value={credentials.SPREADSHEET_ID}
                      onChange={(e) =>
                        setCredentials({ ...credentials, SPREADSHEET_ID: e.target.value })
                      }
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Found in your Google Sheet URL: <code className="bg-muted px-1 rounded text-xs">docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit</code>
                    </p>
                  </div>
                </div>
              </div>

              {saveCredentialsMutation.isError && (
                <Alert variant="destructive" className="border-2 border-destructive">
                  <XCircle className="h-5 w-5" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold text-base">
                        {saveCredentialsMutation.error instanceof Error
                          ? saveCredentialsMutation.error.message
                          : "Failed to save credentials. Please try again."}
                      </p>
                      {saveCredentialsMutation.error instanceof Error &&
                       saveCredentialsMutation.error.message.includes("Missing required fields") && (
                        <div className="text-sm space-y-2 mt-3 pt-3 border-t border-red-200">
                          <p className="font-medium">Please fill in the following required fields:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm bg-red-50 p-3 rounded-md">
                            {saveCredentialsMutation.error.message.includes("Google Client ID") && (
                              <li className="font-medium">Google Client ID</li>
                            )}
                            {saveCredentialsMutation.error.message.includes("Google Client Secret") && (
                              <li className="font-medium">Google Client Secret</li>
                            )}
                            {saveCredentialsMutation.error.message.includes("Notification Email") && (
                              <li className="font-medium">Notification Email</li>
                            )}
                          </ul>
                          <p className="text-xs text-muted-foreground mt-2">
                            All fields marked with an asterisk (*) are required.
                          </p>
                        </div>
                      )}
                      {saveCredentialsMutation.error instanceof Error &&
                       saveCredentialsMutation.error.message.includes("Too many") && (
                        <div className="text-sm space-y-1 mt-2 pt-2 border-t border-red-200">
                          <p className="font-medium">What to do:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Wait 5-10 minutes before trying again</li>
                            <li>This is a temporary limit from Google's servers</li>
                            <li>Your credentials are saved - you can continue later</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(6)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    const credsToSave = {
                      ...credentials,
                      ENABLE_EMAIL_NOTIFICATIONS: notificationPreferences.wantsEmail ? "true" : "false",
                      ENABLE_SLACK_NOTIFICATIONS: notificationPreferences.wantsSlack ? "true" : "false",
                      ENABLE_WEBHOOK_NOTIFICATIONS: notificationPreferences.wantsWebhook ? "true" : "false",
                      // Only save auto-responder fields if enabled
                      ENABLE_AUTO_RESPONDER: credentials.ENABLE_AUTO_RESPONDER || "false",
                      // Use companyName from branding (Step 2) for ORGANIZATION_NAME
                      ORGANIZATION_NAME: branding?.companyName || credentials.ORGANIZATION_NAME || "",
                      AUTO_RESPONDER_SUBJECT: credentials.AUTO_RESPONDER_SUBJECT || "",
                      AUTO_RESPONDER_BODY: credentials.AUTO_RESPONDER_BODY || "",
                      // AI Scoring (optional - only save if provided)
                      OPENAI_API_KEY: credentials.OPENAI_API_KEY || "",
                      // Google Sheets (optional - only save if provided)
                      SPREADSHEET_ID: credentials.SPREADSHEET_ID || "",
                    };
                    saveCredentialsMutation.mutate(credsToSave);
                  }}
                  disabled={
                    saveCredentialsMutation.isPending ||
                    !credentials.GOOGLE_CLIENT_ID ||
                    !credentials.GOOGLE_CLIENT_SECRET ||
                    !credentials.NOTIFICATION_EMAIL ||
                    (notificationPreferences.wantsWebhook && (!credentials.WEBHOOK_URL || !credentials.WEBHOOK_URL.trim()))
                  }
                  className="flex-1"
                >
                  {saveCredentialsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight className="ml-2 h-4 w-4 text-white" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 8: OAuth Authentication */}
          {step === 8 && (
            <div className="space-y-8">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Connect Google Account</h3>
                <p className="text-sm text-muted-foreground">
                  Securely connect to your Google account to enable automatic lead saving
                </p>
              </div>

              <div className="space-y-4 p-5 rounded-2xl bg-muted/20 border border-border/50">
                <div className="space-y-2">
                  <p className="text-sm font-medium">What we'll access:</p>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      <span>Google Sheets - to save your leads</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      <span>Google Drive - to create spreadsheets</span>
                    </li>
                    {notificationPreferences.wantsEmail && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                        <span>Gmail - to send email notifications</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <Alert className="bg-muted/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  You'll be redirected to Google to sign in and grant permissions. You can revoke access anytime.
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => {
                  window.location.href = "/api/v1/oauth/authorize";
                }}
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4 text-white" />
                Authorize with Google
              </Button>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep(7)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={() => validateMutation.mutate()}
                  disabled={validateMutation.isPending}
                  className="flex-1"
                >
                  {validateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                      Checking...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
              </div>

              {validateMutation.data && (
                <Alert variant={validateMutation.data.valid ? "default" : "destructive"}>
                  {validateMutation.data.valid ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Connection successful! Your Google account is connected.
                      </AlertDescription>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Connection failed: {validateMutation.data.error}
                      </AlertDescription>
                    </>
                  )}
                </Alert>
              )}

              {(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const error = urlParams.get("error");
                if (error) {
                  const errorMessage = decodeURIComponent(error);
                  const isRateLimit = errorMessage.includes("Too many") || errorMessage.includes("rate limit");

                  return (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">OAuth Error: {errorMessage}</p>
                          {isRateLimit ? (
                            <div className="text-sm space-y-1 mt-2 pt-2 border-t border-red-200">
                              <p className="font-medium">This is a temporary rate limit from Google:</p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Wait 5-10 minutes before trying the OAuth flow again</li>
                                <li>This happens when too many OAuth requests are made in a short time</li>
                                <li>Your credentials are already saved - you can continue later</li>
                                <li>Try again after waiting a few minutes</li>
                              </ul>
                            </div>
                          ) : (
                            <p className="text-xs mt-2">
                          Please check your Google Cloud Console settings and try again.
                            </p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Step 9: Slack Setup */}
          {step === 9 && (
            <div className="space-y-8">
              {notificationPreferences.wantsSlack ? (
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Slack Setup</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect Slack to receive notifications in your workspace
                    </p>
                  </div>

                  <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="slack1" className="border rounded-xl px-4">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">1</span>
                          <span>Go to Slack Apps</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Create a webhook to send messages to your Slack channel
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("https://api.slack.com/apps", "_blank")}
                          className="w-full justify-start"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Slack Apps Page
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="slack2" className="border rounded-xl px-4">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">2</span>
                          <span>Create Incoming Webhook</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 space-y-2">
                        <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                          <li>Click <strong>"Create New App"</strong> → <strong>"From scratch"</strong></li>
                          <li>Name it <strong>"SmartSheetConnect"</strong> and select your workspace</li>
                          <li>Go to <strong>"Incoming Webhooks"</strong> → Toggle ON</li>
                          <li>Click <strong>"Add New Webhook to Workspace"</strong></li>
                          <li>Select your channel and click <strong>"Allow"</strong></li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="slack3" className="border rounded-xl px-4">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">3</span>
                          <span>Copy Webhook URL</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Slack will show you a webhook URL. Copy it and paste below.
                        </p>
                        <div className="bg-muted/50 p-2.5 rounded-lg border border-dashed">
                          <code className="text-xs break-all">
                            https://hooks.slack.com/services/T00000000/B00000000/...
                          </code>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="slack-webhook" className="text-sm font-medium">Webhook URL</Label>
                      <Input
                        id="slack-webhook"
                        type="url"
                        value={credentials.SLACK_WEBHOOK_URL}
                        onChange={(e) =>
                          setCredentials({ ...credentials, SLACK_WEBHOOK_URL: e.target.value })
                        }
                        placeholder="https://hooks.slack.com/services/..."
                        className="h-10"
                      />
                    </div>

                    <Button
                      onClick={async () => {
                        const credsToSave = {
                          ...credentials,
                          ENABLE_SLACK_NOTIFICATIONS: "true",
                        };
                        try {
                          await saveCredentialsMutation.mutateAsync(credsToSave);
                          await refetchStatus();
                          // Navigate to completion screen
                          setStep(notificationPreferences.wantsSlack ? 10 : 9);
                        } catch {
                          // Error is handled by mutation
                        }
                      }}
                      disabled={!credentials.SLACK_WEBHOOK_URL || saveCredentialsMutation.isPending}
                      className="w-full"
                    >
                      {saveCredentialsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Complete Setup
                          <CheckCircle2 className="ml-2 h-4 w-4 text-white" />
                        </>
                      )}
                    </Button>

                    {saveCredentialsMutation.isError && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          {saveCredentialsMutation.error instanceof Error
                            ? saveCredentialsMutation.error.message
                            : "Failed to save Slack configuration. Please try again."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center space-y-4 py-8">
                    <div className="flex justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Setup Complete!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your SmartSheetConnect is ready to use
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (confirm('Reset customer credentials? This will clear your configuration and return to the setup wizard.')) {
                          try {
                            // Get CSRF token
                            let token: string;
                            try {
                              token = await getCsrfToken();
                              if (!token) {
                                throw new Error("CSRF token not found in response");
                              }
                            } catch (error) {
                              const errorMessage = error instanceof Error ? error.message : "Failed to get CSRF token";
                              if (!errorMessage.includes("Backend service unavailable")) {
                                console.error("CSRF token error:", errorMessage);
                              }
                              alert('Backend service unavailable. This is expected when running the portfolio frontend without backend services.');
                              return;
                            }

                            const res = await fetch('/api/v1/setup/credentials', {
                              method: 'DELETE',
                              headers: {
                                "X-CSRF-Token": token,
                              },
                            });

                            if (!res.ok) {
                              const contentType = res.headers.get("content-type");
                              if (contentType?.includes("text/html")) {
                                alert('Backend service unavailable. This is expected when running the portfolio frontend without backend services.');
                                return;
                              }
                            }

                            const data = await res.json();
                            if (data.success) {
                              // Clear saved progress
                              safeLocalStorage.removeItem(SETUP_STORAGE_KEY);
                              // Reload page to show setup wizard (setup status will now show as not configured)
                              window.location.reload();
                            } else {
                              alert('Failed to reset credentials: ' + data.message);
                            }
                          } catch {
                            alert('Failed to reset credentials');
                          }
                        }
                      }}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => (window.location.href = "/")}
                      className="flex-1"
                    >
                      Go to Application
                    </Button>
                  </div>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => setStep(8)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          )}

          {/* Step 10 (or 9 if no Slack): Setup Complete */}
          {step === (notificationPreferences.wantsSlack ? 10 : 9) && <CompletionStep />}
        </CardContent>
          </Card>
          {shouldShowPreview && (
            <Card className="hidden lg:block shadow-elevated-lg border-border/50 h-[calc(100vh-8rem)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)] p-4">
                <SetupPreview
                  branding={{
                    companyName: branding.companyName,
                    logo: branding.logoPreview || branding.logo,
                    primaryColor: branding.primaryColor,
                    secondaryColor: branding.secondaryColor,
                  }}
                  content={{
                    heroTitle: content.heroTitle,
                    heroDescription: content.heroDescription,
                    heroCtaText: content.heroCtaText,
                    heroSecondaryCtaText: content.heroSecondaryCtaText,
                    formTitle: content.formTitle,
                    formDescription: content.formDescription,
                    formSubmitText: content.formSubmitText,
                  }}
                  headerFooter={{
                    headerCtaText: headerFooter.headerCtaText,
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default SetupWizard;
