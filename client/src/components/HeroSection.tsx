/**
 * Hero section component.
 *
 * Displays main hero section with title, description, and CTA buttons.
 *
 * @author Lindsey Stead
 * @module client/components/HeroSection
 */

import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS, TRANSITIONS } from "@/lib/constants";
import { useAppConfig } from "@/hooks/useAppConfig";

export function HeroSection(): JSX.Element {
  const { data: config } = useAppConfig();

  const heroConfig = config?.content?.hero;
  const formConfig = config?.content?.form;
  const title = heroConfig?.title || "SmartSheetConnect";
  const description = heroConfig?.description || "Automated lead capture that logs to Google Sheets and sends notifications";
  const ctaText = heroConfig?.ctaText || "Get Started";
  const secondaryCtaText = heroConfig?.secondaryCtaText || "Learn More";
  const tertiaryCtaText = heroConfig?.tertiaryCtaText;
  const benefits = heroConfig?.benefits || [];
  const formSubmitText = formConfig?.submitText || "Send Message";

  const scrollToForm = () => {
    const element = document.getElementById("demo-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="pt-28 sm:pt-36 lg:pt-48 pb-20 md:pb-28 px-4 sm:px-6 relative">
      {/* Enhanced background gradient decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:via-transparent dark:to-primary/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-16 items-start">
          <motion.div
            className="space-y-6 md:space-y-8 min-w-0"
            variants={ANIMATION_VARIANTS.slideInLeft}
            initial="initial"
            animate="animate"
            transition={TRANSITIONS.gentle}
          >
            <div className="space-y-4 md:space-y-6 min-w-0">
              <h1 className="text-fluid-hero font-bold leading-[1.1] tracking-tight text-foreground break-words max-w-2xl">
                {title.includes('SmartSheetConnect') ? (
                  <>
                    SmartSheet
                    <br className="hidden lg:block" />
                    Connect
                  </>
                ) : (
                  title
                )}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl break-words">
                {description}
              </p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 flex-wrap"
              variants={ANIMATION_VARIANTS.staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={ANIMATION_VARIANTS.staggerItem}>
                <Button
                  onClick={scrollToForm}
                  className="rounded-lg"
                  data-testid="button-try-demo"
                  asChild
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={TRANSITIONS.spring}
                  >
                    {ctaText}
                    <ArrowRight className="ml-2 w-4 h-4 text-white" aria-hidden="true" />
                  </motion.button>
                </Button>
              </motion.div>
              <motion.div variants={ANIMATION_VARIANTS.staggerItem}>
                <Button
                  onClick={scrollToHowItWorks}
                  variant="outline"
                  className="rounded-lg"
                  data-testid="button-learn-more"
                  asChild
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={TRANSITIONS.spring}
                  >
                    {secondaryCtaText}
                  </motion.button>
                </Button>
              </motion.div>
              {tertiaryCtaText && (
                <motion.div variants={ANIMATION_VARIANTS.staggerItem}>
                  <Button
                    variant="outline"
                    onClick={scrollToHowItWorks}
                    className="rounded-lg"
                    data-testid="button-see-how-it-works"
                    asChild
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={TRANSITIONS.spring}
                    >
                      {tertiaryCtaText}
                    </motion.button>
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {benefits.length > 0 && (
              <motion.div
                className="flex flex-wrap items-center gap-4 md:gap-6 pt-2"
                variants={ANIMATION_VARIANTS.staggerContainer}
                initial="initial"
                animate="animate"
              >
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                    variants={ANIMATION_VARIANTS.staggerItem}
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground">{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="relative"
            variants={ANIMATION_VARIANTS.slideInRight}
            initial="initial"
            animate="animate"
            transition={{ ...TRANSITIONS.gentle, delay: 0.2 }}
          >
            <motion.div
              className="relative rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 p-6 md:p-8 shadow-elevated-lg hover:shadow-elevated-xl hover:shadow-primary-glow-lg transition-all duration-500 card-hover backdrop-blur-sm"
              whileHover={{ y: -8, scale: 1.01 }}
              transition={TRANSITIONS.spring}
            >
              <div className="space-y-4 md:space-y-6">
                {[
                  { label: "w-1/4", width: "25%" },
                  { label: "w-1/3", width: "33.33%" },
                  { label: "w-1/4", width: "25%" }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1, ...TRANSITIONS.smooth }}
                  >
                    <div className={`h-3 bg-muted rounded-xl ${item.label}`}></div>
                    <div className="h-10 bg-muted rounded-xl"></div>
                  </motion.div>
                ))}
                <motion.div
                  className="h-10 bg-primary rounded-xl flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, ...TRANSITIONS.spring }}
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-white font-semibold text-sm">{formSubmitText}</span>
                </motion.div>
              </div>
              <motion.div
                className="absolute -right-3 md:-right-4 -top-3 md:-top-4 w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center shadow-primary-glow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, ...TRANSITIONS.spring }}
                whileHover={{ rotate: 90, scale: 1.1 }}
              >
                <ArrowRight className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" aria-hidden="true" />
              </motion.div>
            </motion.div>
            <motion.div
              className="absolute -bottom-3 md:-bottom-4 -left-3 md:-left-4 w-20 h-20 md:w-24 md:h-24 bg-primary/10 dark:bg-primary/15 rounded-2xl -z-10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.7, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -top-3 md:-top-4 -right-3 md:-right-4 w-24 h-24 md:w-32 md:h-32 bg-primary/5 dark:bg-primary/10 rounded-full -z-10"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
