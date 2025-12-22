/**
 * Root application component.
 *
 * Sets up React Query, routing, and global providers (tooltips, toasts).
 *
 * @author Lindsey Stead
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import { useAppConfig } from "@/hooks/useAppConfig";
import { SEOHead } from "@/components/SEOHead";
import { Analytics } from "@/components/Analytics";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import Setup from "@/pages/Setup";
import Embed from "@/pages/Embed";

function FaviconUpdater(): null {
  const { data: config } = useAppConfig();

  useEffect(() => {
    if (config?.branding?.favicon) {
      const link = document.getElementById('favicon-link') as HTMLLinkElement | null;
      if (link) {
        link.href = config.branding.favicon;
      }
    }
  }, [config]);

  return null;
}

/**
 * Converts hex color to HSL format for Tailwind CSS variables.
 */
function hexToHsl(hex: string): string | null {
  try {
    let r = 0, g = 0, b = 0;

    if (hex.length === 4) {
      // Short hex (#RGB)
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      // Full hex (#RRGGBB)
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    } else {
      return null;
    }

    // Convert RGB to HSL
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return null;
  }
}

/**
 * Calculates appropriate foreground color based on luminance.
 */
function getForegroundColor(hsl: string): string {
  const l = parseFloat(hsl.split(' ')[2].replace('%', ''));
  return l > 50 ? '222 47% 11%' : '210 40% 98%';
}

/**
 * Validates hex color format.
 */
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Applies a color theme to CSS variables.
 */
function applyColorTheme(
  color: string | undefined,
  defaultColor: string,
  cssVar: '--primary' | '--secondary',
  cssVarForeground: '--primary-foreground' | '--secondary-foreground'
): void {
  const defaultHsl = hexToHsl(defaultColor);
  if (!defaultHsl) return;

  if (color && isValidHexColor(color)) {
    const hsl = hexToHsl(color);
    if (hsl) {
      document.documentElement.style.setProperty(cssVar, hsl);
      document.documentElement.style.setProperty(cssVarForeground, getForegroundColor(hsl));
      return;
    }
  }

  // Apply default
  document.documentElement.style.setProperty(cssVar, defaultHsl);
  document.documentElement.style.setProperty(cssVarForeground, '210 40% 98%');
}

function ColorSchemeUpdater(): null {
  const { data: config } = useAppConfig();

  useEffect(() => {
    try {
      applyColorTheme(
        config?.branding?.primaryColor,
        "#2563eb",
        '--primary',
        '--primary-foreground'
      );

      applyColorTheme(
        config?.branding?.secondaryColor,
        "#10B981",
        '--secondary',
        '--secondary-foreground'
      );
    } catch (error) {
      console.warn('Failed to apply branding colors:', error);
    }
  }, [config]);

  return null;
}

function Router(): JSX.Element {
  return (
    <Switch>
      <Route path="/setup" component={Setup} />
      <Route path="/embed" component={Embed} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <SEOHead />
            <Analytics />
            <FaviconUpdater />
            <ColorSchemeUpdater />
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
