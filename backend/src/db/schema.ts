import { text, integer, real, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------
// 0. 共通定義 (Enums)
// ---------------------------------------------
export const providerEnum = ["github", "wakatime", "qiita", "zenn", "atcoder"] as const;
export const statusEnum = ["TODO", "IN_PROGRESS", "DONE"] as const;

// ---------------------------------------------
// 1. ユーザー基盤 (User Foundation)
// ---------------------------------------------

/**
 * users テーブル
 * アプリケーションを利用するユーザーの基本情報を管理するアカウントテーブルです。
 * 独自のセッション管理を行うため、ハッシュ化されたパスワードを保存します。
 */
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * user_integrations テーブル
 * GitHubやWakaTimeなど、ユーザーが連携した外部サービスごとのアクセス情報やIDを安全に保持します。
 * (User : Integration = 1 : N)
 */
export const userIntegrations = sqliteTable("user_integrations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider", { enum: providerEnum }).notNull(), // 外部連携サービス名
  providerUserId: text("provider_user_id"), // 外部サービス側のIDやユーザー名
  accessToken: text("access_token"), // 必要に応じて保持するトークン
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------
// 2. ロードマップ機能 (Roadmap Tracking)
// ---------------------------------------------

/**
 * roadmaps テーブル
 * ユーザーが自身の現状と目標を入力し、LLMによって生成された学習計画のルート（親データ）です。
 * 企業資料などのPDFテキストもコンテキストとして保存します。
 * (User : Roadmap = 1 : N)
 */
export const roadmaps = sqliteTable("roadmaps", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  currentState: text("current_state").notNull(), // 入力された現状のスキル等
  goalState: text("goal_state").notNull(), // 入力された目標や志望企業
  pdfContext: text("pdf_context"), // LLMのプロンプトに含めたPDFの抽出テキスト
  summary: text("summary"), // LLMが生成したロードマップごとの全体方針
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * milestones テーブル
 * ロードマップに紐づく、中間の大きな目標（例：「Reactの基礎を習得する」）です。
 * (Roadmap : Milestone = 1 : N)
 */
export const milestones = sqliteTable("milestones", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  roadmapId: text("roadmap_id")
    .notNull()
    .references(() => roadmaps.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: statusEnum }).notNull().default("TODO"), // "TODO" | "IN_PROGRESS" | "DONE"
  orderIndex: integer("order_index").notNull(), // UI表示用の順序
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * tasks テーブル
 * マイルストーンの配下に属する、最も具体的な行動レベルのtodo（タスク）です。
 * ここで個別の予想学習時間やステータスを管理します。
 * (Milestone : Task = 1 : N)
 */
export const tasks = sqliteTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  milestoneId: text("milestone_id")
    .notNull()
    .references(() => milestones.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  estimatedHours: real("estimated_hours"), // LLMが予想する学習所要時間
  status: text("status", { enum: statusEnum }).notNull().default("TODO"), // "TODO" | "IN_PROGRESS" | "DONE"
  orderIndex: integer("order_index").notNull(), // UI表示用の順序
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------
// 3. 活動・学習記録機能 (Activity Tracking)
// ---------------------------------------------

/**
 * activity_logs テーブル
 * 個別のタスクに対して「今日何を勉強したか」を残すための日々の学習記録です。
 * 将来的にはマイルストーンごとのサマリー生成に使われます。
 * (Task : Activity Log = 1 : N)
 */
export const activityLogs = sqliteTable("activity_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  content: text("content").notNull(), // Markdown形式の活動内容
  loggedDate: text("logged_date").notNull(), // 活動日 (YYYY-MM-DD)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------
// 4. ダッシュボード（外部データ同期）機能
// ---------------------------------------------

/**
 * external_activities テーブル
 * ダッシュボードで草（ヒートマップ）を描画するため、GitHubコミット数などの
 * 各種プロバイダから取得した外部の1日ごとの活動量を集計・蓄積するテーブルです。
 * (User : External Activity = 1 : N)
 */
export const externalActivities = sqliteTable("external_activities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider", { enum: providerEnum }).notNull(), // 外部連携サービス名
  date: text("date").notNull(), // 活動日 (YYYY-MM-DD)
  activityCount: integer("activity_count").notNull(), // 1日のコミット数や分数など
  metadata: text("metadata", { mode: "json" }), // 言語割合などの付帯情報をJSONで格納
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------
// 5. 自動サマリー ＆ ポートフォリオ機能 (Summary & Portfolio)
// ---------------------------------------------

/**
 * summaries テーブル
 * 特定の「マイルストーン」期間内における活動記録（内部＋外部）をLLMが分析・要約し、
 * 自己PRや振り返りテキストとしてフォーマットしたものです。
 * (Milestone : Summary = 1 : N) ※基本は1対1ですが、複数回生成する場合などを考慮
 */
export const summaries = sqliteTable("summaries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  milestoneId: text("milestone_id")
    .notNull()
    .references(() => milestones.id, { onDelete: "cascade" }),
  title: text("title"),
  content: text("content").notNull(), // 生成または手動編集されたサマリ本文 (Markdown)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * portfolios テーブル
 * 外部へ公開するポートフォリオの設定を管理します。
 * "1ユーザーにつき1ポートフォリオ" として、独自の公開URL(Slug)と表示要素を管理します。
 * (User : Portfolio = 1 : 1)
 */
export const portfolios = sqliteTable("portfolios", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(), // パブリックURL末尾 (logfo.app/[slug])
  isPublic: integer("is_public", { mode: "boolean" })
    .notNull()
    .default(false),
  settings: text("settings", { mode: "json" }), // どのサマリ・ウィジェットを表示するかのJSON設定
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
