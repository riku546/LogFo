"use client";

import { MenuIcon, MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchAuthSession } from "@/lib/auth";

const NAVIGATION_ITEMS = [
  { href: "/", label: "ホーム" },
  { href: "/guide", label: "ガイド" },
  { href: "/roadmap", label: "ロードマップ" },
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/summary", label: "サマリー" },
  { href: "/portfolio", label: "ポートフォリオ" },
] as const;

const isActivePath = (pathname: string | null, href: string) => {
  if (href === "/") return pathname === href;
  return pathname?.startsWith(href);
};

const validateAuthSession = async (token: string): Promise<boolean> => {
  try {
    await fetchAuthSession(token);
    return true;
  } catch (_error) {
    return false;
  }
};

const applyUnauthenticatedState = (
  setIsAuthenticated: (value: boolean) => void,
  setIsCheckingAuth: (value: boolean) => void,
) => {
  setIsAuthenticated(false);
  setIsCheckingAuth(false);
};

const resolveIsAuthenticated = async (
  token: string | null,
): Promise<boolean> => {
  if (!token) return false;

  const isValidSession = await validateAuthSession(token);
  if (!isValidSession) {
    localStorage.removeItem("token");
    return false;
  }

  return true;
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (pathname == null) return;

    let isMounted = true;
    const syncAuthState = async () => {
      const isAuthenticatedNow = await resolveIsAuthenticated(
        localStorage.getItem("token"),
      );
      if (!isMounted) return;

      if (!isAuthenticatedNow) {
        applyUnauthenticatedState(setIsAuthenticated, setIsCheckingAuth);
      } else {
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
      }
    };

    syncAuthState();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleAuthAction = () => {
    setIsSheetOpen(false);
    if (isAuthenticated) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      router.push("/signin");
      return;
    }
    router.push("/signin");
  };

  return (
    <header className="glass fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300">
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Log<span className="text-primary">Fo</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                aria-label="ナビゲーションメニューを開く"
              >
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] border-l border-slate-200 bg-white p-0 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:max-w-[280px]"
            >
              <SheetHeader className="border-b border-slate-200 dark:border-slate-700">
                <SheetTitle>メニュー</SheetTitle>
                <SheetDescription>
                  ページ移動とテーマ切り替えができます。
                </SheetDescription>
              </SheetHeader>

              <nav
                className="space-y-1 px-4 py-3"
                aria-label="モバイルナビゲーション"
              >
                {NAVIGATION_ITEMS.map((item) => {
                  const isActive = isActivePath(pathname, item.href);
                  return (
                    <SheetClose
                      key={item.href}
                      asChild
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Link
                        href={item.href}
                        className={`block cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-slate-200 p-4 dark:border-slate-700">
                <Button
                  type="button"
                  variant={isAuthenticated ? "destructive" : "default"}
                  className="mb-2 w-full cursor-pointer justify-start"
                  onClick={handleAuthAction}
                  disabled={isCheckingAuth}
                  aria-label="認証アクション"
                >
                  {isCheckingAuth
                    ? "確認中..."
                    : isAuthenticated
                      ? "ログアウト"
                      : "ログイン"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer justify-start"
                  onClick={toggleTheme}
                  aria-label="サイドバーでテーマを切り替える"
                >
                  {theme === "light" ? <MoonIcon /> : <SunIcon />}
                  テーマを切り替える
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
