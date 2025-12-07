import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import Home from "../../src/app/page";

describe("Home Component", () => {
  it("displays hello world", () => {
    render(React.createElement(Home));

    // 2. "hello world" というテキストを持つ要素を取得
    // { selector: 'p' } を指定すると、最初から pタグの中にあるものだけを探せます
    const element = screen.getByText("hello world", { selector: "p" });

    // 3. 要素がドキュメント上に存在することを確認
    expect(element).toBeInTheDocument();
  });
});
