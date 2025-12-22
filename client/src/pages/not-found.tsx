/**
 * 404 Not Found page.
 *
 * Displays when a route is not found.
 *
 * @author Lindsey Stead
 * @module client/pages/not-found
 */

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-background px-4">
      <Card className="w-full max-w-lg shadow-md border border-border">
        <CardContent className="pt-10 pb-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>

            <h1 className="text-3xl font-semibold text-foreground">
              Page Not Found
            </h1>

            <p className="text-sm text-muted-foreground max-w-sm">
              The page you&apos;re trying to reach doesn&apos;t exist or may have been moved.
              Please check the URL or return to the home page.
            </p>

            <a
              href="/"
              className="inline-flex items-center gap-1 mt-4 text-primary font-medium hover:underline"
            >
              Return Home →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
