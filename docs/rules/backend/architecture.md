# LogFo バックエンド全体設計書 (Backend Architecture & Design)

## 1. 基本方針と技術スタック

バックエンドは、エッジ対応かつ型安全で高速な環境を実現するため、Cloudflare Workers 上に構築される API サーバー（BFF層）を前提としています。

- **バックエンドフレームワーク:** Hono
- **ランタイム環境:** Cloudflare Workers (または Pages Functions)
- **データベース & ORM:**
  - データベース: Cloudflare D1 (分散型SQLite)
  - ORM: Drizzle ORM (Edge環境へ最適化、TypeScriptでの高い型安全性)
- **認証:** (Hono側でのセッション/JWT管理)
- **LLM連携 SDK:** Vercel AI SDK Core (`@ai-sdk/core`)
- **モデル・プロバイダ:** OpenRouter API経由の `glm-4.5-air` (Web検索込み)

## 2. システム制約（Cloudflare Workers）と対策全体方針

Cloudflare Workers には実行時間（CPUタイム最大30秒など）の厳格な制限があるため、以下の全体方針で設計します。
各機能ごとの詳細なタイムアウト対策・設計については、それぞれの機能設計書（`docs/specs/機能名/design.md`）を参照してください。

- **AI/LLMストリーミング生成への対応:** Honoのエンドポイント内でVercel AI SDKの `streamText` や `streamObject` を使用し、ストリーミング（SSE）として即座にレスポンスを返すアーキテクチャを採用することで、サーバーのタイムアウトエラーを防ぎます。
- **外部データ同期の運用:** 複数外部APIからデータを重く引っ張るバッチ処理（Cron）は、初手では採用せず、ユーザーのボタン押下などによるオンデマンド取得を基本とします。

## 3. ディレクトリ構成と API ルーティング (Hono)

Hono の Router の階層化（`app.route(...)`）を活用し、機能ごとに分割します。すべて RPC ライクな型共有（hono/rpc）を目的として、`index.ts` にエンドポイントの型を集約します。

```text
src/
├── index.ts              # Hono アプリケーションのエントリーポイント
├── db/                   # Drizzle ORM関連
│   ├── schema.ts         # テーブル定義 (Users, Roadmaps, Activities, etc.)
│   └── index.ts          # D1 への接続インスタンス
├── routes/
│   ├── roadmap/        # ロードマップ生成・保存・取得API
│   ├── activities/     # 活動記録のCRUD API
│   ├── sync/           # 外部データ（Github/Wakatime等）の手動同期API
│   └── summary/        # LLMでの要約生成API
├── services/             # API以外のビジネスロジック
└── utils/                # 共通のユーティリティ関数
```

## 4. データモデル (Drizzle ORM / Cloudflare D1)の基本構成

各機能を満たすためのDBスキーマの全体像（概略）です。

- **`users` テーブル** （ID, 氏名, プロフィール設定, 登録日）
- **`user_integrations` テーブル** （WakaTime用トークン, GitHubのユーザー名など、外部データ連携設定用）
- **ロードマップ管理テーブル**
  - **`roadmaps` テーブル** （ユーザーID, 現状, 目標, 全体サマリ, PDF抽出テキスト）
  - **`milestones` テーブル** （ロードマップID, タイトル, 順序）
  - **`tasks` テーブル** （マイルストーンID, タスクの内容, 予想時間, ステータス[TODO, IN_PROGRESS, DONE]）
- **`activity_logs` テーブル**
  - （タスクIDへの外部キー、活動内容/Markdownテキスト、リンクURL、作成日時）
- **`external_activities` テーブル (同期バッファ)**
  - ダッシュボードの草（ヒートマップ）を描画するためにキャッシュしておくテーブル。
  - （ユーザーID、ソース[github/wakatime/zenn]、日付、活動量[時間やコミット数]、JSON詳細）
- **`summaries` テーブル**
  - LLMで要約・作成済みの自己PRや活動サマリーのテキスト情報。
- **`portfolios` テーブル**
  - サマリーや表示したいウィジェット（外部データ）の設定、パブリックリンクとなるSlug文字列。
