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
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="userName">
            Username
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
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
            // minLength={8}
          />
        </div>

        {generalError && (
          <div className="text-red-500 text-sm">{generalError}</div>
        )}

        <button
          type="submit"
          disabled={isMutating}
          className="w-full mt-3 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isMutating ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
