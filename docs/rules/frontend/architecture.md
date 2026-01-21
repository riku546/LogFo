# Frontend Architecture

## ディレクトリ構造 (Directory Structure)

Next.js App Router (src/app) をベースに、機能単位(feature-based)の構成を採用します。

```
src/
├── app/                 # App Router (Pages, Layouts, Route Handlers)
│   ├── (public)/        # 認証不要ページ
│   ├── (protected)/     # 認証必要ページ
│   ├── api/             # Next.js Route Handlers (BFF layer)
│   └── layout.tsx       # Root Layout
├── components/          # 汎用コンポーネント (UI Library)
│   ├── ui/              # ボタン、入力フォームなどの最小単位 (Atomic)
│   └── layouts/         # ヘッダー、フッターなどの枠組み
├── features/            # 機能単位のモジュール
│   ├── [feature-name]/  # 例: auth, rooms, logs
│   │   ├── components/  # 機能固有のUIコンポーネント
│   │   ├── hooks/       # 機能固有のロジック
│   │   ├── types/       # 機能固有の型定義
│   │   └── utils/       # 機能固有のユーティリティ
│   └── index.ts         # 公開APIの定義 (Barrel file)
├── lib/                 # 外部ライブラリのラッパー、設定
│   ├── api-client.ts    # Hono RPC Client設定
│   └── ...
└── utils/               # プロジェクト全体のユーティリティ
```

## アーキテクチャ原則 (Principles)

1.  **Colocation (関連するものを近くに置く)**:
    - 特定の機能でしか使わないコンポーネントやHooksは、`src/components` や `src/hooks` ではなく、`src/features/[feature]/` 配下に置きます。
    - これにより、機能の削除やリファクタリングが容易になります。

2.  **BFF (Backend For Frontend)**:
    - `src/app/api` は、フロントエンドが必要とするデータを整形して返すBFF層として機能させます。
    - 複雑なビジネスロジックはBackend (Hono) に委譲し、ここではデータのマッピングやセッション管理などの「つなぎ」の処理を行います。

3.  **Strict Boundary**:
    - `features` 間での直接参照は極力避け、必要な場合は上位コンポーネント(Page)を通じて連携させるか、共通部分として切り出します。

## テクノロジー選定 (Technology Stack)

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS (Utility-first)
- **Data Fetching**: Hono RPC (Type-safe API client) or Server Actions
- **Validation**: Zod (Schema validation)
