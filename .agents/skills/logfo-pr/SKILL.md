---
name: logfo-pr
description: Use this skill when the user asks to create a PR description, summarize branch changes for a pull request, suggest a PR title, or uses phrases like /pr, PR作って, PR description, or pull request description in this repository.
---

# LogFo PR

このスキルは、差分から PR タイトル案と PR Description を作る時に使います。

## 事前確認

- ベースブランチの指定がなければ `main` を使う。
- 最初に `.github/pull_request_template.md` を読む。

## 手順

1. `git log BASE_BRANCH..HEAD --oneline` を確認する。
2. `git diff BASE_BRANCH...HEAD --stat` を確認する。
3. `git diff BASE_BRANCH...HEAD` を確認する。
4. コミット履歴と差分から変更意図を整理する。
5. PR テンプレートに沿って、日本語の PR Description を生成する。

## ルール

- PR タイトル案もあわせて提案する。
- 重要な変更点を優先して要約する。
- 自動生成ファイルや軽微なノイズは必要に応じて省略する。
- 出力は Markdown で書く。

## 出力形式

```markdown
## PRタイトル案
提案するタイトル

## PR Description

（本文）
```
