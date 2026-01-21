# Backend Architecture

## アーキテクチャ概要 (Architecture Overview)

Hono をベースにした Web API サーバーです。Cloudflare Workers での動作を前提とした軽量で高速な構成を目指します。

```
backend/src/
├── index.ts             # アプリケーションのエントリーポイント
├── db/                  # データベース関連
│   ├── schema.ts        # Drizzle テーブル定義
│   └── index.ts         # DB接続設定
├── routes/              # ルート定義 (Controller層)
│   ├── [resource]/      # リソースごとのルート定義
│   │   ├── [resource].ts        # Hono app instance for resource
│   │   ├── [resource].test.ts   # テスト
│   │   └── schema.ts    # Zodスキーマ
│   └── index.ts         # ルートの集約
├── services/            # ビジネスロジック (Service層 - オプション)
│   └── ...
├── middlewares/         # カスタムミドルウェア
│   └── auth.ts          # 認証など
└── utils/               # ユーティリティ
```

## Drizzle ORM の利用方針

- **Schema Definition**: DBスキーマの変更は必ず `drizzle-kit` のマイグレーションフローを通します。
- **Querying**:
  - 基本的には `db.select().from()...` のようなQuery Builder形式、または `db.query.users.findMany(...)` のようなRelational Query形式を使用します。
  - 複雑なSQLが必要な場合は、生のSQLを書く前にQuery Builderで表現できないか検討します。

## エラーハンドリング (Error Handling)

- Honoの `onError` を使用して、アプリケーション全体のエラーを一元管理します。
- 予期せぬエラーは 500 Internal Server Error とし、ログを出力します。
- クライアント起因のエラー(バリデーションエラーなど)は、適切なステータスコード(400, 404など)とエラーメッセージを返します。
