# 開発環境構築手順

## 前提条件
- pnpmがインストールされている


## 依存関係のインストール
```bash
pnpm install
```


## 環境変数 

```bash
cp .env.example .env
```
**環境変数は配布された物を使用してください。**


## マイグレーション
```bash
 pnpm wrangler d1 migrations apply logfo --local
```

## 開発サーバーの起動

```bash
 pnpm dev
```


# 便利なコマンド

## ローカルDBのデータ確認する方法
**--commandオプションにSQL文を指定して実行します。**

```bash
# 例: userテーブルの全データを取得する場合
pnpm wrangler d1 execute logfo --local  --command "SELECT * FROM user;"
```