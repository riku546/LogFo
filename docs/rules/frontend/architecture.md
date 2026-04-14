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

## 2. アーキテクチャ構成とディレクトリ設計

本プロジェクトでは、優れたUI/UXの実現に開発リソースを集中させつつ、テスト容易性を担保するため **「軽量 Feature-Driven 構成 (Feature-Based Architecture)」** を採用しています。
選定のプロセス（なぜ厳密なFSD等ではなく、この手法を選んだのか）については以下のADRを参照してください。

- **詳細な選定理由（ADR）:** [フロントエンドアーキテクチャへの軽量 Feature-Driven 構成の採用](../../decision/frontend_architecture.md)

### ディレクトリ構成図

Next.js のルーティング機能（`app`）と、実際のビジネスロジック・コンポーネント群（`features`）を明確に分離します。

```text
src/
├── app/                  # Next.js App Router (ルーティング定義、ページレイアウト)
├── components/           # プロジェクト全体で使い回す汎用UIコンポーネント (Button, Input, Layout等)
├── features/             # 🌟 各機能ドメイン（軽量Feature-Drivenのコア）
│   ├── roadmap/          # [Step1] ロードマップ生成機能
│   │   ├── components/   # ロードマップ専用のUIコンポーネント
│   │   ├── hooks/        # ロードマップドメインのローカルStateやロジック
│   │   └── api/          # 該当機能のHono RPC呼び出し処理
│   ├── activities/       # [Step2] 活動記録・ダッシュボード
│   ├── summary/          # [Step3] AIサマリー生成
│   └── portfolio/        # [Step4] ポートフォリオ生成
├── hooks/                # 汎用カスタムフック (APIコール等以外、画面幅検知など)
├── lib/                  # 汎用ユーティリティ (Hono/APIクライアントの設定、utils等)
└── types/                # グローバルな型定義
```

## 3. エラーハンドリングとタイムアウト対策

- Cloudflare Workers側のAPIが制限時間内にレスポンスを返せなかったり（外部APIの遅延等）、OpenRouterの呼び出しでエラーが発生した場合に備え、`react-toastify` や `sonner` を利用してユーザーフレンドリーなエラー通知（トースト）を表示します。
- LLM実行中の離脱を防ぐため、ストリーミング中は「ページ離脱時の警告ダイアログ (beforeunload)」を設定します。

## 4. 依存関係ルールの機械的検証

フロントエンドでは `frontend/dependency-cruiser.cjs` により、以下の依存関係を `dependency-cruiser` で検証します。

- `src/components` は `src/features` と `src/app` に依存しない
- `src/lib` は `src/features` と `src/app` に依存しない
- `src/features` は `src/app` に依存しない
- 各 feature は他 feature に直接依存しない

理由:

- `app` は Next.js の配線層に限定し、ビジネスロジックや shared UI から逆流しないようにするため
- `components` と `lib` を shared layer として保ち、再利用性とテスト容易性を落とさないため
- feature 間の密結合を防ぎ、共通化が必要な要素を `src/components` / `src/lib` / `src/types` に切り出す判断を促すため

ローカル確認コマンド:

- `pnpm --filter frontend depcruise`
- `pnpm test:dependency-rules`
