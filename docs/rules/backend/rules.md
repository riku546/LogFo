# Backend Development Rules

## 実装フロー (Development Flow)

APIの実装は以下のステップで行います。

1.  **Zodスキーマ定義 (Schema Definition)**
    - APIの入力(Request)と出力(Response)を Zod スキーマとして定義します。
    - バリデーションルールはこの段階で詳細に記述します（例: `min(1)`, `email()`）。
    - **ルール**: Request/ResponseスキーマはHonoのRPC機能で共有されるため、`src/types` や共有ディレクトリなど、フロントエンドからも参照可能な場所に配置することを意識します（現状の構成に合わせる）。

2.  **型定義抽出 (Type Inference)**
    - ZodスキーマからTypeScriptの型定義を抽出(`z.infer`)します。

3.  **Hono Route 定義 (Route Definition)**
    - エンドポイントのパスとメソッドを定義し、Zod Validatorミドルウェアを設定します。
    - **Pseudo-code First**: ハンドラの中身を書く前に、処理の流れをコメントで記述します。
    - 例: `// Validate user -> Check DB -> Update record -> Return response`

4.  **テスト実装 (Test Implementation - Red)**
    - ロジックを実装する前に、期待する挙動を検証するテストコード(`vitest`)を作成します。
    - 正常系だけでなく、異常系（バリデーションエラー、NotFoundなど）のテストケースも列挙します。

5.  **実装 (Implementation - Green)**
    - テストが通るようにハンドラの実装を行います。
    - データベース操作は Drizzle ORM を使用します。

## テスト戦略 (Testing Strategy)

- **Framework**: Vitest
- **Unit Test**: ドメインロジックやユーティリティ関数のテスト。DB接続を伴わない純粋な関数の検証。
- **Integration Test**: Honoの `app.request` を使用して、エンドポイント全体の挙動を検証します。
  - テスト用のDB（SQLite in-memory や D1 local mock）を使用し、実際にクエリを発行して動作確認します。
  - テストごとにDBの状態をリセットまたはロールバックする仕組みを利用します。

## パフォーマンス (Performance)

- **N+1問題の回避**
  - ループ内でDBクエリを発行しないこと。
  - Drizzle ORM の `with` 句（Relation query）を使用するか、IDリストでまとめて取得してからアプリケーション側でマッピングします。
  - **Self-Correction**: コードレビュー時に「ループの中に `await db.select()...` がないか？」を必ず確認します。

- **メモリ効率 (Cloudflare Workers)**
  - Workers環境はメモリ制限が厳しいため、大量のデータを一度にメモリに展開することを避けます。
  - ストリーミング処理や、ページネーションによる分割取得を検討します。
