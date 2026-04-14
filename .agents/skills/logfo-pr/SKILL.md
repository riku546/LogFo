---
name: logfo-pr
description: Use this skill when the user asks to create a pull request from the current branch, including generating the PR title and description and opening the PR with gh in this repository.
---

# LogFo PR

このスキルは、差分から PR タイトルと PR Description を作成し、`gh` コマンドで実際に Pull Request を作成する時に使います。
Issue 起点の標準フローでは `logfo-issue-to-pr` から呼び出される下位スキルとして扱います。

## 事前確認

- ベースブランチの指定がなければ `main` を使う。
- 最初に `.github/pull_request_template.md` を読む。
- `gh auth status` が通ることを確認する。
- `git status --short` で未コミット変更がないことを確認する。
- 現在のブランチがリモートへ push 済みか確認する。

## 手順

1. `git log BASE_BRANCH..HEAD --oneline` を確認する。
2. `git diff BASE_BRANCH...HEAD --stat` を確認する。
3. `git diff BASE_BRANCH...HEAD` を確認する。
4. コミット履歴と差分から変更意図を整理する。
5. PR テンプレートに沿って、日本語の PR タイトルと PR Description を生成する。
6. `git status --short` で未コミット変更がないことを確認する。
7. `git branch --show-current` で head ブランチを確認する。
8. 必要なら現在のブランチを push する。
9. `gh pr create` を実行して PR を作成する。
10. 作成した PR の URL を報告する。

## ルール

- 重要な変更点を優先して要約する。
- 自動生成ファイルや軽微なノイズは必要に応じて省略する。
- `gh` 認証や push 状態が不足している場合は、その場で止まらず原因を簡潔に報告する。
- PR 作成に成功した場合は URL を必ず返す。

## 出力形式

```markdown
## PRタイトル
作成したタイトル

## PR Description 要約
作成した本文の要約

## PR URL
作成された Pull Request の URL
```
