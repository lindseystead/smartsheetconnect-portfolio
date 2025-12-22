/**
 * Footer component.
 *
 * Displays footer content with social links, navigation, and branding.
 *
 * @author Lindsey Stead
 * @module client/components/Footer
 */

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { SiGithub, SiX, SiLinkedin, SiFacebook, SiInstagram, SiYoutube, SiTiktok, SiPinterest, SiSnapchat, SiDiscord } from "react-icons/si";
import { useAppConfig } from "@/hooks/useAppConfig";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS, TRANSITIONS } from "@/lib/constants";

export function Footer(): JSX.Element {
  const { data: config, isLoading } = useAppConfig();

  // Always have valid values - config hook provides defaults on error
  const companyName = config?.branding?.companyName || "SmartSheetConnect";
  const footerConfig = config?.footer;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Use social links from config, or empty object if not configured
  const socialLinks = footerConfig?.socialLinks || {};

  // Social media icon mapping
  const socialIcons: Record<string, { icon: React.ComponentType<{ className?: string }>, label: string }> = {
    github: { icon: SiGithub, label: "GitHub Profile" },
    twitter: { icon: SiX, label: "X (Twitter) Profile" },
    linkedin: { icon: SiLinkedin, label: "LinkedIn Profile" },
    facebook: { icon: SiFacebook, label: "Facebook Profile" },
    instagram: { icon: SiInstagram, label: "Instagram Profile" },
    youtube: { icon: SiYoutube, label: "YouTube Channel" },
    tiktok: { icon: SiTiktok, label: "TikTok Profile" },
    pinterest: { icon: SiPinterest, label: "Pinterest Profile" },
    snapchat: { icon: SiSnapchat, label: "Snapchat Profile" },
    discord: { icon: SiDiscord, label: "Discord Server" },
  };

  // Use quickLinks from config only - no hardcoded fallbacks
  const quickLinks = footerConfig?.quickLinks || [];

  const resources = footerConfig?.resources || [];

  const description = footerConfig?.description || "Professional lead capture automation for businesses that value efficiency and never missing an opportunity.";
  const copyright = footerConfig?.copyright || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;

  // Show loading state if config is still loading (prevents flash of default content)
  if (isLoading) {
    return (
      <footer className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </footer>
    );
  }

  // Even if there's an error, we still render with defaults (useAppConfig provides DEFAULT_CONFIG)
  // This ensures the footer always renders

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-muted/30 via-muted/20 to-background dark:from-muted/20 dark:via-muted/10 dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <motion.div
          className="grid md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12"
          variants={ANIMATION_VARIANTS.staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div
            className="space-y-4"
            variants={ANIMATION_VARIANTS.fadeIn}
          >
            <motion.div
              className="flex items-center gap-2.5"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-primary-glow"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Zap className="w-5 h-5 text-white" aria-hidden="true" />
              </motion.div>
              <span className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {companyName}
              </span>
            </motion.div>
            <p className="text-sm text-muted-foreground leading-relaxed break-words line-clamp-3">
              {description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(socialLinks).map(([platform, url]) => {
                if (!url || !socialIcons[platform]) return null;
                const { icon: Icon, label } = socialIcons[platform];
                return (
                  <motion.div key={platform} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      data-testid={`button-social-${platform}`}
                      className="rounded-xl"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={ANIMATION_VARIANTS.fadeIn}
          >
            <h3 className="font-semibold text-sm md:text-base whitespace-nowrap">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 4 }}
                  transition={TRANSITIONS.smooth}
                >
                  {link.sectionId ? (
                    <Button
                      variant="ghost"
                      className="justify-start px-0 h-auto text-sm whitespace-nowrap"
                      onClick={() => scrollToSection(link.sectionId!)}
                      data-testid={`button-footer-${link.sectionId}`}
                    >
                      {link.label}
                    </Button>
                  ) : link.href ? (
                    <Button
                      variant="ghost"
                      className="justify-start px-0 h-auto text-sm whitespace-nowrap"
                      asChild
                      data-testid={`button-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    </Button>
                  ) : null}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={ANIMATION_VARIANTS.fadeIn}
          >
            <h3 className="font-semibold text-sm md:text-base whitespace-nowrap">Resources</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
            <div className="flex flex-col gap-2 text-sm">
              {resources.map((resource, index) => (
                <motion.a
                  key={index}
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline whitespace-nowrap"
                  whileHover={{ x: 4 }}
                  transition={TRANSITIONS.smooth}
                >
                  {resource.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="pt-6 md:pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={TRANSITIONS.smooth}
        >
          <div>{copyright}</div>
          <div className="flex gap-4 md:gap-6">
            {footerConfig?.privacyPolicyUrl ? (
              <motion.a
                href={footerConfig.privacyPolicyUrl}
                className="hover:text-foreground transition-colors rounded px-2 py-1"
                data-testid="link-privacy"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Privacy Policy
              </motion.a>
            ) : (
              <button
                className="hover:text-foreground transition-colors rounded px-2 py-1"
                data-testid="link-privacy"
                disabled
                aria-disabled="true"
              >
                Privacy Policy
              </button>
            )}
            {footerConfig?.termsOfServiceUrl ? (
              <motion.a
                href={footerConfig.termsOfServiceUrl}
                className="hover:text-foreground transition-colors rounded px-2 py-1"
                data-testid="link-terms"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="whitespace-nowrap">Terms of Service</span>
              </motion.a>
            ) : (
              <button
                className="hover:text-foreground transition-colors rounded px-2 py-1"
                data-testid="link-terms"
                disabled
                aria-disabled="true"
              >
                <span className="whitespace-nowrap">Terms of Service</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
