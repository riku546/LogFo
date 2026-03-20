# ポートフォリオAI文章生成・共有機能 詳細設計書 (Portfolio AI Narrative Design)

## 1. フロントエンド実装設計 (Frontend)

### 1.1. ルート構成

- ビルダー画面: `frontend/src/app/(app)/portfolio/page.tsx`
- 公開ページ: `frontend/src/app/portfolio/[slug]/page.tsx`

### 1.2. コンポーネント構成 (`frontend/src/features/portfolio/`)

- `ConfigSidebar`
  - AIチャット専用
  - 画面最下部までの全高サイドバーとして表示
  - 上部: 時系列メッセージ（ユーザー入力 / AI応答）
  - 下部: 入力フォーム（targetSectionセレクト + 自由入力テキスト + 送信）
  - 入力フォームにはサマリー選択ボタンのみ表示
  - ストリーミング中のテキスト表示
  - ワンクリック適用（選択項目へ1件反映）
- `SummarySelectionModal`
  - サマリー一覧をモーダルで表示
  - サマリーの複数選択（最大5件）
  - `適用` で選択確定、`キャンセル` で未確定変更を破棄
- `LivePreviewPane`
  - `PortfolioPublicView` を利用し、編集中設定をリアルタイム表示
  - ページ全体の閲覧/編集モード切替を反映
- `PublishSettingsPanel`
  - 保存/公開設定導線
  - 右ペイン下部に固定配置
- `PublishSettingsModal`
  - Slug、公開/非公開切替、公開URLコピー
- `PortfolioPublicView`
  - 公開ページとプレビューで共通利用
  - ビルダー画面では編集モード時に入力UIを表示
  - 公開ページでは常に閲覧専用
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
  - `generation`（`selectedSummaryIds`, `chatInput`, `targetSection`）
  - `generatedContent`（`selfPr`, `strengths`, `learnings`, `futureVision`）
- `page.tsx` 側でUI状態を管理:
  - `isEditing`
  - `isStreaming`
  - `messages`
  - `streamingCandidateText`
  - `streamError`
  - `isSummarySelectionModalOpen`
  - `draftSelectedSummaryIds`（モーダル編集中の一時選択）
- 初期表示:
  - `GET /api/portfolio`
  - `GET /api/summary`（サマリー選択UI用）

### 1.4. 画面フロー

1. ページ表示後、必要に応じて `編集モード` に切り替える
2. 中央表示エリアでプロフィール / SNS / 経歴 / スキル / 生成済み4項目を直接編集する
3. サイドバーAIチャットで targetSection を選択し、自由入力テキストを入力する
4. サマリー選択ボタン押下でモーダルを開き、必要に応じてサマリーを選択して `適用` で確定する（`キャンセル` なら破棄）
5. SSEで生成テキストをストリーミング表示し、完了後にワンクリック適用する
6. 右ペイン下部の `保存` で確定する

---

## 2. バックエンド・API設計 (Backend)

### 2.1. APIエンドポイント

- `POST /api/portfolio`（JWT必須）
  - ポートフォリオ設定を保存（UPSERT）
- `GET /api/portfolio`（JWT必須）
  - 自分のポートフォリオ設定を取得
- `POST /api/portfolio/generate`（JWT必須）
  - AI文章生成（チャット入力ベース、SSEストリーミング）
- `GET /api/summary`（JWT必須）
  - 自分のサマリー一覧を取得（生成入力UI向け）
- `GET /portfolio/public/:slug`（認証不要）
  - 公開ポートフォリオをSlugで取得

### 2.2. `POST /api/portfolio/generate` 仕様

- Request:
  - `chatInput: string`（必須）
  - `targetSection: "selfPr" | "strengths" | "learnings" | "futureVision"`（必須）
  - `selectedSummaryIds: string[]`（最大5件）
  - `currentContent`（再提案時の文脈参照用）
- Validation:
  - `chatInput` は必須
  - `targetSection` は列挙値のみ許可
  - `selectedSummaryIds` は0〜5件
  - 指定サマリーがユーザー所有であること
- Response:
  - SSE（`text/event-stream`）
  - イベント例:
    - `delta`: 生成中テキスト断片
    - `complete`: 生成完了テキスト
    - `error`: エラー情報

補足:

- 生成結果の保存は即時実施しない。フロント側で候補テキストとして保持し、ユーザーがワンクリック適用後に保存ボタン押下で確定する。
- ワンクリック適用時は `targetSection` で指定した1項目のみ更新する。

### 2.3. 公開取得フロー (`GET /portfolio/public/:slug`)

1. Slugでポートフォリオ取得
2. 未存在は404、`isPublic = false` は403
3. `slug`, `settings` を返却

補足:

- 旧仕様の `summaries`, `roadmaps` は返却しない
- 公開ページは `settings.generatedContent` のみを表示
- 公開ページは閲覧専用で、編集UIは表示しない

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
  - `chatInput`
  - `targetSection`
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
  - 正常系（targetSectionを指定してSSEで生成テキストを受信）
  - 異常系（入力不足、section不正、6件以上、所有権違反）
- `GET /api/summary`
  - 自分のサマリー一覧を返す
- `GET /portfolio/public/:slug`
  - 新レスポンス形式（`slug`, `settings`）のみ返す

### 4.2. Frontend

- サイドバー
  - AIチャット専用であること
  - 画面最下部まで表示されること
  - 時系列メッセージ表示であること
  - 入力欄が下部に固定されること
  - targetSection の選択ができること
  - サマリー選択ボタンからモーダルを開けること
  - モーダルでサマリー選択上限5件を維持すること
  - モーダルで `適用` 時のみ選択が確定し、`キャンセル` 時は反映されないこと
  - 自由入力テキスト空の場合の生成制御
- 生成フロー
  - チャット送信 -> ストリーミング表示 -> ワンクリック適用 -> 保存
  - 適用時に選択中1項目のみ更新されること
- レイアウトフロー
  - 保存/公開設定導線が右ペイン下部に表示されること
- 編集フロー
  - 閲覧/編集モード切替
  - 中央表示エリアで全対象項目の編集が可能
- 公開表示
  - `PR・強み` タブで4項目の非空表示
  - 編集UIが出ないこと（閲覧専用）

## 5. 将来拡張

- 生成文のトーン切替（フォーマル/カジュアル）
- セクションごとの文字数ガイド強化
- 公開先（企業・用途）別テンプレート最適化
- AIチャット履歴の永続保存
