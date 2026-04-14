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

## 3. アーキテクチャ構成

本プロジェクトではバックエンドの設計において **「オニオンアーキテクチャ (Onion Architecture)」** を採用しています。
選定の背景や比較検討のプロセス（なぜプロトタイプフェーズでありながらオニオンを選択したのか）については、以下のADRを参照してください。

- **詳細な選定理由（ADR）:** [バックエンドアーキテクチャへのオニオンアーキテクチャの採用](../../decision/backend_architecture.md)

## 4. ディレクトリ構成 (オニオンアーキテクチャ)

上記の設計思想に基づいて、中心（ドメイン）から外側（インフラ・UI）へ依存が向かう構成を採用します。

```text
src/
├── index.ts                      # アプリケーションのエントリーポイント
├── core/                         # 🌟 中心（ドメイン）。外部ライブラリ・DBに絶対依存しない
│   ├── domain/
│   │   └── models/               # Zodスキーマや純粋な型定義（エンティティ）
│   └── application/
│       ├── usecases/             # ビジネスロジック。Serviceに相当
│       └── interfaces/           # DB実体に依存しないRepository等のインターフェース
│
├── infrastructure/               # 🍎 最外層（インフラ）。具体技術に依存
│   ├── database/                 # Dizzleのスキーマ・クライアント設定 (D1)
│   └── repositories/             # interfacesを満たす具体的なDrizzle実装
│
└── presentation/                 # 🍎 最外層（UI/通信）。Honoのルーティング
    └── routes/                   # 各エンドポイントの定義とDI（依存性の注入）
```

## 5. データモデル (Drizzle ORM / Cloudflare D1)

各機能を満たすためのDBスキーマの全体像です。これらは `infrastructure/database/schema.ts` で定義されます。

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

## 6. 依存関係ルールの機械的検証

バックエンドでは `backend/dependency-cruiser.cjs` により、以下の依存関係を `dependency-cruiser` で検証します。

- `core/domain` は `core/application` に依存しない
- `core` は `infrastructure` / `presentation` / `lib` / `schema` に依存しない
- `infrastructure` は `presentation` に依存しない

理由:

- オニオンアーキテクチャの依存方向を、レビュー頼みではなく CI で強制するため
- usecase / domain を外側の実装詳細から隔離し、仕様駆動開発と単体テストを保ちやすくするため
- schema や外部サービス実装への直接依存を避け、core にはユースケースに必要な型とインターフェースだけを置くため

ローカル確認コマンド:

- `pnpm --filter backend depcruise`
- `pnpm test:dependency-rules`
