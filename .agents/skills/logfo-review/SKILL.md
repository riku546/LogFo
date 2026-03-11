---
name: logfo-review
description: Use this skill when the user asks for a code review, diff review, PR review, regression check, or uses phrases like /review, レビューして, mainとの差分を見て, or コードレビュー in this repository.
---

# LogFo Review

このスキルは、ベースブランチとの差分レビューを行う時に使います。

## 事前確認

- 最初に `Gemini.md` を読む。
- その後、差分に応じて `docs/rules/**` と `docs/decision/**` を必要最小限だけ読む。
- ベースブランチ指定がなければ `main` を使う。

## 手順

1. `git diff BASE_BRANCH...HEAD --name-only` で変更ファイル一覧を確認する。
2. `git diff BASE_BRANCH...HEAD` で差分を確認する。
3. 変更された各ファイルの全体を読んで文脈を掴む。
4. 仕様乖離、規約違反、バグ、回帰、テスト不足を優先してレビューする。

## 観点

- ルール遵守
- コメントと実装の整合
- 仕様との整合
- ロジックの正しさ
- エラーハンドリング
- 型安全性
- パフォーマンス

## 出力ルール

- 指摘を重要度順に並べる。
- 問題がなければその旨を明示する。
- 変更要約は最後に短く添える。
- 行番号を示せる場合は付ける。
