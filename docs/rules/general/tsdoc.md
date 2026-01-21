# TSDoc / JSDoc Guidelines

AI駆動開発において、コードの意図をAIに正しく伝えるために、コメントは非常に重要です。

## 基本ルール

- **すべての公開関数・クラス・型**: exportされているすべてのシンボルには、必ずドキュメントコメント(JSDoc/TSDoc)を付与してください。
- **言語**: 日本語で記述します。

## 必須タグ

- `/** ... */` ブロックを使用します。
- 以下の情報を可能な限り含めてください。

1.  **概要**: 関数やクラスが「何をするものか」を1行で。
2.  **@param**: 引数の意味、許容される値の範囲、null/undefinedの扱い。
3.  **@returns**: 返り値の意味。
4.  **@throws**: 発生しうる例外とその発生条件。

## サンプル

```typescript
/**
 * ユーザーを指定されたルームに参加させます。
 * 既に参加済みの場合はエラーをスローします。
 *
 * @param userId - 参加させるユーザーのID
 * @param roomId - 参加先のルームID
 * @returns 更新されたルーム情報
 * @throws {RoomNotFoundError} ルームが存在しない場合
 * @throws {UserAlreadyJoinedError} ユーザーが既に参加済みの場合
 */
export async function joinRoom(userId: string, roomId: string): Promise<Room> {
  // implementation
}
```

## AIへのヒント

- **複雑なロジック**: 実装の意図やアルゴリズムの解説が必要な場合は、`@remarks` タグなどを用いて詳細を記述してください。
- **Usage**: 使い方が自明でない場合は、`@example` タグを用いてコード例を示してください。
