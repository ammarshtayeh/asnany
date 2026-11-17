"use client";

import { useEffect, useState } from "react";

/**
 * «العروض» stays out of the navigation while there are no valid offers, and comes back
 * on its own as soon as one is published. The /offers page itself is always reachable.
 */
const OFFERS_HREF = "/offers";
const CACHE_KEY = "malamih_has_offers";

let pendingCheck: Promise<boolean | null> | null = null;

function checkHasOffers(): Promise<boolean | null> {
  if (!pendingCheck) {
    pendingCheck = fetch("/api/stats/public")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => (data ? Number(data.activeOffers) > 0 : null))
      .catch(() => null);
  }
  return pendingCheck;
}

function useHasOffers() {
  const [hasOffers, setHasOffers] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Last known answer first, so the link does not pop in on every page load.
    try {
      if (window.sessionStorage.getItem(CACHE_KEY) === "1") setHasOffers(true);
    } catch {
      /* storage unavailable */
    }

    void checkHasOffers().then((result) => {
      if (cancelled || result === null) return;
      setHasOffers(result);
      try {
        window.sessionStorage.setItem(CACHE_KEY, result ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return hasOffers;
}

/** Filters a list of nav links down to the ones whose section currently has content. */
export function useVisibleNavLinks<T extends { href: string }>(links: readonly T[]): T[] {
  const hasOffers = useHasOffers();
  return links.filter((link) => link.href !== OFFERS_HREF || hasOffers);
}
