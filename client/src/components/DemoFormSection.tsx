/**
 * Demo Form Section Component
 *
 * Lead submission form component with validation and error handling.
 * Handles form state, submission, and success/error display.
 *
 * @fileoverview
 * This component provides:
 * - Form validation using React Hook Form + Zod
 * - API submission via React Query mutation
 * - Success/error state management
 * - Honeypot spam protection
 * - Loading states and user feedback
 *
 * @author Lindsey Stead
 * @module client/components/DemoFormSection
 */

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { leadSubmissionSchema, type LeadSubmission, type LeadSubmissionResponse } from "@shared/schema";
import { apiRequest, getCsrfToken } from "@/lib/queryClient";
import type { ApiError, LeadSubmissionWithHoneypot } from "@/lib/types";
import { CheckCircle2, Loader2, MessageSquare, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAppConfig } from "@/hooks/useAppConfig";

/**
 * Demo Form Section Component
 *
 * Main lead submission form with validation, error handling, and success states.
 * Uses React Hook Form for form management and React Query for API submission.
 *
 * Features:
 * - Client-side validation with Zod schema
 * - Server-side validation on submission
 * - Honeypot spam protection
 * - Loading states during submission
 * - Success/error feedback
 *
 * @returns {JSX.Element} Lead submission form section
 */
interface SetupStatus {
  configured: boolean;
  missing: string[];
  details: Record<string, boolean>;
}

export function DemoFormSection(): JSX.Element {
  const [isSuccess, setIsSuccess] = useState(false);
  const [, setLocation] = useLocation();
  const { data: config } = useAppConfig();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if setup is complete
  const { data: setupStatus } = useQuery<SetupStatus>({
    queryKey: ["setup-status"],
    queryFn: async () => {
      const res = await fetch("/api/v1/setup/status");
      if (!res.ok) {
        return { configured: false, missing: [], details: {} };
      }
      return res.json();
    },
    staleTime: 30000, // Check every 30 seconds
    refetchOnWindowFocus: false,
  });

  const isConfigured = setupStatus?.configured ?? false;

  // Get form submit text from config, fallback to default
  const submitText = config?.content?.form?.submitText || "Send Message";

  const form = useForm<LeadSubmission>({
    resolver: zodResolver(leadSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  // Fetch CSRF token on component mount
  const { data: csrfToken, refetch: refetchCsrfToken } = useQuery({
    queryKey: ["csrf-token"],
    queryFn: () => getCsrfToken(),
    staleTime: 50 * 60 * 1000, // 50 minutes (tokens expire after 1 hour)
    retry: 2,
  });

  const mutation = useMutation<LeadSubmissionResponse, Error, LeadSubmission>({
    mutationFn: async (data) => {
      // Ensure we have a CSRF token before submitting
      let token = csrfToken;
      if (!token) {
        // Fetch token if not available
        token = await getCsrfToken();
      }

      const response = await apiRequest("POST", "/api/v1/submit-lead", data, token);

      try {
        const result = await response.json();
        return result;
      } catch {
        throw new Error('Invalid response from server. Please try again.');
      }
    },
    onSuccess: () => {
      setIsSuccess(true);
      form.reset();
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setIsSuccess(false), 5000);
      // Refresh CSRF token after successful submission
      refetchCsrfToken();
    },
    onError: (error: Error) => {
      // If CSRF error, refresh token and show helpful message
      const apiError = error as ApiError;
      if (error.message.includes('CSRF') || apiError.status === 403) {
        refetchCsrfToken();
      }

      // Show setup/configuration errors clearly
      if (apiError.status === 412 || error.message.includes('Setup incomplete') || error.message.includes('SETUP_INCOMPLETE')) {
        form.setError("root", {
          message: "Setup incomplete. Please complete the setup wizard at /setup to enable form submissions.",
        });
      } else if (error.message.includes('Google authentication not configured') ||
          error.message.includes('not configured')) {
        form.setError("root", {
          message: "Google authentication not configured. Please complete setup at /setup",
        });
      } else if (error.message.includes('OAuth') ||
          error.message.includes('Google authentication') ||
          error.message.includes('refresh token') ||
          error.message.includes('invalid_grant')) {
        form.setError("root", {
          message: "Google authentication failed. Please go to /setup and re-authenticate with Google (Step 2).",
        });
      } else {
        // Show other errors
        form.setError("root", {
          message: error.message || "Failed to submit form. Please try again.",
        });
      }
    },
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onSubmit = (data: LeadSubmission) => {
    // Don't submit if CSRF token is not available
    if (!csrfToken) {
      form.setError("root", {
        message: "Security token not ready. Please wait a moment and try again.",
      });
      return;
    }

    // Include honeypot field in submission (should be empty for legitimate users)
    // Get honeypot value from the DOM element
    const honeypotInput = document.querySelector('input[name="_honeypot"]') as HTMLInputElement;
    const honeypotValue = honeypotInput?.value || '';

    // Submit with honeypot field included
    const submission: LeadSubmissionWithHoneypot = {
      ...data,
      _honeypot: honeypotValue,
    };
    mutation.mutate(submission);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section id="demo-form" className="py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-background via-muted/20 to-background dark:via-muted/10 relative overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2" />
      </div>
      <div className="max-w-2xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          className="text-center space-y-4 md:space-y-5 mb-10 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon with animation */}
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 rounded-2xl border border-primary/20">
                <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <Sparkles className="w-5 h-5 text-primary fill-primary" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              {config?.content?.form?.title || "Get in Touch"}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {isConfigured
                ? config?.content?.form?.description || "Fill out the form below and we'll get back to you as soon as possible"
                : "Complete setup to enable form submissions. Forms will automatically log to Google Sheets and trigger notifications once configured."}
            </p>
          </motion.div>
        </motion.div>

        {/* Form Card */}
        <Card className="p-6 md:p-8 lg:p-12 rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 shadow-elevated-lg hover:shadow-primary-glow-lg transition-all duration-500 backdrop-blur-sm">
          {/* Setup Required Notice */}
          {!isConfigured && (
            <Alert className="mb-6 border-amber-500/20 bg-amber-500/5">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="flex items-center justify-between gap-4">
                <span className="text-sm">
                  <strong>Setup Required:</strong> Complete the setup wizard to connect Google Sheets and enable form submissions.
                </span>
                <Button
                  size="sm"
                  onClick={() => setLocation("/setup")}
                  className="bg-primary hover:bg-primary/90 shrink-0"
                >
                  Go to Setup
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Success State: Show success message after successful submission */}
          {isSuccess ? (
            <div className="text-center space-y-6 py-8" data-testid="success-message">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto shadow-primary-glow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Thank You! Your Message Has Been Sent</h3>
                <p className="text-muted-foreground">
                  Your submission has been automatically logged to Google Sheets and notifications have been sent to your team.
                </p>
              </div>
              <Button onClick={() => setIsSuccess(false)} data-testid="button-submit-another">
                Send Another Message
              </Button>
            </div>
          ) : (
            /* Form State: Show form for lead submission */
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
                data-testid="lead-submission-form"
              >
                {/* Name Field: Required, validated by Zod schema */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Name *
                      </FormLabel>
                      <FormControl>
                            <Input
                              placeholder="John Smith"
                              {...field}
                              data-testid="input-name"
                              className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 hover:bg-background"
                            />
                      </FormControl>
                      {/* Error message displayed automatically if validation fails */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field: Required, validated for email format by Zod */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Email *
                      </FormLabel>
                      <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                              data-testid="input-email"
                              className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 hover:bg-background"
                            />
                      </FormControl>
                      {/* Error message displayed automatically if validation fails */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field: Optional, validated for phone format if provided */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Phone <span className="text-muted-foreground text-xs normal-case">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                            <Input
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              {...field}
                              data-testid="input-phone"
                              className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 hover:bg-background"
                            />
                      </FormControl>
                      {/* Error message displayed automatically if validation fails */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message Field: Required, validated by Zod schema */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Message *
                      </FormLabel>
                      <FormControl>
                            <Textarea
                              placeholder="Tell us about your project or inquiry..."
                              rows={4}
                              {...field}
                              data-testid="input-message"
                              className="resize-none rounded-xl border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 hover:bg-background"
                            />
                      </FormControl>
                      {/* Error message displayed automatically if validation fails */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ======================================================================== */}
                {/* SPAM PROTECTION: Honeypot Field */}
                {/* ======================================================================== */}

                {/* Honeypot field: Hidden field that only bots will fill out
                    If this field has a value, the submission is likely spam
                    Server-side validation silently accepts spam submissions
                    This field is visually hidden and excluded from tab navigation */}
                <input
                  type="text"
                  name="_honeypot"
                  tabIndex={-1} // Exclude from tab navigation
                  autoComplete="off" // Disable autocomplete
                  className="absolute -left-[9999px] opacity-0 pointer-events-none" // Position off-screen, invisible, no mouse interactions
                  aria-hidden="true" // Hide from screen readers
                />

                {/* ======================================================================== */}
                {/* ERROR DISPLAY */}
                {/* ======================================================================== */}

                {/* Display error message if API request fails or form validation fails */}
                {(mutation.isError || form.formState.errors.root) && (
                  <div className="text-sm text-destructive mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20" data-testid="error-message">
                    {form.formState.errors.root?.message ||
                     mutation.error?.message ||
                     "Something went wrong. Please try again."}
                  </div>
                )}

                {/* ======================================================================== */}
                {/* SUBMIT BUTTON */}
                {/* ======================================================================== */}

                {/* Submit button: Disabled during submission to prevent double-submission
                    Shows loading spinner while mutation is pending */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="rounded-lg gradient-primary text-white font-semibold transition-all duration-300"
                    disabled={mutation.isPending}
                    data-testid="button-submit"
                    asChild
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                          Sending...
                        </>
                      ) : (
                        <>
                          {submitText}
                          <ArrowRight className="w-4 h-4 ml-2 text-white" />
                        </>
                      )}
                    </motion.button>
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </section>
  );
}
