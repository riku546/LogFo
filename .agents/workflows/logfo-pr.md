---
description: pull request作成
---

## 使い方

```bash
/pr [ベースブランチ名]
```

- 引数なし: デフォルトで `main` ブランチとの差分を確認
- 引数あり: 指定されたブランチとの差分を確認

例:
- `/pr` - mainブランチとの差分
- `/pr develop` - developブランチとの差分

## 実行手順のまとめ

1. 現在のブランチと指定されたベースブランチとの差分を確認
2. 変更内容を分析し、PR テンプレートに従ってタイトルと本文を生成
3. `gh pr create` で Pull Request を作成
4. 作成した PR URL を提示

以下の手順を実行してください：

## 1. ブランチ情報と差分の確認

**重要**:
- ユーザーがブランチ名を指定した場合は、そのブランチを使用してください
- 指定がない場合は `main` ブランチを使用してください

ベースブランチを `BASE_BRANCH` として、以下のコマンドを実行してください：

```bash
git log BASE_BRANCH..HEAD --oneline
```

```bash
git diff BASE_BRANCH...HEAD --stat
```

```bash
git diff BASE_BRANCH...HEAD
```

## 2. PR 本文の生成と PR 作成

`.github/pull_request_template.md` のテンプレートに従って、以下の内容を含む PR 本文を生成してください：

### 注意事項

- PR のタイトルとして適切な簡潔な説明を生成してください
- 変更内容は、差分の内容から重要な変更点を抽出して記述してください
- コミットメッセージも参考にして、変更の意図を理解してください
- **説明は日本語で、Markdown 形式で記述してください**
- 軽微なファイル変更（package-lock.json、設定ファイルの自動生成など）は省略して構いません
- `gh auth status` が失敗した場合は原因を報告して停止してください
- 未コミット変更がある場合は PR 作成前に停止してください

## 3. PR 作成

- `git status --short` で未コミット変更がないことを確認してください
- `git branch --show-current` で現在のブランチを確認してください
- 必要なら現在のブランチを push してください
- `gh pr create` を使って Pull Request を作成してください

## 4. 出力形式

以下の形式で結果を出力してください：

```markdown
## PRタイトル
作成したタイトル

## PR Description 要約
作成した本文の要約

## PR URL
作成された Pull Request の URL
```
