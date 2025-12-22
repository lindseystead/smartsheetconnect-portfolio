/**
 * Setup Complete Card Component
 *
 * Shown when setup is already configured.
 *
 * @author Lindsey Stead
 * @module client/pages/Setup/components/SetupCompleteCard
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { SETUP_STORAGE_KEY, safeLocalStorage } from "../utils/localStorage";

interface SetupCompleteCardProps {
  onRestart: () => void;
  onEdit: () => void;
}

export function SetupCompleteCard({ onRestart, onEdit }: SetupCompleteCardProps) {
  const handleReset = async () => {
    if (confirm('Reset customer credentials? This will clear your configuration and return to the setup wizard.')) {
      try {
        const res = await fetch('/api/v1/setup/credentials', { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          safeLocalStorage.removeItem(SETUP_STORAGE_KEY);
          onRestart();
          const { queryClient } = await import("@/lib/queryClient");
          await queryClient.invalidateQueries({ queryKey: ["setup-status"] });
        } else {
          alert('Failed to reset credentials: ' + data.message);
        }
      } catch {
        alert('Failed to reset credentials');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 to-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <CardTitle>Setup Complete!</CardTitle>
          </div>
          <CardDescription>
            Your application is fully configured and ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                All required credentials are configured. You can now use the application.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Reset & Start Over
              </Button>
              <Button
                variant="outline"
                onClick={onEdit}
                className="flex-1"
              >
                Edit Configuration
              </Button>
              <Button onClick={() => (window.location.href = "/")} className="flex-1">
                Go to Application
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
