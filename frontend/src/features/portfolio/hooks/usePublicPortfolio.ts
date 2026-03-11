"use client";

import { useEffect, useState } from "react";
import type { PublicPortfolioData } from "../api/portfolioApi";
import { fetchPublicPortfolio, PortfolioApiError } from "../api/portfolioApi";

/**
 * 公開ポートフォリオデータを取得するカスタムフック
 *
 * Usage:
 * const { portfolioData, isLoading, error } = usePublicPortfolio("riku");
 */
export const usePublicPortfolio = (slug: string) => {
  const [portfolioData, setPortfolioData] =
    useState<PublicPortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadPortfolio = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedPortfolio = await fetchPublicPortfolio(slug);
        setPortfolioData(fetchedPortfolio);
      } catch (fetchError) {
        if (fetchError instanceof PortfolioApiError) {
          setError(fetchError.message);
        } else {
          setError("ポートフォリオの取得に失敗しました");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, [slug]);

  return {
    portfolioData,
    isLoading,
    error,
  };
};
