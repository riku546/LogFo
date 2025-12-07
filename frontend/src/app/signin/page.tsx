"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { client } from "@/lib/client";
import { handleErrorResponse } from "@/lib/error";

// SWR Mutation Fetcher
const signinFetcher = async (
  _key: string,
  { arg }: { arg: { email: string; password: string } },
) => {
  const res = await client.signin.$post({
    json: arg,
  });

  const data = await res.json();

  if (!res.ok) {
    handleErrorResponse(data);
  }

  return data as { token: string };
};

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [generalError, setGeneralError] = useState("");

  const { trigger, isMutating } = useSWRMutation("signin", signinFetcher);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    try {
      const result = await trigger({ email, password });

      localStorage.setItem("token", result.token);

      router.push("/");
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
            minLength={8}
          />
        </div>

        {generalError && (
          <div className="text-red-500 text-sm">{generalError}</div>
        )}

        <button
          type="submit"
          disabled={isMutating}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isMutating ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
