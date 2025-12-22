/**
 * Completion Step Component
 *
 * @author Lindsey Stead
 * @module client/pages/Setup/steps/CompletionStep
 */

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, ExternalLink, MessageSquare, AlertCircle } from "lucide-react";

export function CompletionStep() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">Setup Complete!</h3>
          <p className="text-muted-foreground">
            Your SmartSheetConnect instance is ready to capture leads.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => (window.location.href = "/")}
          className="h-auto py-6 flex flex-col items-center gap-2"
          variant="outline"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="font-medium">View My Site</span>
          <span className="text-xs text-muted-foreground">See your customized homepage</span>
        </Button>
        <Button
          onClick={() => {
            window.location.href = "/";
            setTimeout(() => {
              const formSection = document.getElementById("demo-form");
              if (formSection) {
                formSection.scrollIntoView({ behavior: "smooth" });
              }
            }, 500);
          }}
          className="h-auto py-6 flex flex-col items-center gap-2"
          variant="outline"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium">Test Lead Form</span>
          <span className="text-xs text-muted-foreground">Submit a test lead</span>
        </Button>
      </div>

      <Alert className="bg-muted/30">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Next Steps:</strong> Your contact form is live. Test it by submitting a lead from your homepage.
          You can always return to the setup wizard to make changes.
        </AlertDescription>
      </Alert>
    </div>
  );
}
