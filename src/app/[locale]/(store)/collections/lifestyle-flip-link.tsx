"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const warmedRoute = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const warmLifestyleRoute = async () => {
    if (warmedRoute.current) {
      return;
    }

    router.prefetch(href);

    try {
      await fetch(href, {
        credentials: "same-origin",
        priority: "high",
      });
      warmedRoute.current = true;
    } catch {
      warmedRoute.current = true;
    }
  };

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
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
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    await warmLifestyleRoute();

    document.body.classList.add("lifestyle-page-flip");

    window.setTimeout(() => {
      router.push(href);
    }, 600);

    window.setTimeout(() => {
      document.body.classList.remove("lifestyle-page-flip");
      setIsNavigating(false);
    }, 1170);
  };

  return (
    <Link
      href={href}
      prefetch
      onClick={handleClick}
      onFocus={warmLifestyleRoute}
      onPointerEnter={warmLifestyleRoute}
      className={className}
      aria-disabled={isNavigating}
    >
      {children}
    </Link>
  );
}
