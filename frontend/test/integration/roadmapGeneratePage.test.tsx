import { render, screen } from "@testing-library/react";
import type { FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import RoadmapGeneratePage from "@/app/roadmap/generate/page";
import { useRoadmapGenerate } from "@/features/roadmap/hooks/useRoadmapGenerate";

vi.mock("@/features/roadmap/components/RoadmapResult", () => ({
  RoadmapResult: () => <div data-testid="roadmap-result" />,
}));

vi.mock("@/features/roadmap/hooks/useRoadmapGenerate", () => ({
  useRoadmapGenerate: vi.fn(),
}));

describe("Roadmap generate page", () => {
  it("ロードマップ一覧に戻るリンクが表示される", () => {
    const mockValue = {
      currentOccupation: "",
      setCurrentOccupation: vi.fn(),
      currentSkills: [],
      otherSkills: "",
      setOtherSkills: vi.fn(),
      dailyStudyHours: 1,
      setDailyStudyHours: vi.fn(),
      targetCompanies: "",
      setTargetCompanies: vi.fn(),
      targetPosition: "",
      setTargetPosition: vi.fn(),
      targetSkills: "",
      setTargetSkills: vi.fn(),
      targetPeriodMonths: 3,
      setTargetPeriodMonths: vi.fn(),
      userPdfFile: null,
      companyPdfFile: null,
      generatedRoadmap: undefined,
      isGenerating: false,
      isSaving: false,
      toggleSkill: vi.fn(),
      handleGenerate: vi.fn((event: FormEvent) => event?.preventDefault()),
      handleSave: vi.fn(),
      resetResult: vi.fn(),
      stopGeneration: vi.fn(),
      userDropzone: {
        getRootProps: vi.fn((props) => props ?? {}),
        getInputProps: vi.fn((props) => props ?? {}),
        isDragActive: false,
        open: vi.fn(),
      },
      companyDropzone: {
        getRootProps: vi.fn((props) => props ?? {}),
        getInputProps: vi.fn((props) => props ?? {}),
        isDragActive: false,
        open: vi.fn(),
      },
    } as unknown as ReturnType<typeof useRoadmapGenerate>;

    vi.mocked(useRoadmapGenerate).mockReturnValue(mockValue);

    render(<RoadmapGeneratePage />);

    const backLink = screen.getByRole("link", {
      name: "← ロードマップ一覧に戻る",
    });
    expect(backLink).toHaveAttribute("href", "/roadmap");
  });
});
