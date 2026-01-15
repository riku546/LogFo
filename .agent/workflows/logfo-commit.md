---
description: 静的チェックをして、conversion commitする
---

# プロジェクトルートにあるpackage.jsonに登録されている「biome:fix」, 「typecheck」を実行して、静的チェックを行ってください。異常がない場合はcommitに移ってください。





# **git status**を実行して、表示されたファイルの差分を調べて、conventional commitのメッセージを添えてcommitしてください。
commitメッセージは日本語で書いてください。



# Conventional Commits 導入ガイドライン

## 1. コミットメッセージの記述ルール

コミットメッセージは以下のフォーマットで統一します 。

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

```

### Type (種類の定義)

変更内容に応じて以下のTypeを使用してください 。

* **feat**: 新機能の追加
* **fix**: バグの修正
* **docs**: ドキュメントのみの変更
* **style**: コードの動作に影響しない変更（空白、フォーマット、セミコロンの欠落など）
* **refactor**: バグ修正も機能追加も行わないコードの変更（リファクタリング）
* **perf**: パフォーマンスを向上させるコードの変更
* **test**: テストの追加や既存テストの修正
* **build**: ビルドシステムや外部依存関係に影響する変更（例: gulp, npm scopes）
* **ci**: CI設定ファイルやスクリプトの変更（例: Travis, Circle, BrowserStack, SauceLabs）
* **chore**: その他の変更（ソースコードやテストファイルの変更を含まないもの）

### BREAKING CHANGE (破壊的変更)

既存のコードに対して破壊的な変更が含まれる場合は、以下のいずれかの方法で明示します 。

1. **Footerに記述**: コミットメッセージのフッターに `BREAKING CHANGE:` から始まる説明を記述する。
2. **Typeに付与**: `type` または `scope` の直後に `!` を付ける（例: `feat!: add new feature`）。