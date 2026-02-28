# ポートフォリオ生成・共有機能 詳細設計書 (Portfolio Generation Design)

## 1. フロントエンド実装設計 (Frontend)

### 1.1. コンポーネント構成 (`src/features/portfolio/`)

最終的な成果物（Webページ）を生成およびプレビュー、共有設定を行うためのコンポーネントです。パブリックページビューとビルダービューの2系統に分かれます。

- **`PortfolioBuilderPage` (管理画面側)**:
  - **`components/ConfigSidebar`**: 左側（または下部）の設定パネル。表示項目（自己PRテキスト、ヒートマップウィジェット、特定タスクの成果物リンクなど）のトグル(ON/OFF) と、各種テキストの手動入力枠を持つ。
  - **`components/LivePreviewPane`**: メイン画面のポートフォリオプレビュー。ConfigSidebarでの変更が即座に反映されるSPAライクな挙動（ReduxやZustandのStore同期）を実現するコンポーネント。
  - **公開設定パネル**: トグルスイッチ（公開/非公開の切り替え）と、Slug（カスタムURL末尾）を編集・クリップボードへコピーできるUIを持つ。

- **`PublicPortfolioPage` (公開側ルート `app/[slug]/page.tsx`)**:
  非ログインユーザー（採用担当者等）が見る画面。取得した設定JSON（Drizzle）に合わせて、各種ウィジェットやサマリーのコンポーネントを描画する。

### 1.2. 状態管理 (State Management)

- **ポートフォリオ設定構成 (Client-Side State):**
  `PortfolioSettings` (例: `{ showHeatmap: true, summaryId: "abc", customSlug: "riku" }`) オブジェクトを `useState` または `Zustand` のストアで持ち、編集内容に応じて `LivePreviewPane` が即座にリアクティブレンダリングされる。
- **DB保存トリガー (Hono RPC Mutation):**
  設定内容の変更後、「保存（または公開）」ボタン押下時に設定JSONごとAPIへ `POST / PUT` する。

---

## 2. バックエンド・API設計 (Backend)

### 2.1. API エンドポイント (Hono RPC)

#### ① ポートフォリオ設定保存

- **エンドポイント:** `POST /api/portfolio`
- **処理フロー:**
  1.  ログインユーザーのIDに紐づく、フロントからのポートフォリオ設定（JSONB / Stringified JSON）と、Slug文字列を受け取る。
  2.  指定されたSlugが既に他のユーザーに使われていないかバリデーション（一意性チェック）。
  3.  `portfolios` テーブルにUPSERT（新規作成/更新）する。

#### ② 公開ポートフォリオ取得（非ログイン可）

- **エンドポイント:** `GET /api/portfolio/public/:slug`
- **処理フロー:**
  1.  リクエストされたSlugと一致し、且つ `is_public == true` であるポートフォリオレコードを取得する。
  2.  取得した設定JSON（例えばヒートマップ表示がON等）に基づき、必要な関連データ（`summaries` のテキストや `external_activities` の総計）をJOIN等のクエリでまとめて構築し、フロントエンドに返却する。

## 3. 将来拡張 (動的 OGP 画像生成機能)

本リリース時には見送りますが（MVP構築後）、以下の仕組みを設計上予約しておきます。

- **Hono ルーティングと Vercel `@vercel/og` 連携:**
  - `/api/og/:slug` のようなエンドポイントをHonoに用意。
  - 特定のSlugに対応するサマリー内の重要テキスト（目標や、活動日数など）や、ヒートマップのSVG要素をバックエンドで生成・合成して画像（PNG）として返却するロジック（Satori等のライブラリを利用）。
  - `app/[slug]/page.tsx` の Next.js メタデータ動的生成（`generateMetadata`）から、その画像URLを参照する。
