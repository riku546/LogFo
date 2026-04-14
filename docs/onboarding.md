# LogFo オンボーディング

この資料は、LogFo に参加した人が最短で開発の進め方を掴むための入口です。
細かいルールをここで覚える必要はありません。

このプロジェクトでは、詳細ルールは主に LLM が参照する前提です。
人はまず「どこに何があるか」と「どういう流れで進めるか」を把握してください。

## 最初に知っておくこと

- 環境構築の入口は `README.md`
- AI エージェント運用の入口は `AGENTS.md`
- 詳細ルールや仕様は `docs/` 配下にある
- 詳しいルール本文は、人が全部読むよりも、必要時に LLM に参照させる前提でよい

## docs の構造

```text
docs/
├── decision/                 # 設計判断の記録（ADR）
│   ├── backend_architecture.md
│   ├── frontend_architecture.md
│   └── ...
├── rules/                    # 実装ルール
│   ├── backend/
│   ├── frontend/
│   └── general/
├── specs/                    # 機能ごとの仕様と設計
│   ├── activity_summary/
│   │   ├── design.md
│   │   └── requirements.md
│   ├── activity_tracking/
│   ├── dashboard/
│   ├── portfolio_generation/
│   └── roadmap_generation/
├── problem_analysis.md
└── requirements.md
```

見る場所の目安は次です。

- 仕様を知りたい: `docs/specs/`
- なぜこの設計か知りたい: `docs/decision/`
- 実装ルールを LLM に読ませたい: `docs/rules/`

## AGENTS.md で把握しておくこと

`AGENTS.md` は、このリポジトリで AI エージェントが従うガイドです。
人が最初に覚えるべきポイントは次だけで十分です。

- 必要に応じて `docs/rules/**` を参照する
- `.env`、`.env.*`、`secrets/**` は触らない
- 既存差分を勝手に戻さない
- タスクによって使うスキルやワークフローがある

特に覚えておくと便利なもの:

- `/logfo-issue-to-pr`: Issue 起点で仕様確認から PR 作成まで進める統合フロー
- `/logfo-review`: 差分レビュー
- `/logfo-commit`: コミットメッセージ作成やコミット補助
- `/logfo-pr`: PR タイトル生成、PR Description 生成、PR 作成
- `/logfo-new-feature`: 新規機能実装のワークフロー
- `/logfo-fix-feature`: 既存機能修正のワークフロー

## タスクアサインから PR までの流れ

1. 人間が Issue に目的、背景、完了条件を書く
2. `/logfo-issue-to-pr` に Issue 番号を渡す
3. AI が仕様不足を洗い出し、人間と仕様確認を行う
4. 新規機能なら `/logfo-new-feature`、機能修正なら `/logfo-fix-feature` を使って実装する
5. 実装後に `/logfo-review` を使って AI レビューする
6. `/logfo-commit` でコミットする
7. `/logfo-pr` で Pull Request を作成する
8. 人間は PR 上で要件を満たしているかを最終確認する
9. 必要に応じて Copilot でもレビューする(オプション)

## 迷ったときの最短ルート

迷ったら次の順で進めてください。

1. `README.md` で入口を確認する
2. `AGENTS.md` で AI 運用の前提を確認する
3. 対象機能の `docs/specs/` を見る
4. 必要なら `docs/decision/` を見る
5. 詳細ルールは LLM に `docs/rules/` を参照させる

この資料の目的は、ルール暗記ではなく、必要な情報へ最短で辿れることです。
