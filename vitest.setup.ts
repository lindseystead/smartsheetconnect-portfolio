/**
 * Vitest setup file.
 *
 * Configures test environment and polyfills browser APIs for jsdom.
 *
 * @author Lindsey Stead
 */

import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Polyfill IntersectionObserver for Framer Motion in tests
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

