"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const isTheme = (value: string | null): value is Theme => {
  return value === "light" || value === "dark";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * アプリ全体で利用するテーマ状態を提供する。
 *
 * @param props - 子要素を含むプロパティ
 * @param props.children - テーマコンテキスト配下で描画する要素
 * @returns テーマコンテキストを提供するラッパー
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (isTheme(savedTheme)) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * 現在のテーマ状態と切り替え関数を取得する。
 *
 * @returns テーマ状態と切り替え関数
 * @throws {Error} ThemeProvider 配下で呼ばれていない場合
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
