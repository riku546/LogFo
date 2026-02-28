# ロードマップ生成機能 詳細設計書 (Roadmap Generation Design)

## 1. フロントエンド実装設計 (Frontend)

### 1.1. コンポーネント構成 (`src/features/roadmap/`)

ロードマップ生成ページは以下のコンポーネント群で構成します。

- **`RoadmapGeneratorPage`**: ページ全体のコンテナ（親コンポーネント）。状態管理とAPI呼び出しを統括。
- **`components/RoadmapForm`**: 情報入力フォーム。ユーザーの現状と目標を受け取る。
  - **`PdfUploader`**: `react-dropzone` を用いたPDFファイルのドラッグ＆ドロップエリア。
- **`components/RoadmapChatStream`**: LLMの生成中状態を表示するコンポーネント。ストリーミングで流れてくるテキストやJSONをパースし、リアルタイムにプレビュー表示する。
- **`components/RoadmapBoard`**: 生成後、またはDBから取得したロードマップを表示・編集するコンポーネント。
  - **`MilestoneList`**: マイルストーンのリスト表示。
  - **`TaskItem`**: 各タスクのカード。Dnd-Kit（または他ライブラリ）によるドラッグ＆ドロップ並び替え、タイトル編集、削除アクションを実装。

### 1.2. 状態管理 (State Management)

- **フォーム状態 (useState / react-hook-form):**
  現在のスキル、目標、PDFファイルオブジェクトなどを保持。
- **AI生成状態 (Vercel AI SDK `useObject` or `useChat`):**
  バックエンドのHono APIと通信し、生成中のJSONオブションの断片をステートとして管理する。
- **編集状態 (useState):**
  生成完了後、ユーザーがタスクを編集・追加・削除した差分を管理し、最終的な「保存」API呼び出し時にバックエンドへ送る。

---

## 2. バックエンド・API設計 (Backend)

### 2.1. API エンドポイント

Hono RPC を用いて以下のエンドポイントを実装します。

#### ① ロードマップ生成 (Streaming API)

- **エンドポイント:** `POST /api/roadmap/generate`
- **処理フロー:**
  1.  FormDataで受け取ったPDFファイルがある場合、Web Crypto API / Edge環境で動作する軽量パーサーを用いてテキストを抽出。
  2.  「志望企業名」が存在し、PDFが無い場合などは、検索プロンプトを構築し GLM-4.5-Air の Web検索（Tool calling）を発動させる。
  3.  ユーザーの入力値と抽出したテキストを統合し、LLMに渡すシステムプロンプトを構築。
  4.  Vercel AI SDK の `streamObject` 等を用いて、構造化されたJSONのストリームをフロントエンドに返却（SSE）。

#### ② ロードマップ保存 (CRUD API)

- **エンドポイント:** `POST /api/roadmap`
- **リクエストボディ:** 編集確定後の完全なロードマップJSONデータ。
- **処理フロー:**
  1.  `roadmaps` テーブルに親レコードを作成。
  2.  `milestones` テーブルおよび紐づく `tasks` テーブルにデータを一括挿入 (Transaction)。

### 2.2. AI 実装仕様 (AI/LLM Design)

#### 使用モデル・ライブラリ

- **Model:** `@openrouter/glm-4.5-air`
- **SDK:** `ai` (Vercel AI SDK)
- **Tool:** Web Browsing / Search Tool (モデルネイティブ、または Firecrawl等の連携)

#### 期待する出力構造 (Structured Output / Zod Schema)

AIに強制する出力フォーマットを `zod` で以下のように定義し、`streamObject` の `schema` に指定します。

```typescript
import { z } from "zod";

export const roadmapSchema = z.object({
  summary: z
    .string()
    .describe("ユーザーの現状と目標のギャップに関する解説と学習方針"),
  milestones: z.array(
    z.object({
      title: z
        .string()
        .describe("マイルストーンの名前（例: Frontendの基礎を固める）"),
      description: z.string().describe("このマイルストーンの目的"),
      tasks: z.array(
        z.object({
          title: z
            .string()
            .describe("具体的なアクション（例: React公式ドキュメントを読む）"),
          estimatedHours: z.number().describe("予想される学習時間(時間)"),
        }),
      ),
    }),
  ),
});
```

#### プロンプト構築戦略 (Context Assembly)

システムプロンプトには以下のような制約と情報を埋め込みます。

- 「あなたはプロのキャリアメンター・シニアエンジニアです。」
- 入力情報（現状: XXX、目標: YYY、利用可能時間: ZZZ）
- コンテキスト情報（アップロードされた履歴書/企業資料のテキスト: "..."）
- 出力は必ず提供されたスキーマに従うこと。抽象的ではなく「具体的なTODO」レベルに落とし込むこと。

## 3. エラーハンドリング・コーナーケース

1.  **PDF解析エラー:** Edge環境でのPDF抽出に失敗した場合は、PDFテキストなしでLLMに渡し、その旨をフロントエンド（トースト等）で警告する。
2.  **LLMのパースエラー:** Vercel AI SDKの `streamObject` が修復を試みるが、タイムアウトやハルシネーションでスキーマが崩れた場合はエラーとしてフロントエンドでCatchし、「再生成」を促す。
3.  **無効な入力:** ユーザーが「あ」等の無意味な目標を入力した場合、LLMが空のマイルストーンを返さないよう、システムプロンプトで「目標が不明確な場合は、目標を探索するためのタスクを提案せよ」といったフォールバックの指示を入れる。
