"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  PortfolioData,
  PortfolioSettings,
  SavePortfolioPayload,
} from "../api/portfolioApi";
import {
  fetchMyPortfolio,
  PortfolioApiError,
  savePortfolio,
} from "../api/portfolioApi";

/**
 * デフォルトのポートフォリオ設定を生成する
 */
const createDefaultSettings = (): PortfolioSettings => ({
  profile: {
    displayName: "",
    bio: "",
    avatarUrl: "",
    socialLinks: {
      github: "",
      x: "",
      zenn: "",
      qiita: "",
      atcoder: "",
      website: "",
    },
    careerStories: [],
    skills: [],
  },
  generation: {
    selectedSummaryIds: [],
    selfPrDraft: "",
  },
  generatedContent: {
    selfPr: "",
    strengths: "",
    learnings: "",
    futureVision: "",
  },
});

/**
 * 既存データをデフォルト値とマージして、未定義項目を補完する
 *
 * @param settings - APIから取得したポートフォリオ設定
 * @returns 欠損項目を補完したポートフォリオ設定
 */
const normalizePortfolioSettings = (
  settings: PortfolioSettings,
): PortfolioSettings => {
  const defaultSettings = createDefaultSettings();

  return {
    ...defaultSettings,
    ...settings,
    profile: {
      ...defaultSettings.profile,
      ...settings.profile,
      socialLinks: {
        ...defaultSettings.profile.socialLinks,
        ...settings.profile.socialLinks,
      },
      careerStories: settings.profile.careerStories ?? [],
      skills: settings.profile.skills ?? [],
    },
    generation: {
      ...defaultSettings.generation,
      ...settings.generation,
      selectedSummaryIds: settings.generation?.selectedSummaryIds ?? [],
      selfPrDraft: settings.generation?.selfPrDraft ?? "",
    },
    generatedContent: {
      ...defaultSettings.generatedContent,
      ...settings.generatedContent,
      selfPr: settings.generatedContent?.selfPr ?? "",
      strengths: settings.generatedContent?.strengths ?? "",
      learnings: settings.generatedContent?.learnings ?? "",
      futureVision: settings.generatedContent?.futureVision ?? "",
    },
  };
};

/**
 * ポートフォリオビルダーの状態管理・保存を行うカスタムフック
 *
 * Usage:
 * const { settings, slug, isPublic, updateProfile, updateGeneration, handleSave, isLoading, isSaving }
 *   = usePortfolioBuilder();
 */
export const usePortfolioBuilder = () => {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [settings, setSettings] = useState<PortfolioSettings>(
    createDefaultSettings(),
  );
  const [slug, setSlug] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * 既存のポートフォリオ設定を読み込む
   */
  const loadPortfolio = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("ログインが必要です");
      router.push("/signin");
      return;
    }

    setIsLoading(true);
    try {
      const existingPortfolio = await fetchMyPortfolio(token);
      if (existingPortfolio) {
        setPortfolio(existingPortfolio);
        setSlug(existingPortfolio.slug);
        setIsPublic(existingPortfolio.isPublic);
        if (existingPortfolio.settings) {
          setSettings(normalizePortfolioSettings(existingPortfolio.settings));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("ポートフォリオの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  /**
   * プロフィール設定を部分更新する
   */
  const updateProfile = useCallback(
    (updates: Partial<PortfolioSettings["profile"]>) => {
      setSettings((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...updates },
      }));
    },
    [],
  );

  /**
   * SNSリンクを部分更新する
   */
  const updateSocialLinks = useCallback(
    (
      updates: Partial<
        NonNullable<PortfolioSettings["profile"]["socialLinks"]>
      >,
    ) => {
      setSettings((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          socialLinks: { ...prev.profile.socialLinks, ...updates },
        },
      }));
    },
    [],
  );

  /**
   * AI生成入力設定を部分更新する
   */
  const updateGeneration = useCallback(
    (updates: Partial<PortfolioSettings["generation"]>) => {
      setSettings((prev) => ({
        ...prev,
        generation: { ...prev.generation, ...updates },
      }));
    },
    [],
  );

  /**
   * AI生成文章を部分更新する
   */
  const updateGeneratedContent = useCallback(
    (updates: Partial<PortfolioSettings["generatedContent"]>) => {
      setSettings((prev) => ({
        ...prev,
        generatedContent: {
          ...prev.generatedContent,
          ...updates,
        },
      }));
    },
    [],
  );

  /**
   * バリデーションチェックを行う
   */
  const validate = useCallback((): boolean => {
    if (!slug.trim()) {
      toast.error("スラッグを入力してください");
      return false;
    }
    if (!settings.profile.displayName.trim()) {
      toast.error("表示名を入力してください");
      return false;
    }
    return true;
  }, [slug, settings.profile.displayName]);

  /**
   * ポートフォリオを保存する
   */
  const handleSave = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("ログインが必要です");
      router.push("/signin");
      return;
    }

    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload: SavePortfolioPayload = {
        slug,
        isPublic,
        settings,
      };

      await savePortfolio(token, payload);
      toast.success("ポートフォリオを保存しました");
      await loadPortfolio();
    } catch (error) {
      if (error instanceof PortfolioApiError && error.statusCode === 409) {
        toast.error("このスラッグは既に使用されています");
      } else {
        console.error(error);
        toast.error("ポートフォリオの保存に失敗しました");
      }
    } finally {
      setIsSaving(false);
    }
  }, [slug, isPublic, settings, router, loadPortfolio, validate]);

  return {
    portfolio,
    settings,
    slug,
    isPublic,
    isLoading,
    isSaving,
    setSlug,
    setIsPublic,
    updateProfile,
    updateSocialLinks,
    updateGeneration,
    updateGeneratedContent,
    handleSave,
  };
};
