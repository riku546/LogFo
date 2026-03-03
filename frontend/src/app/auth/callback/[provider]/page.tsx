"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const provider = params.provider as string;

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 実際にバックエンドからリダイレクトされてくる際の "?integration=" 等のパラメーターをチェックする等
    // ここではデモとして、数秒後に成功状態にしてダッシュボードへ遷移させる挙動とします
    const integrationStatus = searchParams.get("integration");

    if (integrationStatus === "success") {
      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else if (integrationStatus === "error") {
      setStatus("error");
      setErrorMessage(searchParams.get("message") || "認証に失敗しました。");
    } else {
      // 想定外のアクセスの場合
      setStatus("error");
      setErrorMessage("不正なリクエストです。");
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="glass p-8 rounded-2xl w-full max-w-md text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h1 className="text-xl font-semibold mb-2">{`${provider} と連携処理中...`}</h1>
            <p className="text-sm opacity-80">画面を閉じずにお待ちください。</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h1 className="text-xl font-semibold mb-2">{`${provider} の連携が完了しました！`}</h1>
            <p className="text-sm opacity-80 mb-6">
              ダッシュボードへ戻ります...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-xl font-semibold mb-2">連携エラー</h1>
            <p className="text-sm opacity-80 text-red-400 mb-6">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-all"
            >
              ダッシュボードへ戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
