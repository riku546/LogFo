# テストカバレッジ運用方針

## 目的

- 品質を感覚ではなく数値で継続把握する。
- テストが薄い領域を見つけやすくし、改善優先度を決めやすくする。
- AI レビューや追加実装時に、改善余地を客観的に共有できる状態を作る。

## 計測対象

- `frontend`
  - コマンド: `pnpm --filter frontend test:coverage`
  - 対象: `src/**/*.{ts,tsx}`
  - 重視する層: Hooks / Components / Integration で利用される画面ロジック全体
- `backend`
  - コマンド: `pnpm --filter backend test:coverage`
  - 対象: `src/**/*.ts`
  - 重視する層: Unit Test の UseCase / Domain と Integration Test の Presentation / Route
  - 除外方針: `src/schema/**` と、宣言的な DB schema / AI provider / prompt 定義などの薄いアダプタは coverage 集計から除外する

## CI での扱い

- `frontend-check.yml` でフロントエンドのカバレッジを毎回計測する。
- `backend-check.yml` でバックエンドの unit / integration を含むカバレッジを毎回計測する。
- `coverage-summary.json` を使って GitHub Actions の Step Summary に主要指標を出力する。
- HTML レポートは Artifact として保存し、PR ごとに参照できるようにする。

## レポート確認方法

- GitHub Actions の実行結果から Step Summary を確認する。
- 詳細が必要な場合は Artifact の `frontend-coverage-report` または `backend-coverage-report` をダウンロードして HTML レポートを開く。
- ローカルでは各パッケージで `pnpm test:coverage` を実行し、`coverage/index.html` を確認する。

## しきい値方針

- 初回導入時点では、カバレッジのしきい値は設定しない。
- まずは継続計測を優先し、数値の傾向と未カバー領域を把握する。
- しきい値を導入する場合は、実測値と運用コストを見ながら別 Issue で段階的に決める。

## 運用メモ

- カバレッジは品質の一部であり、高ければ十分という指標ではない。
- 重要なユーザーフロー、分岐、失敗系が十分に検証されているかを優先して見る。
- 数値が低い領域は、回帰リスクや変更頻度と合わせて改善優先度を判断する。
