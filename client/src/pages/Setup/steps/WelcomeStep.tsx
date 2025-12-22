/**
 * Welcome Step Component
 *
 * @author Lindsey Stead
 * @module client/pages/Setup/steps/WelcomeStep
 */

import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">Welcome to SmartSheetConnect</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Get set up in just a few minutes. We&apos;ll guide you through each step.
          </p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-medium">What you&apos;ll need</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
            <span>A Google account</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
            <span>About 5-10 minutes</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
            <span>Optional: Slack workspace</span>
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { icon: "📊", label: "Google Sheets", desc: "Auto-log leads" },
          { icon: "📧", label: "Email Alerts", desc: "Instant notifications" },
          { icon: "💬", label: "Slack", desc: "Team notifications" },
          { icon: "🔗", label: "Webhooks", desc: "Connect services" },
          { icon: "✨", label: "AI Scoring", desc: "Smart intelligence" },
          { icon: "📊", label: "Analytics", desc: "Source tracking" },
        ].map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-muted/20 text-center hover:bg-muted/30 transition-colors">
            <div className="text-xl mb-1">{item.icon}</div>
            <p className="text-xs font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button onClick={onNext} className="flex-1">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
}
