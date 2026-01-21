# Frontend Development Rules

## 実装フロー (Development Flow)

SDD (Spec Driven Development) に基づき、以下の順序で実装を進めることを推奨します。

1.  **Route Handler設計 (API Interface)**
    - まず、画面が必要とするデータ構造を定義し、BFF (Backend for Frontend) としてのRoute Handlerのインターフェースを決定します。
    - Hono RPCの型定義を参照し、クライアントが必要とする形にデータを加工する方針を決めます。

2.  **Hooks抽出 (Logic Design)**
    - ViewとLogicを分離するため、状態管理やデータフェッチのロジックは Custom Hooks に切り出します。
    - **ルール**: コンポーネントファイル内に `useEffect` や複雑な `useState` ロジックを直接書かないこと。
    - **Pseudo-code First**: Hooksの実装前に、どのようなstateを持ち、どのような副作用(effect)があるか、JSDoc/TSDocで記述してください。

3.  **Component実装 (UI Implementation)**
    - Hooksから受け取ったpropsを表示することに専念する「Presentational Component」として実装します。
    - Storybook等で単体確認ができるように、依存関係を極力排除します。

4.  **Page組み立て (Integration)**
    - `page.tsx` は、HooksとComponentを繋ぎ合わせるレイヤーです。具体的なロジックは持たず、データの受け渡し(Wiring)に徹します。

## コンポーネント設計 (Component Design)

- **Server Components vs Client Components**
  - デフォルトは **Server Component** です。
  - 以下の機能が必要な場合のみ、ファイルの先頭に `use client` を記述し、Client Componentにします。
    - `useState`, `useEffect` などのReact Hooksの使用
    - `onClick`, `onChange` などのイベントリスナー
    - ブラウザAPI (window, localStorageなど) へのアクセス
  - **ルール**: `use client` は可能な限り末端のコンポーネントに閉じ込め、Server Componentのメリット(通信量削減、SEO)を活かします。
  - **ルール**: `useEffect` は同期的なレンダリングやイベントハンドラーで解決できない場合の最終手段としてのみ使用します（可能な限り `useMemo` による計算や、イベント駆動な処理に寄せます）。

- **Props定義**
  - コンポーネントのPropsは必ず型定義を行います。
  - `interface Props { ... }` を使用し、エクスポートしてテストコードからも参照可能にします。

## 状態管理 (State Management)

- グローバルな状態管理(Context API, Recoil, Zustand等)が必要な場合は、本当にローカルstateで解決できないか再考してください。

## AI駆動開発ガイドライン (AI Guidelines)

1.  **Usage First**:
    - 新しいコンポーネントやHooksを作る際、実装の詳細を書く前に「それがどう使われるか(Usage example)」をコメントで書いてください。
    - 例:
      ```typescript
      /**
       * Usage:
       * const { data, isLoading } = useUser(userId);
       * if (isLoading) return <Spinner />;
       */
      export const useUser = (userId: string) => { ... }
      ```

2.  **Atomic Verification**:
    - コンポーネントを一つ実装したら、それが期待通りレンダリングされるか、またはHooksが期待通り値を返すか、最小単位で確認する手段（コードスニペットや単純なテスト）を提示してください。
