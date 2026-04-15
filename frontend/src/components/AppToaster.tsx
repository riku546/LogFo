"use client";

import { Toaster } from "sonner";
import { useIsMobileViewport } from "@/hooks/useIsMobileViewport";

const MOBILE_TOAST_OFFSET = {
  top: 80,
  left: 16,
  right: 16,
};

const DESKTOP_TOAST_OFFSET = 16;

/**
 * アプリ全体で利用するトースト通知の表示位置を制御する。
 * モバイルではヘッダー直下、デスクトップでは右下に表示する。
 *
 * @returns レスポンシブ設定済みの Toaster
 */
export function AppToaster() {
  const isMobileViewport = useIsMobileViewport();

  return (
    <Toaster
      position={isMobileViewport ? "top-center" : "bottom-right"}
      offset={DESKTOP_TOAST_OFFSET}
      mobileOffset={MOBILE_TOAST_OFFSET}
      richColors
      toastOptions={{
        duration: 3000,
      }}
    />
  );
}
