---
description: Issue 起点で仕様確認から PR 作成まで進めるフロー
---

# Issue To PR ワークフロー

## 使い方

```bash
/logfo-issue-to-pr ISSUE_NUMBER [ベースブランチ名]
```

- 第1引数: GitHub Issue 番号
- 第2引数: 任意のベースブランチ名。指定がなければ `main`

例:
- `/logfo-issue-to-pr 160`
- `/logfo-issue-to-pr 160 develop`

## 実行手順のまとめ

1. Issue と関連資料を確認する
2. 人間と仕様確認を行う
3. 新規機能か既存修正かを判定して実装する
4. AI レビューを行う
5. コミットする
6. PR を作成する

## 1. 仕様確認

- `AGENTS.md` を読み、必要に応じて `docs/rules/**`、`docs/decision/**`、`docs/specs/**` を確認してください。
- Issue から目的、背景、完了条件、未確定事項を整理してください。
- 仕様が不足している場合は、実装前に人間へ確認してください。

## 2. 実装

- 新規機能なら `logfo-new-feature` の流れで進めてください。
- 既存機能修正なら `logfo-fix-feature` の流れで進めてください。

## 3. AI レビュー

- 実装後は `logfo-review` を使って差分レビューを実施してください。
- 指摘があれば修正し、必要なら再レビューしてください。

## 4. コミット

- `logfo-commit` を使ってコミットメッセージ作成またはコミットを行ってください。

## 5. PR 作成

- `logfo-pr` を使って PR タイトル生成、PR Description 生成、`gh pr create` による PR 作成まで進めてください。

## 出力

- 確定した仕様
- 実装内容の要約
- AI レビュー結果の要約
- コミット結果
- 作成した PR URL
- 人間が最終確認すべき観点
