# 日常的な活動・進捗記録機能 詳細設計書 (Activity Tracking Design)

## 1. フロントエンド実装設計 (Frontend)

### 1.1. コンポーネント構成 (`src/features/activity/`)

ロードマップページ内で開閉するドロワーや単体ページとして、以下のコンポーネントを配置します。

- **`ActivityDrawer`**: ロードマップからタスクがクリックされた際に右からスライドして表示されるラッパーコンポーネント。
  - **タスクメタ情報部**: タスクのタイトル、現状ステータス (Todo/InProgress/Done) の切り替えトグルを持つ。
- **`components/MarkdownEditor`**: 日々の活動記録を入力・編集・プレビューできるリッチなMarkdownエディタ。`react-markdown` または TipTapを使用。
  - **`LLMAssistancePanel`**: エディタの横または下部に鎮座する「LLMによる記録作成支援機能」のUI。チャット形式でアウトラインを作らせたり、質問に答えて文章を生成する。
- **`components/ActivityTimeline`**: 過去の活動記録（同じタスクに対する「月曜の記録」「水曜の記録」等）を時系列でカード表示するUI。

### 1.2. 状態管理 (State Management)

- **EditorState (useState / Zustand):**
  エディタ内で編集中のマークダウンテキスト情報。保存時にAPIに送信する。
- **TaskStatus (Hono RPC + React QueryのuseMutation):**
  ステータストグル（Todo → InProgress等）をクリックした際、即座にオプティミスティックUIアップデートをかけ、非同期でAPIへ送る。
- **AI Assitance State (Vercel AI SDK `useChat`):**
  LLMと対話するアシスタントの状態管理。

---

## 2. バックエンド・API設計 (Backend)

### 2.1. API エンドポイント (Hono RPC)

#### ① 活動記録取得 (GET API)

- **エンドポイント:** `GET /api/activities/:taskId`
- **処理フロー:** Drizzle ORMで `activity_logs` テーブルから紐づくタスクIDの記録を日時降順で取得して返す。

#### ② 活動記録の作成・更新 (POST/PUT API)

- **エンドポイント:** `POST /api/activities` (新規作成)
- **リクエストボディ:**
  - `taskId` (UUID)
  - `content` (Markdown String: 学習した内容などのテキスト)
- **処理フロー:**
  1.  `activity_logs` にレコードを `INSERT`。
  2.  タスク自体のステータスが「完了」になった等の付帯更新があれば、`tasks`テーブルも同時に `UPDATE`。

#### ③ 記録作成支援AI (Streaming API)

- **エンドポイント:** `POST /api/activities/assist`
- **処理フロー:**
  1.  フロントエンドのエディタでの記述の続き、または「どういう質問に答えればいいですか？」といったプロンプトを受け取る。
  2.  対象タスクのタイトルとこれまでの記録、およびユーザーからのメッセージをコンテキストに含めてシステムプロンプトを構築。
  3.  `@openrouter/glm-4.5-air` と Vercel AI SDK `streamText` でアシスタントの返答をストリーミング。

## 3. エラーハンドリング・コーナーケース

1.  **エディタの内容ロスト防止:** Markdownエディタに入力途中のテキストは、`localStorage` に自動下書き保存（Autosave）する機構をいれる。ネットワークエラー時やページ閉塞時でも内容が消えないようにする。
2.  **AI支援の制限:** APIコスト低減のため、アシスタント機能(`assist`)へ一度に送る過去の活動履歴やコンテキストは、トークン制限を超えないよう（例: 最新の3件のログのみ送る）調整する。
