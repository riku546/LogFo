---
name: logfo-new-feature
description: Use this skill when the user asks to build a new feature, implement a new screen or API from requirements, create a development plan from a spec, or uses phrases like 新規機能, 実装して, featureを作って, or 仕様から作って in this repository.
---

# LogFo New Feature

このスキルは、新規機能の仕様整理から実装までを進める時に使います。
Issue 起点の標準フローでは `logfo-issue-to-pr` から呼び出される下位スキルとして扱います。

## 事前確認

- 最初に `Gemini.md` を読む。
- 関連する `docs/rules/**` と `docs/decision/**` を読む。
- 仕様書があれば確認し、不明点とエッジケースを洗い出す。
- 仕様書がなければ、要求を整理して実装用の要件メモを作る。

## 手順

1. 要件と制約を整理する。
2. UI を含む場合は `.agents/skills/ui-ux-pro-max/SKILL.md` を使い、必要ならデザインシステムを生成する。
3. 実装計画を作り、対象ファイル、テスト方針、検証方法を明確にする。
4. まずテスト観点を定義し、必要ならテストコードから着手する。
5. プロダクトコードを実装する。
6. 関連テストと型チェックを実行し、未実施があれば明示する。

## フロントエンド実装時の重点

- Hooks と表示コンポーネントを分離する。
- `page.tsx` は配線に寄せる。
- `cursor-pointer`、SVG アイコン、レスポンシブ、アクセシビリティを確認する。

## バックエンド実装時の重点

- Zod スキーマ、型抽出、Route 定義、テスト、実装の順を守る。
- オニオンアーキテクチャの依存方向を崩さない。
- N+1 と Workers 制約に注意する。

## 出力

- まず実装方針か進捗を簡潔に示す。
- 大きな作業では、実装前に計画を提示して合意を取る。
