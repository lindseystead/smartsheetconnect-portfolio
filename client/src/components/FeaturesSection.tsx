/**
 * Features section component.
 *
 * Displays key features of the application.
 *
 * @author Lindsey Stead
 * @module client/components/FeaturesSection
 */

import { Sheet, Bell, MessageSquare, Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS, TRANSITIONS } from "@/lib/constants";

export function FeaturesSection(): JSX.Element {
  const features = [
    {
      icon: Sheet,
      title: "Google Sheets Integration",
      description: "Automatically log all form submissions to Google Sheets with timestamps and details.",
      detail: "Automatic logging",
    },
    {
      icon: Sparkles,
      title: "Lead Scoring",
      description: "Intelligent scoring system (0-100) with optional AI enhancement to prioritize high-value leads.",
      detail: "Smart prioritization",
    },
    {
      icon: TrendingUp,
      title: "Lead Enrichment",
      description: "Automatically enrich leads with company data from email domains.",
      detail: "Company insights",
    },
    {
      icon: BarChart3,
      title: "Source Tracking",
      description: "Track lead sources with UTM parameters and referrer data.",
      detail: "Marketing attribution",
    },
    {
      icon: Bell,
      title: "Email Notifications",
      description: "Receive instant email alerts when new leads are submitted.",
      detail: "Real-time alerts",
    },
    {
      icon: MessageSquare,
      title: "Slack Notifications",
      description: "Send formatted notifications to your Slack channels.",
      detail: "Team coordination",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-background via-muted/20 to-background dark:via-muted/10 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16"
          variants={ANIMATION_VARIANTS.fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
            Features
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Automated lead capture with Google Sheets integration and notifications
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={ANIMATION_VARIANTS.staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={ANIMATION_VARIANTS.staggerItem}
              whileHover={{ y: -4 }}
              transition={TRANSITIONS.spring}
            >
              <Card
                className="p-6 md:p-8 rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-500 h-full group card-hover backdrop-blur-sm"
                data-testid={`card-feature-${index}`}
              >
                <div className="space-y-4">
                  <motion.div
                    className="w-14 h-14 bg-gradient-to-br from-primary/15 to-primary/10 dark:from-primary/20 dark:to-primary/15 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:from-primary/20 group-hover:to-primary/15 dark:group-hover:from-primary/25 dark:group-hover:to-primary/20 group-hover:scale-110 shadow-soft group-hover:shadow-primary-glow"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={TRANSITIONS.spring}
                  >
                    <feature.icon className="w-7 h-7 text-primary" aria-hidden="true" />
                  </motion.div>
                  <div className="space-y-2.5">
                    <h3 className="text-lg md:text-xl font-semibold tracking-tight">{feature.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    <motion.p
                      className="text-sm text-primary font-medium"
                      whileHover={{ x: 4 }}
                      transition={TRANSITIONS.smooth}
                    >
                      {feature.detail}
                    </motion.p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
