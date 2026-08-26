"use client";
import { Link } from "@/components/Link";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <span className="grid size-14 place-items-center rounded-xl bg-primary text-primary-foreground shadow-elegant">
        <Leaf className="size-7" />
      </span>
      <div>
        <p className="font-display text-6xl font-semibold text-foreground">404</p>
        <p className="mt-2 text-muted-foreground">
          We couldn't find that page.
        </p>
      </div>
      <Button asChild className="shadow-gold">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
