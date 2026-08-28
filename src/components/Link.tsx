import NextLink from "next/link";
import type { ReactNode, MouseEvent } from "react";

type To = string | { pathname: string; search?: string; hash?: string };

export function Link({
  to,
  className,
  onClick,
  children,
}: {
  to: To;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}) {
  return (
    <NextLink href={to as never} className={className} onClick={onClick}>
      {children}
    </NextLink>
  );
}
