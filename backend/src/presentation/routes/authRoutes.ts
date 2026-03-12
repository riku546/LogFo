import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { SigninUsecase } from "../../core/application/usecases/auth/signinUsecase";
import { SignupUsecase } from "../../core/application/usecases/auth/signupUsecase";
import {
  EmailAlreadyInUseError,
  InvalidPasswordError,
  UserNotFoundError,
} from "../../core/domain/errors";
import { BcryptPasswordHasher } from "../../infrastructure/auth/bcryptPasswordHasher";
import { DrizzleUserRepository } from "../../infrastructure/repositories/drizzleUserRepository";
import { buildErrorResponse } from "../../lib/buildErrorResponse";
import { signinSchema, signupSchema } from "../../schema/auth";

/**
 * 認証関連のHonoルーティングを生成するファクトリ関数
 * DI（依存性の注入）はリクエストごとにハンドラ内で行います。
 *
 * @returns 認証ルート（/signup, /signin）が定義されたHonoアプリインスタンス
 */
export const createAuthRoutes = () => {
  return new Hono<{ Bindings: Env }>()
    .post(
      "/signup",
      zValidator("json", signupSchema, (result, c) => {
        if (!result.success) {
          return buildErrorResponse(
            c,
            400,
            "Validation Error",
            result.error.issues.map((issue) => issue.message),
          );
        }
      }),
      async (c) => {
        const { email, password, userName } = c.req.valid("json");

        const db = drizzle(c.env.DB);
        const userRepository = new DrizzleUserRepository(db);
        const passwordHasher = new BcryptPasswordHasher();
        const usecase = new SignupUsecase(userRepository, passwordHasher);

        try {
          await usecase.execute({ email, password, userName });
        } catch (error) {
          if (error instanceof EmailAlreadyInUseError) {
            throw new HTTPException(409, { message: error.message });
          }
          throw error;
        }

        return c.json({ message: "User created successfully" }, 201);
      },
    )
    .post(
      "/signin",
      zValidator("json", signinSchema, (result, c) => {
        if (!result.success) {
          return buildErrorResponse(
            c,
            400,
            "Validation Error",
            result.error.issues.map((issue) => issue.message),
          );
        }
      }),
      async (c) => {
        const { email, password } = c.req.valid("json");

        const db = drizzle(c.env.DB);
        const userRepository = new DrizzleUserRepository(db);
        const passwordHasher = new BcryptPasswordHasher();
        const usecase = new SigninUsecase(userRepository, passwordHasher);

        let authenticatedUser: Awaited<ReturnType<SigninUsecase["execute"]>>;
        try {
          authenticatedUser = await usecase.execute({ email, password });
        } catch (error) {
          if (
            error instanceof UserNotFoundError ||
            error instanceof InvalidPasswordError
          ) {
            throw new HTTPException(401, { message: error.message });
          }
          throw error;
        }

        // JWTペイロードの作成
        // exp (Expiration Time) を設定することで、verify時に有効期限チェックが行われます
        const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
        const payload = {
          sub: authenticatedUser.id,
          role: "user",
          exp: Math.floor(Date.now() / 1000) + ONE_WEEK_IN_SECONDS,
        };

        const token = await sign(payload, c.env.JWT_SECRET);

        return c.json({ token });
      },
    );
};
