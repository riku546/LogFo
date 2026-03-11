import { fireEvent, render, screen, within } from "@testing-library/react";
import { useMemo, useState } from "react";
import { describe, expect, it } from "vitest";
import type { PortfolioSettings } from "@/features/portfolio/api/portfolioApi";
import { ConfigSidebar } from "@/features/portfolio/components/ConfigSidebar";
import { LivePreviewPane } from "@/features/portfolio/components/LivePreviewPane";
import type { RoadmapListItem } from "@/features/roadmap/api/roadmapApi";
import type { SummaryItem } from "@/features/summary/api/summaryApi";

const availableRoadmaps: RoadmapListItem[] = [
  {
    id: "roadmap-1",
    currentState: "現状A",
    goalState: "ロードマップA",
    summary: "ロードマップ要約A",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
];

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
  sections: {
    roadmapIds: [],
    summaryIds: [],
  },
});

const PreviewHarness = () => {
  const [settings, setSettings] = useState<PortfolioSettings>(
    createInitialSettings(),
  );

  const selectedRoadmaps = useMemo(() => {
    const roadmapById = new Map(
      availableRoadmaps.map((roadmap) => [roadmap.id, roadmap]),
    );

    return settings.sections.roadmapIds
      .map((roadmapId) => roadmapById.get(roadmapId))
      .filter((roadmap): roadmap is RoadmapListItem => roadmap !== undefined);
  }, [settings.sections.roadmapIds]);

  const selectedSummaries = useMemo(() => {
    const summaryById = new Map(
      availableSummaries.map((summary) => [summary.id, summary]),
    );

    return settings.sections.summaryIds
      .map((summaryId) => summaryById.get(summaryId))
      .filter((summary): summary is SummaryItem => summary !== undefined);
  }, [settings.sections.summaryIds]);

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
        onUpdateSections={(updates) => {
          setSettings((prev) => ({
            ...prev,
            sections: {
              ...prev.sections,
              ...updates,
            },
          }));
        }}
        availableSummaries={availableSummaries}
        availableRoadmaps={availableRoadmaps}
      />

      <LivePreviewPane
        settings={settings}
        summaries={selectedSummaries}
        roadmaps={selectedRoadmaps}
      />
    </div>
  );
};

describe("Portfolio realtime preview", () => {
  it("サマリー/ロードマップ選択が保存前にプレビューへ即時反映される", () => {
    render(<PreviewHarness />);

    fireEvent.click(screen.getByLabelText("サマリーA"));
    fireEvent.click(screen.getByLabelText("ロードマップA"));
    fireEvent.click(screen.getByRole("button", { name: "ロードマップ" }));

    const previewMain = screen.getByRole("main");
    expect(within(previewMain).getByText("ロードマップA")).toBeInTheDocument();
    expect(within(previewMain).getByText("サマリー本文A")).toBeInTheDocument();
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
