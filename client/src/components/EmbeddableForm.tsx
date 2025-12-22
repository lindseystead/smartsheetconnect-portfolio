/**
 * Embeddable Form Component
 */

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { leadSubmissionSchema, type LeadSubmission, type LeadSubmissionResponse } from "@shared/schema";
import { apiRequest, getCsrfToken } from "@/lib/queryClient";
import type { ApiError } from "@/lib/types";
import { CheckCircle2, Loader2 } from "lucide-react";

interface EmbeddableFormProps {
  apiUrl?: string;
  title?: string;
  description?: string;
  submitText?: string;
  className?: string;
}

function getErrorMessage(error: ApiError): string {
  if (error.status === 412 || 
      error.message?.includes('Setup incomplete') || 
      error.message?.includes('SETUP_INCOMPLETE')) {
    return "Setup incomplete. Please complete the setup wizard to enable form submissions.";
  }
  return error.message || "Failed to send message. Please try again.";
}

export function EmbeddableForm({
  apiUrl = "",
  title = "Get in Touch",
  description = "Fill out the form below and we'll get back to you as soon as possible",
  submitText = "Send Message",
  className = "",
}: EmbeddableFormProps): JSX.Element {
  const [isSuccess, setIsSuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<LeadSubmission>({
    resolver: zodResolver(leadSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const { data: csrfToken, refetch: refetchCsrfToken } = useQuery({
    queryKey: ["csrf-token", apiUrl || ""],
    queryFn: () => getCsrfToken(apiUrl || undefined),
    staleTime: 50 * 60 * 1000,
    retry: 2,
  });

  const mutation = useMutation<LeadSubmissionResponse, Error, LeadSubmission>({
    mutationFn: async (data) => {
      let token = csrfToken;
      if (!token) {
        token = await getCsrfToken(apiUrl || undefined);
      }
      const response = await apiRequest("POST", "/api/v1/submit-lead", data, token, apiUrl || undefined);
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      form.reset();
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setIsSuccess(false), 5000);
      refetchCsrfToken();
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

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>

        {isSuccess ? (
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="w-5 h-5" />
            <p>Thank you! Your message has been sent successfully.</p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                const honeypotInput = document.querySelector('input[name="_honeypot"]') as HTMLInputElement;
                if (honeypotInput?.value) return;
                mutation.mutate(data);
              })}
              className="space-y-4"
            >
              <input type="text" name="_honeypot" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] opacity-0" aria-hidden="true" />

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="message" render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl><Textarea placeholder="Your message here..." className="min-h-[120px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending... </>
                ) : (
                  submitText
                )}
              </Button>

              {mutation.isError && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(mutation.error as ApiError)}
                </p>
              )}
            </form>
          </Form>
        )}
      </div>
    </Card>
  );
}
