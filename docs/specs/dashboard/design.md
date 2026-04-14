# ダッシュボード機能 詳細設計書 (Dashboard Design)

## 1. フロントエンド実装設計 (Frontend)

### 1.1. コンポーネント構成 (`src/features/dashboard/`)

活動の集約・可視化を中心とするダッシュボード画面は以下のコンポーネント群で構成します。

- **`DashboardPage`**: ダッシュボードのメイン親コンポーネント。API群 (`useQuery`) から取得した外部活動と手動ログを統括し計算する。
- **`components/ContributionsHeatmap`**:
  GitHubの草ライクなコンポーネント (`react-calendar-heatmap` や D3ベース)。
  - DBに保存された活動記録（`activity_logs` などの内部ログ）と、連携済みの外部データ（`external_activities`）を**合算**した「総活動量」をカラーマップに反映させる。
- **`components/SummaryCharts`**:
  活動の推移や言語割合などを表示するグラフ群（`recharts` 等を利用）。
  - WakaTimeであれば言語割合サマリなどのドーナツチャート。
  - 記事などの執筆量などの棒グラフ。
- **`components/IntegrationSyncPanel`**:
  手持でデータを同期するためのコントロールパネル。
  - 各連携プラットフォーム（GitHub, WakaTime等）ごとの**「同期する」**ボタン。
  - APIを叩きに行き、スピナー表示をして正常終了を待機する。
  - なお、**Zenn / AtCoder の公開データ同期は OAuth 同期と性質が異なるため別設計**とし、詳細は `docs/specs/public_activity_sync/design.md` を参照する。

### 1.2. 状態管理 (State Management)

- **Data Aggregation (Hono RPC + React Query):**
  バックエンドのD1レコードをフロントエンドで集計（日次活動量を算出し、ヒートマップ用の配列 `[{ date: '2023-10-01', count: 5 }]` 等に整形するロジック）し、キャッシュします。
- **Rate Limit/Status (useState / useLocalStorage):**
  短時間での連打を防ぐため、フロント側でも手動同期の「最終同期日時」を管理し、1時間以内の再クリックをDisabledにするなどのガードを入れます。

---

## 2. バックエンド・API設計 (Backend)

### 2.1. API エンドポイント (Hono RPC)

#### ① 同期処理用API群 (Sync APIs)

- **エンドポイント:** `POST /api/sync/:provider` (例: `github`, `wakatime`)
- **処理フロー:**
  1.  `users` または `user_integrations` から当該ユーザーのOAuthトークン/IDを取得。
  2.  対象の外部API（GitHub GraphQL API や WakaTime API 等）へリクエストを投げ、直近のアクティビティを取得。
  3.  Cloudflare Workersの30秒制限以内に処理を完了させるため、複雑な加工はせず `external_activities` テーブルへ1日分のサマリーもしくは生JSONデータを挿入・更新(Upsert)する。
  4.  成功レスポンスを返す。

※ Zenn / AtCoder の公開データ同期は、負荷制御と非同期通知を重視して `POST /dashboard/public-sync/:provider` 系の別 API と Queue を採用する。詳細は `docs/specs/public_activity_sync/design.md` を参照する。

#### ② ダッシュボードデータ提供API (GET APIs)

- **エンドポイント:** `GET /api/dashboard/heatmap` および `GET /api/dashboard/stats`
- **処理フロー:**
  1.  指定期間（例：過去1年分）における `activity_logs`（独自ログ） と `external_activities`（外部データ）のレコードをDrizzle ORMでJOIN、あるいは並列で取得。
  2.  日別の活動ポイントに集約し、JSON配列としてフロントエンドへ返却する。

## 3. エラーハンドリング・コーナーケース

1.  **外部APIの障害/Rate Limit:** 手動同期ボタン押下時に、GitHub側のAPI制限等に引っかかった場合、Honoは適切なステータスコード（429 Too Many Requests 等）を返し、フロントエンド側でToast通知として「少し時間をおいて再度お試しください」と表示させます。
2.  **Workerタイムアウト:** 外部APIレスポンスの遅延で同期処理が30秒を超えそうな懸念がある場合は、将来的にAPI上で `Promise.race([fetch(...), timeoutPromise(25000)])` のような安全装置を検討します。
