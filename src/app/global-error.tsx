"use client";

// Root crash boundary — catches errors even the root layout fails to render.
// Must render its own <html>/<body> (Next replaces the root layout here).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[SHOP CRASH]", error);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background">
        <div className="mx-4 max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-soft">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
            We hit an unexpected error
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your cart and account are safe. Please try again — or reload if the
            problem persists.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Ref: {error.digest}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={reset}
              className="h-11 rounded-md bg-primary font-medium text-primary-foreground shadow-gold transition-opacity hover:opacity-90"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="h-11 rounded-md border border-border font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Reload Shop
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
