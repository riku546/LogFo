# ポートフォリオAI文章生成・共有機能 詳細設計書 (Portfolio AI Narrative Design)

## 1. フロントエンド実装設計 (Frontend)

### 1.1. ルート構成

- ビルダー画面: `frontend/src/app/(app)/portfolio/page.tsx`
- 公開ページ: `frontend/src/app/portfolio/[slug]/page.tsx`

### 1.2. コンポーネント構成 (`frontend/src/features/portfolio/`)

- `ConfigSidebar`
  - プロフィール編集
  - AI文章生成入力（サマリー選択、自己PR下書き）
  - 4項目一括生成/項目別再生成
  - 生成結果編集
- `LivePreviewPane`
  - `PortfolioPublicView` を利用し、編集中設定をリアルタイム表示
- `PublishSettingsPanel`
  - 保存/公開設定導線
- `PublishSettingsModal`
  - Slug、公開/非公開切替、公開URLコピー
- `PortfolioPublicView`
  - 公開ページとプレビューで共通利用
  - タブ1: 経歴・スキル
  - タブ2: `PR・強み`（AI生成4セクションのみ）

### 1.3. 状態管理

- `usePortfolioBuilder` で以下を管理する:
  - `settings`
  - `slug`
  - `isPublic`
  - `isLoading`
  - `isSaving`
- `settings` には以下を保持:
  - `profile`
  - `generation`（`selectedSummaryIds`, `selfPrDraft`）
  - `generatedContent`（`selfPr`, `strengths`, `learnings`, `futureVision`）
- `page.tsx` 側で生成用状態を管理:
  - `isGeneratingContent`
  - `generatingTargetSection`
- 初期表示:
  - `GET /api/portfolio`
  - `GET /api/summary`（サマリー選択UI用）

### 1.4. 画面フロー

1. サマリー選択（最大5件）・自己PR下書き入力
2. `4項目を生成` 実行
3. 必要に応じて `項目別再生成`
4. テキストを手編集
5. `保存` で確定

---

## 2. バックエンド・API設計 (Backend)

### 2.1. APIエンドポイント

- `POST /api/portfolio`（JWT必須）
  - ポートフォリオ設定を保存（UPSERT）
- `GET /api/portfolio`（JWT必須）
  - 自分のポートフォリオ設定を取得
- `POST /api/portfolio/generate`（JWT必須）
  - AI文章生成（4項目一括/項目別再生成）
- `GET /api/summary`（JWT必須）
  - 自分のサマリー一覧を取得（生成入力UI向け）
- `GET /portfolio/public/:slug`（認証不要）
  - 公開ポートフォリオをSlugで取得

### 2.2. `POST /api/portfolio/generate` 仕様

- Request:
  - `selectedSummaryIds: string[]`（最大5件）
  - `selfPrDraft: string`
  - `profile`
  - `targetSection?: "selfPr" | "strengths" | "learnings" | "futureVision"`
  - `currentContent`（項目別再生成時の参照用）
- Validation:
  - `selectedSummaryIds` が空の場合、`selfPrDraft` は必須
  - 指定サマリーがユーザー所有であること
- Response:
  - `generatedContent`
    - `selfPr`
    - `strengths`
    - `learnings`
    - `futureVision`

### 2.3. 公開取得フロー (`GET /portfolio/public/:slug`)

1. Slugでポートフォリオ取得
2. 未存在は404、`isPublic = false` は403
3. `slug`, `settings` を返却

補足:
- 旧仕様の `summaries`, `roadmaps` は返却しない
- 公開ページは `settings.generatedContent` のみを表示

### 2.4. エラーハンドリング

- 400: バリデーションエラー（入力不足、5件超過等）
- 401: 認証エラー
- 403: 非公開ポートフォリオ、または他人サマリー指定
- 404: ポートフォリオ未存在
- 409: Slug重複

---

## 3. データ構造

### 3.1. `PortfolioSettings`

- `profile`
  - `displayName`, `bio`, `avatarUrl`
  - `socialLinks`
  - `careerStories[]`
  - `skills[]`
- `generation`
  - `selectedSummaryIds[]`
  - `selfPrDraft`
- `generatedContent`
  - `selfPr`
  - `strengths`
  - `learnings`
  - `futureVision`

### 3.2. 非互換変更

- `sections.summaryIds` / `sections.roadmapIds` を削除
- 旧公開表示データ（ロードマップ/サマリー本文）前提を廃止

---

## 4. テスト設計

### 4.1. Backend

- `POST /api/portfolio/generate`
  - 正常系（全体生成、項目別再生成）
  - 異常系（入力不足、6件以上、所有権違反）
- `GET /api/summary`
  - 自分のサマリー一覧を返す
- `GET /portfolio/public/:slug`
  - 新レスポンス形式（`slug`, `settings`）のみ返す

### 4.2. Frontend

- サイドバー
  - サマリー選択上限5件
  - 入力不足時の生成制御
- 生成フロー
  - 一括生成 -> 編集 -> 保存
  - 項目別再生成で対象項目のみ更新
- 公開表示
  - `PR・強み` タブで4項目の非空表示

## 5. 将来拡張

- 生成文のトーン切替（フォーマル/カジュアル）
- セクションごとの文字数ガイド強化
- 公開先（企業・用途）別テンプレート最適化
