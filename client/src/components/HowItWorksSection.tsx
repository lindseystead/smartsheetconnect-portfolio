/**
 * How It Works section component.
 *
 * Displays the step-by-step process of how the application works.
 *
 * @author Lindsey Stead
 * @module client/components/HowItWorksSection
 */

import { FileText, Sparkles, TrendingUp, Database, Mail, BarChart3, MapPin, Building2, Users, Globe, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { LEAD_DEMO, ANIMATION_VARIANTS, TRANSITIONS } from "@/lib/constants";

export function HowItWorksSection(): JSX.Element {
  const steps = [
    {
      number: "01",
      icon: FileText,
      title: "Customer Submits Form",
      description: "A potential customer fills out your professional lead capture form with their contact information, needs, and message. Source tracking automatically captures UTM parameters and referrer data.",
    },
    {
      number: "02",
      icon: Sparkles,
      title: "Automatically Enriches the Lead",
      description: "The system automatically extracts company data from the email domain - company name and website. This happens instantly using intelligent domain parsing to identify company information.",
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Intelligently Scores the Lead (0-100)",
      description: "Using the enriched company data and message content, the system analyzes buying intent, urgency, message quality, and company size to generate an intelligent lead score. Optional AI enhancement available for deeper sentiment analysis. High-scoring leads are prioritized automatically.",
    },
    {
      number: "04",
      icon: Database,
      title: "Data Logged to Google Sheets",
      description: "All lead data, enrichment, score, reasoning, and source tracking are instantly logged to Google Sheets with 21 columns of intelligence. Your spreadsheet becomes a powerful CRM automatically.",
    },
    {
      number: "05",
      icon: Mail,
      title: "Team Gets Notified with Intelligence",
      description: "Your team receives immediate email and Slack notifications with the complete lead intelligence card - including score, enrichment data, source tracking, and score reasoning for smart prioritization.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2" />
      </div>
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start"
          variants={ANIMATION_VARIANTS.staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            className="space-y-6 md:space-y-8"
            variants={ANIMATION_VARIANTS.slideInLeft}
          >
            <motion.div
              className="space-y-3 md:space-y-4"
              variants={ANIMATION_VARIANTS.fadeIn}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                How It Works
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                Simple automated workflow for capturing and managing leads
              </p>
            </motion.div>

            <motion.div
              className="space-y-6 md:space-y-8"
              variants={ANIMATION_VARIANTS.staggerContainer}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4 md:gap-6 group"
                  data-testid={`step-${index}`}
                  variants={ANIMATION_VARIANTS.staggerItem}
                  whileHover={{ x: 4 }}
                  transition={TRANSITIONS.smooth}
                >
                  <div className="flex-shrink-0">
                    <motion.div
                      className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary/15 to-primary/10 dark:from-primary/20 dark:to-primary/15 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:from-primary/20 group-hover:to-primary/15 dark:group-hover:from-primary/25 dark:group-hover:to-primary/20 group-hover:scale-110 shadow-elevated group-hover:shadow-primary-glow"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={TRANSITIONS.spring}
                    >
                      <step.icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                    </motion.div>
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <span className="text-3xl md:text-4xl font-bold text-muted-foreground/40 dark:text-muted-foreground/50">
                        {step.number}
                      </span>
                      <h3 className="text-base md:text-lg font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative min-w-0"
            variants={ANIMATION_VARIANTS.slideInRight}
          >
            <motion.div
              className="space-y-4 min-w-0"
              variants={ANIMATION_VARIANTS.staggerContainer}
            >
              {/* Step 1: Form Submission */}
              <motion.div
                className="bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 border rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 hover-lift"
                variants={ANIMATION_VARIANTS.scaleIn}
                whileHover={{ y: -2 }}
                transition={TRANSITIONS.smooth}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary/15 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-sm md:text-base">Form Submission</span>
                </div>
                <div className="space-y-2.5 text-xs md:text-sm">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-right">{LEAD_DEMO.name}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-right break-all">{LEAD_DEMO.email}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-muted-foreground">Message:</span>
                    <span className="font-medium text-xs italic text-right flex-1">{LEAD_DEMO.message}</span>
                  </div>
                  <div className="pt-2.5 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart3 className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">Source: {LEAD_DEMO.source.source}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2-3: Lead Intelligence Card */}
              <motion.div
                className="bg-gradient-to-br from-primary/8 via-primary/4 to-background dark:from-primary/12 dark:via-primary/6 dark:to-background border border-primary/15 dark:border-primary/20 rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg transition-all duration-300"
                variants={ANIMATION_VARIANTS.scaleIn}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={TRANSITIONS.spring}
              >
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 md:w-12 md:h-12 bg-primary/15 dark:bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base md:text-lg truncate">Lead Intelligence</h3>
                      <p className="text-xs text-muted-foreground">AI-Enhanced Analysis</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <motion.div
                      className="text-2xl md:text-3xl font-bold text-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ ...TRANSITIONS.spring, delay: 0.2 }}
                    >
                      {LEAD_DEMO.score.score}
                    </motion.div>
                    <div className="text-xs text-muted-foreground">Score / 100</div>
                  </div>
                </div>

                {/* Score Reasoning */}
                <motion.div
                  className="mb-4 p-3 bg-primary/15 dark:bg-primary/20 rounded-xl border border-primary/15 dark:border-primary/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, ...TRANSITIONS.smooth }}
                >
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground mb-1">Score Reasoning</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {LEAD_DEMO.score.reasoning}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Enrichment Data */}
                <motion.div
                  className="space-y-2.5 md:space-y-3"
                  variants={ANIMATION_VARIANTS.staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {[
                    { icon: Building2, label: "Company", value: LEAD_DEMO.enrichment.companyName },
                    { icon: Globe, label: "Domain", value: LEAD_DEMO.enrichment.companyDomain, link: true },
                    { icon: BarChart3, label: "Industry", value: LEAD_DEMO.enrichment.industry },
                    { icon: Users, label: "Employees", value: LEAD_DEMO.enrichment.employeeCount },
                    { icon: MapPin, label: "Location", value: LEAD_DEMO.enrichment.location },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-2 text-xs md:text-sm min-w-0"
                      variants={ANIMATION_VARIANTS.staggerItem}
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                      <span className="text-muted-foreground flex-shrink-0">{item.label}:</span>
                      <span className="font-medium truncate">{item.value || "N/A"}</span>
                      {item.link && (
                        <span
                          role="button"
                          className="text-primary hover:underline cursor-pointer flex-shrink-0"
                          aria-label="Visit company website"
                          tabIndex={0}
                        >
                          <ExternalLink className="w-3 h-3 inline ml-1" aria-hidden="true" />
                        </span>
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Score Breakdown */}
                <motion.div
                  className="mt-4 pt-4 border-t"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, ...TRANSITIONS.smooth }}
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2">Score Breakdown</p>
                  <div className="space-y-1.5">
                    {Object.entries(LEAD_DEMO.score.factors).map(([key, value], idx) => {
                      const maxScores: Record<string, number> = {
                        messageIntent: 40,
                        messageUrgency: 20,
                        emailDomain: 20,
                        messageLength: 10,
                        phoneProvided: 10,
                      };
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      const numValue = typeof value === 'number' ? value : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{numValue}/{maxScores[key]}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>

              {/* Step 4: Google Sheets */}
              <motion.div
                className="bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 border rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 hover-lift"
                variants={ANIMATION_VARIANTS.scaleIn}
                whileHover={{ y: -2 }}
                transition={TRANSITIONS.smooth}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary/15 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="font-medium text-sm md:text-base">Google Sheets</span>
                </div>
                <div className="space-y-2 overflow-x-auto">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b min-w-[400px]">
                    <div>Name</div>
                    <div>Company</div>
                    <div>Score</div>
                    <div>Source</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs md:text-sm min-w-[400px]">
                    <div className="font-medium truncate">{LEAD_DEMO.name}</div>
                    <div className="truncate">{LEAD_DEMO.enrichment.companyName}</div>
                    <div className="text-primary font-bold">{LEAD_DEMO.score.score}</div>
                    <div className="truncate text-xs text-muted-foreground">{LEAD_DEMO.source.source}</div>
                  </div>
                    <div className="pt-2 text-xs text-muted-foreground italic">
                    + 16 more columns of intelligence data
                  </div>
                </div>
              </motion.div>

              {/* Step 5: Notification */}
              <motion.div
                className="bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 border rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:shadow-primary/10 transition-all duration-300 hover:border-primary/20 hover-lift"
                variants={ANIMATION_VARIANTS.scaleIn}
                whileHover={{ y: -2 }}
                transition={TRANSITIONS.smooth}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary/15 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="font-medium text-sm md:text-base">Email Notification</span>
                </div>
                <div className="text-xs md:text-sm space-y-2.5">
                  <p className="font-semibold text-foreground">New Lead: {LEAD_DEMO.name}</p>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <motion.span
                      className="px-2.5 py-1 bg-primary/15 dark:bg-primary/20 text-primary rounded-full font-medium"
                      whileHover={{ scale: 1.05 }}
                      transition={TRANSITIONS.spring}
                    >
                      Score: {LEAD_DEMO.score.score}
                    </motion.span>
                    <motion.span
                      className="px-2.5 py-1 bg-primary/15 dark:bg-primary/20 text-primary rounded-full font-medium"
                      whileHover={{ scale: 1.05 }}
                      transition={TRANSITIONS.spring}
                    >
                      {LEAD_DEMO.enrichment.companyName}
                    </motion.span>
                    <motion.span
                      className="px-2.5 py-1 bg-primary/15 dark:bg-primary/20 text-primary rounded-full font-medium"
                      whileHover={{ scale: 1.05 }}
                      transition={TRANSITIONS.spring}
                    >
                      High Priority
                    </motion.span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">Complete lead intelligence included in notification</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
