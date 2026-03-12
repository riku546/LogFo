import { HTTPException } from "hono/http-exception";
import { z } from "zod";

/**
 * レスポンスJSONを指定した型として受け取ります。
 */
export function readJson<T>(response: Response): Promise<T>;
export function readJson(response: Response): Promise<unknown>;
export async function readJson(response: Response): Promise<unknown> {
  return response.json();
}

const jwtPayloadSchema = z.object({
  sub: z.string().min(1),
});

/**
 * HonoコンテキストからJWTのsubを安全に取り出します。
 */
export const getUserIdFromJwt = (c: {
  get: (key: string) => unknown;
}): string => {
  const parsed = jwtPayloadSchema.safeParse(c.get("jwtPayload"));
  if (!parsed.success) {
    throw new HTTPException(401, { message: "Invalid token" });
  }
  return parsed.data.sub;
};
