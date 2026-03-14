import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import type { PortfolioSettings } from "@/features/portfolio/api/portfolioApi";
import { ConfigSidebar } from "@/features/portfolio/components/ConfigSidebar";
import { LivePreviewPane } from "@/features/portfolio/components/LivePreviewPane";

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
    chatInput: "",
    targetSection: "selfPr",
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
  const [isEditing, setIsEditing] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "assistant-1",
      role: "assistant" as const,
      content: "私は継続的な改善を得意とするエンジニアです。",
      targetSection: "selfPr" as const,
      status: "done" as const,
    },
  ]);

  return (
    <div>
      <ConfigSidebar
        settings={settings}
        onUpdateGeneration={(updates) => {
          setSettings((prev) => ({
            ...prev,
            generation: {
              ...prev.generation,
              ...updates,
            },
          }));
        }}
        isStreaming={false}
        messages={messages}
        onOpenSummarySelection={() => {}}
        onSendMessage={() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${prev.length + 1}`,
              role: "assistant",
              content: "私は継続的な改善を得意とするエンジニアです。",
              targetSection: "selfPr",
              status: "done",
            },
          ]);
        }}
        onApplyMessage={(messageId) => {
          const message = messages.find((item) => item.id === messageId);
          if (!message) return;
          setSettings((prev) => ({
            ...prev,
            generatedContent: {
              ...prev.generatedContent,
              selfPr: message.content,
            },
          }));
        }}
      />

      <LivePreviewPane
        settings={settings}
        isEditing={isEditing}
        onToggleEditing={() => setIsEditing((prev) => !prev)}
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
        onUpdateGeneratedContent={(updates) => {
          setSettings((prev) => ({
            ...prev,
            generatedContent: {
              ...prev.generatedContent,
              ...updates,
            },
          }));
        }}
      />
    </div>
  );
};

describe("Portfolio realtime preview", () => {
  it("閲覧モードでもPR・強みの4項目を常に表示する", () => {
    render(<PreviewHarness />);

    fireEvent.click(screen.getByRole("button", { name: "PR・強み" }));

    expect(screen.getByRole("heading", { name: "自己PR" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "強み" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "学び" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "将来" })).toBeInTheDocument();
    expect(screen.getAllByText("まだ入力されていません")).toHaveLength(4);
  });

  it("生成候補を適用するとプレビューへ即時反映される", () => {
    render(<PreviewHarness />);

    fireEvent.change(screen.getByLabelText("自由入力テキスト（必須）"), {
      target: { value: "採用担当向けにPRを生成してください" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送信して生成" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "この文章を適用" })[0],
    );

    fireEvent.click(screen.getByRole("button", { name: "PR・強み" }));

    const previewMain = screen.getByRole("main");
    expect(
      within(previewMain).getByText(
        "私は継続的な改善を得意とするエンジニアです。",
      ),
    ).toBeInTheDocument();
  });

  it("編集モードで中央エリアを編集すると即時反映される", () => {
    render(<PreviewHarness />);

    fireEvent.click(screen.getByRole("button", { name: "編集モードへ" }));

    const profileInput = screen.getByPlaceholderText("表示名");
    fireEvent.change(profileInput, {
      target: { value: "中央編集ユーザー" },
    });

    const profileTabButton = screen.getByRole("button", {
      name: "経歴・スキル",
    });
    fireEvent.click(profileTabButton);

    expect(screen.getByDisplayValue("中央編集ユーザー")).toBeInTheDocument();
  });
});
