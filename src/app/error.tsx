"use client";

// Route-segment error boundary — keeps the shop header/footer alive
// while showing a recoverable error card for the failed page.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[PAGE ERROR]", error);

  return (
    <div className="container flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-secondary text-2xl">
        🛠️
      </div>
      <h1 className="font-display text-2xl font-semibold text-foreground">
        This page hit a snag
      </h1>
      <p className="text-sm text-muted-foreground">
        {error.message ||
          "An unexpected error occurred while loading this page."}
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">
          Ref: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="h-11 rounded-md bg-primary px-8 font-medium text-primary-foreground shadow-gold transition-opacity hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  );
}
