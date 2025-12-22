/**
 * React Query Client Configuration
 *
 * Configures TanStack Query (React Query) for data fetching and state management.
 * Provides API request utilities and query client configuration.
 *
 * @fileoverview
 * This file provides:
 * - API request utility function for making HTTP requests
 * - Query function factory for React Query
 * - QueryClient configuration with default options
 *
 * @author Lindsey Stead
 * @module client/lib/queryClient
 */

import { QueryClient, QueryFunction } from "@tanstack/react-query";
import type { ApiError } from "./types";

// ============================================================================
// HTTP RESPONSE VALIDATION
// ============================================================================

// Validates response and extracts error message
async function throwIfResNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    let errorMessage = res.statusText || `HTTP ${res.status} error`;

    try {
      const clonedResponse = res.clone();
      const errorJson = await clonedResponse.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      try {
        const clonedResponse = res.clone();
        const text = await clonedResponse.text();
        errorMessage = text || errorMessage;
      } catch {
        errorMessage = res.statusText || `HTTP ${res.status} error`;
      }
    }

    const error = new Error(errorMessage) as ApiError;
    error.status = res.status;
    throw error;
  }
}

// ============================================================================
// API REQUEST UTILITY
// ============================================================================

// Makes HTTP request to API
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  csrfToken?: string | undefined,
  baseUrl?: string | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};

  // Add Content-Type for requests with body
  if (data) {
    headers["Content-Type"] = "application/json";
  }

  // Add CSRF token for POST/PUT/DELETE requests
  if (csrfToken && (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH")) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  // Use baseUrl if provided (for embedding), otherwise use relative URL
  const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Include cookies for CSRF token
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * Fetches a CSRF token from the server.
 * Token is also set as a cookie automatically.
 *
 * @param {string} baseUrl - Optional base URL for embedding (e.g., "https://forms.example.com")
 * @returns {Promise<string>} CSRF token
 */
export async function getCsrfToken(baseUrl?: string): Promise<string> {
  const url = baseUrl ? `${baseUrl}/api/v1/csrf-token` : "/api/v1/csrf-token";
  const res = await fetch(url, {
    method: "GET",
    credentials: "include", // Include cookies
  });

  if (!res.ok) {
    // Check if response is HTML (backend unavailable)
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("text/html")) {
      throw new Error("Backend service unavailable. This is expected when running the portfolio frontend without backend services.");
    }
  }

  await throwIfResNotOk(res);
  const data = await res.json();
  return data.token;
}

// ============================================================================
// QUERY FUNCTION FACTORY
// ============================================================================

type UnauthorizedBehavior = "returnNull" | "throw";

// Query function factory for React Query
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

// React Query client - configured for this app's use case
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
