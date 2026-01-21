# Naming Conventions

一貫性のある命名規則は、コードの予測可能性を高めます。

## 基本ケース (Casing)

| 対象                | ケース                  | 例                                |
| :------------------ | :---------------------- | :-------------------------------- |
| 変数                | camelCase               | `userName`, `userList`            |
| 関数                | camelCase               | `fetchUser`, `handleClick`        |
| クラス              | PascalCase              | `User`, `AuthService`             |
| インターフェース/型 | PascalCase              | `UserProps`, `ApiResponse`        |
| コンポーネント      | PascalCase              | `UserProfile`, `Button`           |
| 定数 (Global)       | UPPER_SNAKE_CASE        | `MAX_RETRY_COUNT`, `API_ENDPOINT` |
| ファイル名 (TS/JS)  | camelCase or kebab-case | `userUtils.ts`, `api-client.ts`   |
| ファイル名 (React)  | PascalCase (推奨)       | `UserProfile.tsx`                 |

## Prefixes & Suffixes

- **Boolean**: `is`, `has`, `can`, `should` などの助動詞から始める。
  - 例: `isValid`, `hasPermission`, `canEdit`
- **Event Handler**: `handle` + イベント名/アクション名
  - 例: `handleClick`, `handleSubmit`
- **Event Props**: `on` + イベント名/アクション名
  - 例: `onClick`, `onSubmit`
- **Type/Interface**: 基本的にPrefix/Suffixは不要ですが、Propsには `Props` をつけるのが慣例です。
  - 例: `ButtonProps`

## 禁止事項

- **省略形**: 広く一般的でない省略形は避けてください。
  - Bad: `usr`, `msg`, `ctx` (文脈によるが避けるのが無難)
  - Good: `user`, `message`, `context`
- **型情報の埋め込み**: ハンガリアン記法のような型名のプレフィックスは不要です。
  - Bad: `strName`, `iCount`
