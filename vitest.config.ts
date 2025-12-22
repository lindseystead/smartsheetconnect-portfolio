/**
 * Vitest Configuration
 * 
 * Configures Vitest testing framework for both client and server testing.
 * Supports React component testing, API endpoint testing, and unit tests.
 * 
 * @fileoverview
 * This configuration provides:
 * - Test environment setup for both Node.js (server) and jsdom (client)
 * - Path aliases matching tsconfig.json
 * - Coverage reporting
 * - React Testing Library support
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment: 'node' for server tests, 'jsdom' for React component tests
    environment: "jsdom",
    
    // Setup files to run before tests
    setupFiles: ["./vitest.setup.ts"],
    
    // Glob patterns for test files
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.config.*",
        "**/vitest.setup.ts",
        "**/*.d.ts",
        "**/ui/**", // Exclude shadcn/ui components from coverage
      ],
    },
    
    // Global test timeout
    testTimeout: 10000,
  },
  resolve: {
    // Path aliases matching tsconfig.json
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});

