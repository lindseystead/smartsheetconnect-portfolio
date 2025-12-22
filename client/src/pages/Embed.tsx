/**
 * Embed Page
 * 
 * Standalone page for embedding the form in iframes.
 * Minimal styling, just the form.
 * 
 * @author Lindsey Stead
 * @module client/pages/Embed
 */

import { EmbeddableForm } from "@/components/EmbeddableForm";
import { useAppConfig } from "@/hooks/useAppConfig";

export default function Embed(): JSX.Element {
  const { data: config, isLoading } = useAppConfig();

  const title = config?.content?.form?.title || "Get in Touch";
  const description = config?.content?.form?.description || "Fill out the form below and we'll get back to you as soon as possible";
  const submitText = config?.content?.form?.submitText || "Send Message";

  if (isLoading) {
    return (
      <div className="min-h-screen p-5 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 bg-background flex items-center justify-center">
      <div className="max-w-[600px] w-full">
        <EmbeddableForm
          title={title}
          description={description}
          submitText={submitText}
        />
      </div>
    </div>
  );
}

