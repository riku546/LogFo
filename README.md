# LogFo (Log + Portfolio)とは



LogFoは、日々のプログラミング、ソフトウェアに関する学習の軌跡（ログ）を自動で集約・可視化し、それを信頼できるポートフォリオに変換することで、学習者のモチベーション維持とキャリア目標の達成を支援するSassプロダクトです。

## LogFoについてさらに知る。
[こちら](https://drive.google.com/file/d/1fRftx85FWKH3AKDW2qt5cDb3_crcfA7F/view?usp=sharing)



# 開発環境構築

## マイグレーション
### 新しいマイグレーションの作成
```
pnpm drizzle-kit generate 

```

### マイグレーションの適用(ローカル環境)
```
pnpm wrangler d1 migrations apply logfo --local
```

## ローカルDBのデータ確認する方法
**--commandオプションにSQL文を指定して実行します。**
```
# 例: userテーブルの全データを取得する場合
pnpm wrangler d1 execute logfo --local  --command "SELECT * FROM user;"
```