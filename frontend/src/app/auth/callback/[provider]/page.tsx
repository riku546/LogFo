"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function AuthCallbackPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { provider } = use(params);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  const integrationStatus = searchParams.get("integration");
  const errorMessage = searchParams.get("message");

  useEffect(() => {
    if (integrationStatus === "success") {
      setStatus("success");
      // 3秒後にダッシュボードへ戻る
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
      return () => clearTimeout(timer);
    } else if (integrationStatus === "error") {
      setStatus("error");
      setMessage(errorMessage || "連携に失敗しました。");
    }
  }, [integrationStatus, errorMessage, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">{provider}と連携中...</h2>
          <p className="opacity-70">しばらくお待ちください。</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">連携が完了しました！</h2>
          <p className="opacity-70">
            {provider}の活動データが同期可能になりました。
            <br />
            自動的にダッシュボードへ戻ります...
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-lg"
          >
            今すぐダッシュボードへ
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">エラーが発生しました</h2>
          <p className="text-red-500 mb-6">{message}</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-gray-200 dark:bg-white/10 rounded-lg"
          >
            ダッシュボードに戻る
          </button>
        </>
      )}
    </div>
  );
}
