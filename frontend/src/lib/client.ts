import type { AppType } from "backend/src/index";
import { hc } from "hono/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export const client = hc<AppType>(API_URL);
