# LogFo AGENTS Guide

このファイルは、Codex が LogFo リポジトリで作業する際の最上位ガイドです。常に文脈を絞り、必要なルールだけを追加で読み込んでください。

## 最優先ルール

- 必ず日本語で出力する。
- 変更前に影響範囲を確認し、必要なファイルだけを読む。
- `.env`、`.env.*`、`secrets/**` は読まない・編集しない。
- ユーザーが明示していない破壊的操作は行わない。
- 既存差分は勝手に巻き戻さない。

## 最初に読むファイル

- 作業開始時に必ず `Gemini.md` を確認する。
- その後は、以下から必要最小限だけ読む。

### 共通ルール

- `docs/rules/general/rules.md`
- `docs/rules/general/naming.md`
- `docs/rules/general/tsdoc.md`
- `docs/rules/general/ubiquitous_language.md`

### フロントエンド関連タスク

- `docs/rules/frontend/rules.md`
- `docs/rules/frontend/architecture.md`
- `docs/rules/frontend/design-system.md`

### バックエンド関連タスク

- `docs/rules/backend/rules.md`
- `docs/rules/backend/architecture.md`

### 設計変更・ADR関連

- `docs/decision/*.md` を確認し、既存判断と矛盾しないようにする。

## Codex 向けの作業方針

- 詳細ルールをこのファイルに重複記載しない。原本ドキュメントを読む。
- 複数のスキルやワークフローが候補になる場合は、最小構成で使う。
- コード変更時は、実装だけでなく関連テストと検証手順まで考慮する。
- 曖昧な要求でも、ローカル文脈から安全に推測できる範囲は先に進める。
- アーキテクチャや命名に関わる判断では、都度ユビキタス言語と ADR を参照する。

## タスク別ルーティング

### スキル

- コミット依頼、`/commit`、コミットメッセージ作成: `.agents/skills/logfo-commit/SKILL.md`
- PR説明作成、`/pr`: `.agents/skills/logfo-pr/SKILL.md`
- コードレビュー、`/review`: `.agents/skills/logfo-review/SKILL.md`
- 新規機能実装: `.agents/skills/logfo-new-feature/SKILL.md`
- スキル検索や導入相談: `.agents/skills/find-skills/SKILL.md`
- プロンプト、コマンド、スキル、LLM向けテンプレート設計: `.agents/skills/prompt-engineering/SKILL.md`
- UI/UX設計、画面実装、デザインレビュー: `.agents/skills/ui-ux-pro-max/SKILL.md`

### Claude Code 互換エイリアス

- ユーザーが Claude Code 風のスラッシュコマンドを使った場合は、シェルコマンドとしてではなくワークフロー要求として解釈する。
- `/commit` は `.agents/skills/logfo-commit/SKILL.md` を使う。
- `/pr` は `.agents/skills/logfo-pr/SKILL.md` を使う。
- `/review` は `.agents/skills/logfo-review/SKILL.md` を使う。
- `/speckit.*` は移行完了まで `.claude/commands/speckit.*.md` を参照して対応する。

## 実装ルールの要点

### 共通

- 抽象的すぎる命名を避ける。
- ガード節を使い、ネストを深くしすぎない。
- export する関数、型、クラスには日本語 TSDoc を付ける。
- コード内の用語は `docs/rules/general/ubiquitous_language.md` に合わせる。

### フロントエンド

- `frontend/src/features` を中心とした軽量 Feature-Driven 構成を守る。
- 状態管理やデータ取得ロジックは Hooks に寄せ、表示用コンポーネントから分離する。
- `page.tsx` は配線に徹し、複雑なロジックを持たせない。
- `use client` は必要最小限にとどめる。
- クリック可能要素には `cursor-pointer` を付け、アイコンは SVG を使う。

### バックエンド

- オニオンアーキテクチャを崩さず、内側から外側への依存方向を守る。
- Zod スキーマ定義、型抽出、Route 定義、テスト、実装の順で進める。
- ループ内での DB クエリを避け、N+1 を作らない。
- Cloudflare Workers の制約を前提に、重い処理や長時間処理を避ける。

## 検証の基本方針

- `src` 配下の変更がある場合は、まずリポジトリルートで `pnpm biome:fix && pnpm typecheck` を検討する。
- フロントエンド変更時は `pnpm --filter frontend test` を優先して検証する。
- バックエンド変更時は `pnpm --filter backend test`、必要に応じて `test:unit` または `test:integration` を使う。
- 実行できない検証がある場合は、未実施内容と理由を明示する。

## 期待する応答スタイル

- まず結果と判断を簡潔に示し、その後に根拠を補足する。
- レビュー依頼では、要約より先に問題点を重要度順で列挙する。
- ユーザーが単に質問しているだけなら、不要なコード変更は行わない。
