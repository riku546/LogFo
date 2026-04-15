"use client";

import { useSyncExternalStore } from "react";

const MOBILE_VIEWPORT_MEDIA_QUERY = "(max-width: 639px)";

const subscribeToViewport = (onStoreChange: () => void) => {
  const mediaQueryList = window.matchMedia(MOBILE_VIEWPORT_MEDIA_QUERY);
  mediaQueryList.addEventListener("change", onStoreChange);

  return () => {
    mediaQueryList.removeEventListener("change", onStoreChange);
  };
};

const getViewportSnapshot = () => {
  return window.matchMedia(MOBILE_VIEWPORT_MEDIA_QUERY).matches;
};

const getServerViewportSnapshot = () => {
  return false;
};

/**
 * Usage:
 * const isMobileViewport = useIsMobileViewport();
 * const position = isMobileViewport ? "top-center" : "bottom-right";
 *
 * 現在のビューポートがモバイル幅かどうかを返す。
 *
 * @returns Tailwind の `sm` 未満であれば `true`
 */
export function useIsMobileViewport() {
  return useSyncExternalStore(
    subscribeToViewport,
    getViewportSnapshot,
    getServerViewportSnapshot,
  );
}
