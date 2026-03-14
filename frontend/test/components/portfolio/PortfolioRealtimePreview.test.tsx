import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { PortfolioSettings } from "@/features/portfolio/api/portfolioApi";
import { ConfigSidebar } from "@/features/portfolio/components/ConfigSidebar";
import { LivePreviewPane } from "@/features/portfolio/components/LivePreviewPane";
import type { SummaryItem } from "@/features/summary/api/summaryApi";

const availableSummaries: SummaryItem[] = [
  {
    id: "summary-1",
    userId: "user-1",
    milestoneId: "milestone-1",
    title: "サマリーA",
    content: "サマリー本文A",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "summary-2",
    userId: "user-1",
    milestoneId: "milestone-1",
    title: "サマリーB",
    content: "サマリー本文B",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
];

const createInitialSettings = (): PortfolioSettings => ({
  profile: {
    displayName: "テストユーザー",
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

const PreviewHarness = () => {
  const [settings, setSettings] = useState<PortfolioSettings>(
    createInitialSettings(),
  );

  return (
    <div>
      <ConfigSidebar
        settings={settings}
        onUpdateProfile={(updates) => {
          setSettings((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              ...updates,
            },
          }));
        }}
        onUpdateSocialLinks={(updates) => {
          setSettings((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              socialLinks: {
                ...prev.profile.socialLinks,
                ...updates,
              },
            },
          }));
        }}
        onUpdateGeneration={(updates) => {
          setSettings((prev) => ({
            ...prev,
            generation: {
              ...prev.generation,
              ...updates,
            },
          }));
        }}
        onUpdateGeneratedContent={(updates) => {
          setSettings((prev) => ({
            ...prev,
            generatedContent: {
              ...prev.generatedContent,
              ...updates,
            },
          }));
        }}
        availableSummaries={availableSummaries}
        isGeneratingContent={false}
        generatingTargetSection={null}
        onGenerateContent={() => {
          // no-op
        }}
      />

      <LivePreviewPane settings={settings} />
    </div>
  );
};

describe("Portfolio realtime preview", () => {
  it("AI生成セクション編集が保存前にプレビューへ即時反映される", () => {
    render(<PreviewHarness />);

    fireEvent.click(screen.getByLabelText("サマリーA"));
    fireEvent.change(screen.getByLabelText("自己PR下書き（任意）"), {
      target: { value: "下書きです" },
    });
    fireEvent.change(screen.getByLabelText("自己PR"), {
      target: { value: "私は継続的な改善を得意とするエンジニアです。" },
    });

    fireEvent.click(screen.getByRole("button", { name: "PR・強み" }));

    const previewMain = screen.getByRole("main");
    expect(
      within(previewMain).getByText(
        "私は継続的な改善を得意とするエンジニアです。",
      ),
    ).toBeInTheDocument();
  });

  it("経歴ストーリーとスキル入力が保存前にプレビューへ即時反映される", () => {
    render(<PreviewHarness />);

    fireEvent.click(screen.getByRole("button", { name: "経歴を追加" }));
    fireEvent.change(screen.getByLabelText("役割・職種"), {
      target: { value: "フロントエンドエンジニア" },
    });
    fireEvent.change(screen.getByLabelText("所属・組織"), {
      target: { value: "LogFo" },
    });
    fireEvent.change(screen.getByLabelText("ストーリー"), {
      target: { value: "UI改善を主導しました" },
    });

    fireEvent.change(screen.getByLabelText("スキル入力"), {
      target: { value: "React" },
    });
    fireEvent.click(screen.getByRole("button", { name: "スキルを追加" }));

    const previewMain = screen.getByRole("main");
    expect(
      within(previewMain).getByText("フロントエンドエンジニア"),
    ).toBeInTheDocument();
    expect(
      within(previewMain).getByText("UI改善を主導しました"),
    ).toBeInTheDocument();
    expect(within(previewMain).getByText("React")).toBeInTheDocument();
  });
});
