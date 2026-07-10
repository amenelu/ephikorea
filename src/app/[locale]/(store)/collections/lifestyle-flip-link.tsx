"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type LifestyleFlipLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
};

export function LifestyleFlipLink({
  href,
  className,
  children,
}: LifestyleFlipLinkProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("lifestyle-page-flip");

    window.setTimeout(() => {
      router.push(href);
    }, 460);

    window.setTimeout(() => {
      document.body.classList.remove("lifestyle-page-flip");
    }, 900);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
