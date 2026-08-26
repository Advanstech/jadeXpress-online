import { cn } from "@/lib/utils";

const PALETTES = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-foreground text-background",
  "bg-primary/80 text-primary-foreground",
];

export function InitialsAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const idx =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTES.length;
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-semibold",
        PALETTES[idx],
        className,
      )}
    >
      {initials || "JX"}
    </span>
  );
}
