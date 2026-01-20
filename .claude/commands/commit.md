---
description:　静的チェックとコミット
---

## 実行手順のまとめ

1. **src以下のファイルが変更された場合のみ、**`pnpm biome:fix && pnpm typecheck`を実行
2. エラーがなければ`git status`と`git diff`で変更内容を確認
3. 適切なConventional Commitsメッセージを作成
4. `git commit`を実行

以下の手順を実行してください：
　
## 1. 静的チェックの実行

**src以下のファイルが変更された場合のみに、この手順を実行して下さい。**
プロジェクトルートで以下のコマンドを実行して静的チェックを行ってください：

```bash
pnpm biome:fix && pnpm typecheck
```
　
エラーがある場合は、エラー内容を報告して停止してください。
エラーがない場合は、次のステップに進んでください。

## 2. コミットの作成

**git status**を実行して、変更されたファイルの差分を調べてください。

その後、以下のConventional Commitsのルールに従って、適切なコミットメッセージを作成してコミットしてください。

### Conventional Commitsのルール

コミットメッセージは以下のフォーマットで記述してください：

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Type (種類の定義)

変更内容に応じて以下のTypeを使用してください：

* **feat**: 新機能の追加
* **fix**: バグの修正
* **docs**: ドキュメントのみの変更
* **style**: コードの動作に影響しない変更（空白、フォーマット、セミコロンの欠落など）
* **refactor**: リファクタリング（バグ修正や機能追加を伴わないコード変更）
* **perf**: パフォーマンス改善
* **test**: テストの追加や修正
* **build**: ビルドシステムや外部依存関係に関する変更
* **ci**: CI設定ファイルやスクリプトの変更
* **chore**: その他の変更（ビルドプロセス、補助ツールなど）
* **revert**: 以前のコミットの取り消し

### 重要な注意事項

* コミットメッセージは**日本語**で書いてください
* description（説明文）は簡潔かつ明確に記述してください
* Breaking Changeがある場合は、typeの後に "!" を追加してください（例: "feat!" ）
* scopeは任意ですが、変更範囲を明確にする場合は使用してください（例: fix(hub) ）

### コミットメッセージの例

```text
fix(hub): ソート機能のクエリパラメータを修正

自社案件数と招待案件数のソート項目で使用されるクエリパラメータ名を
バックエンドAPIと一致するように修正しました。

- owned_project_count → root_project_count
- invited_project_count → order_destination_project_count
```


