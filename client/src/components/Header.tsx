/**
 * Header component.
 *
 * Displays navigation, logo, and CTA button with branding support.
 *
 * @author Lindsey Stead
 * @module client/components/Header
 */

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function Header(): JSX.Element {
  const [, setLocation] = useLocation();
  const { data: config, isLoading } = useAppConfig();
  const [logoError, setLogoError] = useState(false);

  // Use config with fallbacks - always have valid values even if config fails
  const companyName = config?.branding?.companyName || "SmartSheetConnect";
  const headerConfig = config?.header;

  // Use navigation from config only - no hardcoded fallbacks
  const navigation = headerConfig?.navigation || [];

  const ctaText = headerConfig?.ctaText || "Get Started";

  // Default logo path - treat this as "no logo" and show Zap icon instead
  const DEFAULT_LOGO_PATH = "/assets/SmartSheetConnect.png";

  // Only use custom logo if it's provided AND it's not the default logo path
  const hasCustomLogo = config?.branding?.logo && config.branding.logo !== DEFAULT_LOGO_PATH;

  // Reset logo error when logo URL changes
  const logoUrl = config?.branding?.logo;
  const prevLogoUrl = useRef<string | undefined>(logoUrl);
  useEffect(() => {
    if (logoUrl && logoUrl !== prevLogoUrl.current) {
      // Reset error state when logo URL changes
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogoError(false);
      prevLogoUrl.current = logoUrl;
    }
  }, [logoUrl]);

  // Show loading state if config is still loading (prevents flash of default content)
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-primary-glow animate-pulse">
              <Zap className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold">SmartSheetConnect</span>
          </div>
        </div>
      </header>
    );
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToSetup = () => {
    setLocation("/setup");
  };

  const handleNavClick = (item: { sectionId?: string; href?: string }) => {
    if (item.sectionId) {
      scrollToSection(item.sectionId);
    } else if (item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass border-b shadow-elevated"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 hover-elevate active-elevate-2 rounded-xl px-2.5 py-1.5 -ml-2.5 transition-all duration-300 group"
          data-testid="button-logo"
          aria-label={`${companyName} - Go to top`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {hasCustomLogo && !logoError ? (
            <motion.img
              src={config.branding.logo}
              alt={companyName}
              className="w-9 h-9 rounded-xl object-contain shadow-sm"
              onError={() => setLogoError(true)}
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
          ) : (
            <motion.div
              className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-primary-glow"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Zap className="w-5 h-5 text-white" aria-hidden="true" />
            </motion.div>
          )}
          <span className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all duration-300" title={companyName}>
            <span className="hidden sm:inline">{companyName}</span>
            <span className="sm:hidden truncate max-w-[120px] inline-block">{companyName}</span>
          </span>
        </motion.button>

        {navigation.length > 0 && (
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => handleNavClick(item)}
                  data-testid={`button-nav-${item.sectionId || item.href?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || index}`}
                  className="rounded-xl font-medium transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                  aria-label={item.sectionId ? `Navigate to ${item.label} section` : `Open ${item.label} in new tab`}
                  asChild
                >
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.button>
                </Button>
              </motion.div>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Button
              onClick={goToSetup}
              data-testid="button-get-started"
              className="rounded-xl gradient-primary text-white font-semibold transition-all duration-300"
              aria-label={`${ctaText} - Go to setup page`}
              asChild
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {ctaText}
              </motion.button>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
