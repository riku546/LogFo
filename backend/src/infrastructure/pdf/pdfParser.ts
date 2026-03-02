import { getDocument } from "pdfjs-serverless";

/**
 * PDFバイナリからテキストを抽出します。
 * pdfjs-serverlessを使用し、Edge環境（Cloudflare Workers）で動作します。
 *
 * @param pdfBuffer - PDFファイルのArrayBuffer
 * @returns 抽出されたテキスト文字列。抽出に失敗した場合はundefined
 */
export const extractPdfText = async (
  pdfBuffer: ArrayBuffer,
): Promise<string | undefined> => {
  try {
    const loadingTask = getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;

    const textParts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item) => "str" in item)
        .map((item) => (item as { str: string }).str)
        .join(" ");
      textParts.push(pageText);
    }

    const fullText = textParts.join("\n").trim();

    if (fullText.length === 0) {
      return undefined;
    }

    return fullText;
  } catch (error) {
    console.error("PDF解析エラー:", error);
    return undefined;
  }
};
