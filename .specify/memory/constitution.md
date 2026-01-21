# LogFo Constitution

## Core Principles

### I. 日本語によるドキュメンテーション (Japanese Documentation)

プロジェクトの透明性と意思決定の正確性を確保するため、すべての製品仕様書（spec.md）、技術計画書（plan.md）、タスク（tasks.md）、**および実装時のあらゆる仕様書・設計書**は、常に日本語で記述されなければならない。

### II. SDD開発ルールとアーキテクチャの遵守 (SDD Rules Compliance)

仕様駆動開発（Spec Driven Development）の品質を担保するため、以下のルールセットを遵守すること。

- **共通ルール** ([docs/rules/general/](file:///Users/riku/Documents/LogFo/docs/rules/general/)): プロジェクトのすべての実装において遵守を義務付ける。
- **Frontendルール** ([docs/rules/frontend/](file:///Users/riku/Documents/LogFo/docs/rules/frontend/)): フロントエンドの実装時のみ遵守し、App Routerの規約やHooksの設計指針に従う。
- **Backendルール** ([docs/rules/backend/](file:///Users/riku/Documents/LogFo/docs/rules/backend/)): バックエンドの実装時のみ遵守し、HonoのRPC型定義やDrizzleのリレーション設計に従う。



## Governance

- **憲法の優位性**: 本憲法はプロジェクトにおけるすべての慣行に優先する。
- **ルールの役割**: `docs/rules/` 配下の各ルールファイルは、AIエージェントおよび人間が実装を行う際の「正誤」を判断する最終的な基準となる。ルールからの逸脱が必要な場合は、まずルール自体の更新または個別仕様書での正当化が必要である。

**Version**: 1.0.0 | **Ratified**: 2026-01-20 | **Last Amended**: 2026-01-21

