# General Rules: Code Quality & Readability

## リーダブルコード (Readable Code)

### DRY原則 (Don't Repeat Yourself) と YAGNI (You Aren't Gonna Need It)

- **DRY**: ロジックの重複は避けます。同じ処理が2回以上現れたら関数化を検討します。
- **YAGNI**: ただし、将来使うかもしれないという理由だけで過剰な抽象化や共通化をしないでください。「今必要なもの」だけを実装します。
  - **判断基準**: 共通化することで可読性が下がる（パラメータが増えすぎる等）場合は、あえてコードを重複させる方が良い場合もあります。

### ネストの削減 (Early Return)

- **Early Return**: 条件分岐のネストを深くしないために、ガード節(Guard Clause)を使用して早期リターンします。

  ```typescript
  // Bad
  if (user) {
    if (user.isActive) {
      // do something
    }
  }

  // Good
  if (!user || !user.isActive) return;
  // do something
  ```

### 変数名・関数名の具体性

- **禁止ワード**: `data`, `item`, `info`, `value` などの抽象的すぎる名前は、スコープが非常に狭い場合（`map`の引数など）を除き使用禁止です。
- **具体的に**: `userData`, `productItem` のように、中身が何であるかがわかる名前をつけてください。

### 分割 (Split)

- **Single Responsibility Principle**: 1つの関数、1つのコンポーネントは1つのことだけを行うべきです。
- 関数が長くなりすぎたり（例: 50行以上）、複数のレベルの抽象度が混在している場合は、ヘルパー関数への分割を検討します。
