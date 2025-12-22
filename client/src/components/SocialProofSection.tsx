/**
 * Social proof section component.
 *
 * Displays testimonials and social proof.
 *
 * @author Lindsey Stead
 * @module client/components/SocialProofSection
 */

import { Card } from "@/components/ui/card";
import { Quote, TrendingUp, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS, TRANSITIONS } from "@/lib/constants";

export function SocialProofSection(): JSX.Element {
  const testimonial = {
    quote: "SmartSheetConnect instantly enriched our leads with company data, scored them 0–100 using AI, and routed them automatically. Our team now responds 5x faster and prioritizes high-value leads with complete intelligence.",
    author: "Jordan Lee",
    role: "Growth & Technology Lead",
  };

  const stats = [
    {
      icon: TrendingUp,
      value: "0–100",
      label: "AI Lead Scores",
    },
    {
      icon: Zap,
      value: "16",
      label: "Intel Fields",
    },
    {
      icon: Users,
      value: "5x",
      label: "Faster Prioritization",
    },
  ];

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center"
          variants={ANIMATION_VARIANTS.staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={ANIMATION_VARIANTS.slideInLeft}
          >
            <Card className="p-6 md:p-8 lg:p-12 rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 transition-all duration-500 hover:border-primary/30 card-hover backdrop-blur-sm">
              <div className="space-y-5 md:space-y-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...TRANSITIONS.spring, delay: 0.2 }}
                >
                  <Quote className="w-10 h-10 text-primary" aria-hidden="true" />
                </motion.div>
                <motion.p
                  className="text-base md:text-lg italic leading-relaxed text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, ...TRANSITIONS.smooth }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </motion.p>
                <motion.div
                  className="flex items-center gap-4 pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, ...TRANSITIONS.smooth }}
                >
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold text-primary">JL</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm md:text-base">{testimonial.author}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
            variants={ANIMATION_VARIANTS.staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={ANIMATION_VARIANTS.staggerItem}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={TRANSITIONS.spring}
              >
                <Card
                  className="p-5 md:p-6 text-center rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-500 card-hover backdrop-blur-sm"
                  data-testid={`stat-${index}`}
                >
                  <div className="space-y-3">
                    <motion.div
                      className="w-12 h-12 bg-primary/10 dark:bg-primary/15 rounded-xl flex items-center justify-center mx-auto transition-all duration-300 group-hover:bg-primary/15 dark:group-hover:bg-primary/20"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={TRANSITIONS.spring}
                    >
                      <stat.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                    </motion.div>
                    <motion.div
                      className="text-3xl md:text-4xl font-bold text-foreground"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ ...TRANSITIONS.spring, delay: 0.4 + index * 0.1 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-xs md:text-sm uppercase tracking-wide text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
