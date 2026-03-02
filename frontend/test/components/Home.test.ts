import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import Home from "../../src/app/page";

/**
 * フロントエンドテストの基本的な流れ:
 * 1. Arrange (準備): テストするコンポーネントを `render` で描画
 * 2. Act (操作): ボタンクリックや入力などのユーザー操作 (今回は表示確認のみ)
 * 3. Assert (検証): `expect` を使って、期待する要素が表示されているか確認
 */
describe("Home Component", () => {
  it("メインの見出しと説明文が表示されること", () => {
    render(React.createElement(Home));

    // メインコピーの確認
    expect(screen.getByText("学習の軌跡を、信頼に。")).toBeInTheDocument();

    // 説明文の確認
    expect(
      screen.getByText(
        "日々の学習ログを、信頼できるポートフォリオに変換します。",
      ),
    ).toBeInTheDocument();
  });

  it("利用開始ボタンとプロジェクト閲覧ボタンが表示されること", () => {
    render(React.createElement(Home));

    // ボタンの確認 (role="button" を持つ要素を探す)
    const startButton = screen.getByRole("button", { name: "無料で始める" });
    const projectButton = screen.getByRole("button", {
      name: "プロジェクトを見る",
    });

    expect(startButton).toBeInTheDocument();
    expect(projectButton).toBeInTheDocument();
  });
});
