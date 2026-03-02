"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { client } from "@/lib/client";
import { handleErrorResponse } from "@/lib/error";

// SWR Mutation Fetcher
const signupFetcher = async (
  _key: string,
  { arg }: { arg: { email: string; password: string; userName: string } },
) => {
  const res = await client.signup.$post({
    json: arg,
  });

  const data = await res.json();

  if (!res.ok) {
    handleErrorResponse(data);
  }
  return data;
};

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [generalError, setGeneralError] = useState("");

  const { trigger, isMutating } = useSWRMutation("signup", signupFetcher);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    try {
      await trigger({ email, password, userName });
      // 成功したらサインインページへ
      router.push("/signin");
    } catch (err) {
      if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-200 via-white to-white p-4 transition-all duration-500 dark:from-slate-700 dark:via-slate-900 dark:to-slate-950">
      <div className="glass flex w-full max-w-md flex-col gap-8 rounded-2xl p-10 shadow-xl shadow-blue-500/5">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            LogFoに参加して学習の軌跡を残しましょう。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="userName"
            >
              ユーザー名
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-slate-900 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-primary"
              placeholder="Your Name"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="email"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-slate-900 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-primary"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="password"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-slate-900 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:border-primary"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          {generalError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
              {generalError}
            </div>
          )}

          <button
            type="submit"
            disabled={isMutating}
            className="mt-2 cursor-pointer rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 disabled:bg-slate-400 disabled:shadow-none"
          >
            {isMutating ? "アカウント作成中..." : "アカウント作成"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          既にアカウントをお持ちですか？{" "}
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="font-semibold text-primary hover:underline cursor-pointer"
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
}
