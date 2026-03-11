# ポートフォリオ生成・共有機能 詳細設計書 (Portfolio Generation Design)

## 1. フロントエンド実装設計 (Frontend)

### 1.1. ルート構成

- ビルダー画面: `frontend/src/app/(app)/portfolio/page.tsx`
- 公開ページ: `frontend/src/app/portfolio/[slug]/page.tsx`

### 1.2. コンポーネント構成 (`frontend/src/features/portfolio/`)

- `ConfigSidebar`
  - プロフィール、SNS、経歴ストーリー、スキル、サマリー選択、ロードマップ選択を編集する。
- `LivePreviewPane`
  - `PortfolioPublicView` を利用し、編集中の設定をリアルタイム表示する。
- `PublishSettingsPanel`
  - 保存ボタン、公開設定モーダル起動ボタンを提供する。
- `PublishSettingsModal`
  - Slug編集、公開/非公開トグル、公開URLコピーを提供する。
- `PortfolioPublicView`
  - 公開ページとプレビューで共通利用する表示コンポーネント。
  - プロフィールタブ（経歴・スキル）とロードマップタブ（ロードマップ一覧/詳細 + サマリー）を表示する。

### 1.3. 状態管理

- `usePortfolioBuilder` で以下を `useState` 管理する。
  - `settings`
  - `slug`
  - `isPublic`
  - `isLoading`
  - `isSaving`
- 初期表示時に `GET /api/portfolio` で既存設定を取得し、ローカル状態へ正規化して反映する。
- 保存時は `POST /api/portfolio` を呼び出し、UPSERTする。
- 公開ページは `usePublicPortfolio` で `GET /portfolio/public/:slug` をクライアント取得する。

### 1.4. 設定データ構造 (`PortfolioSettings`)

- `profile`
  - `displayName`, `bio`, `avatarUrl`
  - `socialLinks`（GitHub, X, Zenn, Qiita, AtCoder, Website）
  - `careerStories[]`（id, title, organization, periodFrom, periodTo, isCurrent, story）
  - `skills[]`
- `sections`
  - `summaryIds[]`
  - `roadmapIds[]`

---

## 2. バックエンド・API設計 (Backend)

### 2.1. APIエンドポイント

- `POST /api/portfolio`（JWT必須）
  - ポートフォリオ設定を保存（UPSERT）
- `GET /api/portfolio`（JWT必須）
  - ログインユーザー自身の設定を取得
- `GET /portfolio/public/:slug`（認証不要）
  - 公開中ポートフォリオをSlugで取得

### 2.2. 保存処理フロー (`POST /api/portfolio`)

1. リクエストボディをZodで検証する（Slug形式、表示名、設定構造）。
2. Slugの一意性を確認する（自分自身の更新は除外）。
3. `portfolios` テーブルへユーザー単位でUPSERTする。
4. 保存済み `portfolioId` を返却する。

### 2.3. 公開取得フロー (`GET /portfolio/public/:slug`)

1. Slugでポートフォリオを取得する。
2. レコード未存在は404、`isPublic = false` は403を返す。
3. `settings.sections.summaryIds` / `roadmapIds` を読み取り、関連データを取得する。
4. 返却値は `slug`, `settings`, `summaries`, `roadmaps`。

補足:
- 現在はID配列をもとにリポジトリへ個別取得を行い、`Promise.all` で並列化している。
- JOINや外部活動データ統合は将来の最適化対象とする。

### 2.4. エラーハンドリング

- 400: バリデーションエラー
- 401: 認証情報不正
- 403: 非公開ポートフォリオへのアクセス
- 404: ポートフォリオ未存在
- 409: Slug重複

## 3. 将来拡張

- 外部連携データウィジェット（ヒートマップ、言語グラフ、コミット集計）
- ドラッグ＆ドロップ並び替え
- LLMによるレイアウト提案
- 期限付きURL、パスワード保護共有
- CTA（面談申込/問い合わせ）導線
- OGP画像動的生成（例: `/api/og/:slug`）と公開ページメタデータ連携
