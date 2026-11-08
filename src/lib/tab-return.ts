import { useLayoutEffect } from "react";

const seen = new Set<string>();

/**
 * Marks <html data-tab-return> while the shown page was already opened in this visit, so its
 * cards skip the staggered entrance (styles.css). The first visit to each page keeps it.
 */
export function useTabReturn(pathname: string) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (seen.has(pathname)) root.dataset.tabReturn = "";
    else {
      delete root.dataset.tabReturn;
      seen.add(pathname);
    }
  }, [pathname]);
}
