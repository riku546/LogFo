---
name: logfo-issue-to-pr
description: Use this skill when the user wants to start from a GitHub Issue number and proceed through requirement clarification, implementation, AI review, commit, and pull request creation in this repository.
---

# LogFo Issue To PR

このスキルは、Issue 番号を起点に、仕様確認・実装・AI レビュー・コミット・PR 作成までを一連で進める時に使います。

## 目的

- 人間は要件定義と最終判定に集中する。
- AI は実装、レビュー、コミット、PR 作成を担当する。
- Issue から PR までの標準フローを一貫した手順で進める。

## 事前確認

- 最初に `AGENTS.md` を読む。
- 必要に応じて `docs/rules/**`、`docs/decision/**`、`docs/specs/**` を必要最小限だけ読む。
- Issue 本文と、関連する仕様書や既存実装の有無を確認する。

## 入力

- Issue 番号
- 必要ならベースブランチ
- 必要なら追加の背景情報

## 手順

1. Issue の内容を読み、目的、背景、完了条件、未確定事項を整理する。
2. 関連ドキュメントと既存コードを確認し、仕様の不足を洗い出す。
3. 人間に確認すべき事項を簡潔に提示し、仕様を確定する。
4. タスクが新規機能か既存機能修正かを判定する。
5. 新規機能なら `logfo-new-feature`、修正なら `logfo-fix-feature` の流れで実装する。
6. 実装後に `logfo-review` を使って AI レビューを実施する。
7. 指摘があれば修正し、再レビューの要否を判断する。
8. `logfo-commit` を使ってコミットメッセージ作成またはコミットを行う。
9. `logfo-pr` を使って PR タイトル生成、本文生成、`gh pr create` による PR 作成を行う。
10. 最後に、人間が確認すべき観点を整理して提示する。

## 判定ルール

- Issue に受け入れ条件が不足している場合は、実装前に必ず人間へ確認する。
- 仕様が曖昧なまま実装を進めない。
- 実装後の AI レビューは省略しない。
- 人間レビューはコードレビューではなく、要件達成確認を主目的とする。

## 出力

- 仕様確認で確定した内容
- 実装に使ったスキル
- AI レビュー結果の要約
- コミット結果または提案コミットメッセージ
- 作成した PR タイトル
- 作成した PR Description の要約
- 作成された PR URL
- 人間が最終確認すべき項目
