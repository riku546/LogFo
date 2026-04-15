/**
 * ポートフォリオに表示するSNSリンク一覧
 */
export interface SocialLinks {
  github?: string;
  x?: string;
  zenn?: string;
  qiita?: string;
  atcoder?: string;
  website?: string;
}

/**
 * ポートフォリオに表示する経歴ストーリー
 */
export interface CareerStory {
  id: string;
  title: string;
  organization: string;
  periodFrom: string;
  periodTo?: string;
  isCurrent: boolean;
  story: string;
}

/**
 * ポートフォリオのプロフィール設定
 */
export interface ProfileSettings {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: SocialLinks;
  careerStories: CareerStory[];
  skills: string[];
}

/**
 * ポートフォリオでAI生成できるセクションキー
 */
export type PortfolioGeneratedSectionKey =
  | "selfPr"
  | "strengths"
  | "learnings"
  | "futureVision";

/**
 * AI文章生成時の入力設定
 */
export interface PortfolioGenerationSettings {
  selectedSummaryIds: string[];
  chatInput: string;
  targetSection: PortfolioGeneratedSectionKey;
}

/**
 * ポートフォリオで表示するAI生成文章
 */
export interface PortfolioGeneratedContent {
  selfPr: string;
  strengths: string;
  learnings: string;
  futureVision: string;
}

/**
 * ポートフォリオ全体の設定
 */
export interface PortfolioSettings {
  profile: ProfileSettings;
  generation: PortfolioGenerationSettings;
  generatedContent: PortfolioGeneratedContent;
}
