---
name: logfo-fix-feature
description: Use this skill when the user asks to fix or improve an existing feature through specification-driven development, including requirement clarification, fix planning, and approval before implementation.
---

# LogFo Fix Feature

このスキルは、既存機能の修正を仕様駆動で進める時に使います。

## 事前確認

- 最初に `AGENTS.md` を読む。
- 関連仕様（`specs/**`、`docs/requirements.md` など）を確認する。

## 手順

1. ユーザーから修正要望を受け取り、背景と期待する結果を整理する。
2. ヒアリングを行い、要望を明確化する。
3. 修正計画書を作成する。
4. 計画書をユーザーに提示し、確認と承認を得る。
5. 承認後に実装を開始する。

## ヒアリング項目

- 現在の問題（再現手順、発生条件、期待値との差分）
- 影響範囲（画面、API、データ、権限、運用フロー）
- 優先度と期限
- 受け入れ条件（完了判定）

## 修正計画書の必須項目

- 目的と修正対象
- 仕様変更内容
- 実装変更内容
- 影響範囲とリスク
- テスト方針と検証手順
- 実施順序

## 計画時のルール

- 「仕様書の変更」を先に定義し、その後に「実際のコード変更」を定義する。
- 計画書作成時に、必ず関連するプロジェクトルール（`docs/rules/**`）を読み込む。
- 命名、アーキテクチャ、TSDoc、ユビキタス言語の整合を確認する。

## 承認後の実装方針

- 計画書に沿って最小差分で修正する。
- 関連テストと型チェックを実行し、未実施があれば理由を明示する。
- 変更結果は「何を直したか」「なぜその修正か」「どう検証したか」を簡潔に報告する。
