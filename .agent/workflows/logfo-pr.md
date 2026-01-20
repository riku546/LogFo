---
description: pr description作成
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
2. 変更内容を分析し、PRテンプレートに従ってdescriptionを生成
3. 生成したdescriptionを提示

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

## 2. PR descriptionの生成

`.github/pull_request_template.md` のテンプレートに従って、以下の内容を含むPR descriptionを生成してください：

### 注意事項

- PRのタイトルとして適切な簡潔な説明も提案してください
- 変更内容は、差分の内容から重要な変更点を抽出して記述してください
- コミットメッセージも参考にして、変更の意図を理解してください
- **説明は日本語で、Markdown形式で記述してください**
- 軽微なファイル変更（package-lock.json、設定ファイルの自動生成など）は省略して構いません

## 3. 出力形式

以下の形式でPR descriptionを出力してください：

```markdown
## PRタイトル案
提案するタイトル

## PR Description

（ここに生成したdescriptionの全文を記載）
```
