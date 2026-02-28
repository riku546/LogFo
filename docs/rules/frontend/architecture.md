# LogFo フロントエンド全体設計書 (Frontend Architecture & Design)

## 1. 基本方針と技術スタック

フロントエンドは、UXの高さ（SPAに近いシームレスな体験）とSEO・パフォーマンスの両立を目指し、以下の技術スタックを採用します。
また、Vercel 等のエッジ・サーバーレス環境ではなく、最終的には Cloudflare Pages へのデプロイを前提とした設定を行います。

- **コアフレームワーク:** Next.js (App Router) / React
- **スタイリング:** Tailwind CSS
- **状態管理 & データフェッチ:**
  - サーバー状態 (API・Hono通信): Hono RPC
  - クライアント状態 (UIの開閉や編集状態など): useState
- **LLM UI/ストリーミング:** Vercel AI SDK (`ai` および `@ai-sdk/react`)
- **コンポーネント管理:** Radix UI / shadcn/ui などをベースにしたアクセシブルなコンポーネント（想定）
- **Markdown / エディタ:** `react-markdown` や TipTapベースのリッチエディタ（Activity Tracking用）

## 2. ディレクトリ構成とモジュール設計

Feature-driven (機能駆動) なディレクトリ構成を採用し、関心事を分離します。
※ Next.js の `app` ディレクトリ（ルーティング）と、実際のコンポーネント（`src/features`）を明確に分けます。

```text
src/
├── app/                  # Next.js App Router (ルーティング、ページ全体、レイアウト)
├── components/           # 汎用的なUIコンポーネント (Button, Input, Layout等)
├── features/             # 各機能ドメインごとのモジュール
│   ├── roadmap/          # [Step1] ロードマップ生成
│   ├── activity/         # [Step2-1] 活動記録
│   ├── dashboard/        # [Step2-2] ダッシュボード
│   ├── summary/          # [Step3] AIサマリー生成機能
│   └── portfolio/        # [Step4] ポートフォリオ生成
├── hooks/                # 汎用カスタムフック (APIコール等以外)
├── lib/                  # 汎用ユーティリティ (Hono/APIクライアントの設定、AI SDK設定)
└── types/                # グローバルな型定義
```

## 3. エラーハンドリングとタイムアウト対策

- Cloudflare Workers側のAPIが制限時間内にレスポンスを返せなかったり（外部APIの遅延等）、OpenRouterの呼び出しでエラーが発生した場合に備え、`react-toastify` や `sonner` を利用してユーザーフレンドリーなエラー通知（トースト）を表示します。
- LLM実行中の離脱を防ぐため、ストリーミング中は「ページ離脱時の警告ダイアログ (beforeunload)」を設定します。
