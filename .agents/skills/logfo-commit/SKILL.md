---
name: logfo-commit
description: Use this skill when the user asks to create a commit, propose a commit message, run the commit flow, or uses phrases like /commit, commitして, コミットして, Conventional Commits, or コミットメッセージを作って in this repository.
---

# LogFo Commit

このスキルは、LogFo リポジトリでコミットを作成する時に使います。
Issue 起点の標準フローでは `logfo-issue-to-pr` から呼び出される下位スキルとして扱います。

## 事前確認

- 最初に `Gemini.md` を読む。
- 必要に応じて `docs/rules/general/*` を確認する。
- `src` 配下の変更があるかを確認する。

## 手順

1. `src` 配下に変更がある場合のみ、リポジトリルートで `pnpm biome:fix && pnpm typecheck` を実行する。
2. エラーがあれば内容を報告して停止する。
3. `git status` と `git diff` で変更内容を確認する。
4. Conventional Commits に従って日本語のコミットメッセージを作る。
5. ユーザーがコミット実行まで求めている場合のみ `git commit` を実行する。

## コミットメッセージ規約

形式:

```text
<type>[optional scope]: <description>

[optional body]
```

使用する `type`:

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

注意:

- メッセージは日本語で書く。
- `description` は簡潔に書く。
- Breaking Change は `type!:` を使う。
- `scope` は必要な時だけ付ける。

## 出力

- 実行した検証結果を先に簡潔に示す。
- コミット未実行なら、提案メッセージをそのまま使える形で示す。
