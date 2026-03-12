import { describe, expect, it, vi } from "vitest";
import type { PasswordHasher } from "../../../src/core/application/interfaces/passwordHasher";
import type { UserRepository } from "../../../src/core/application/interfaces/userRepository";
import { SigninUsecase } from "../../../src/core/application/usecases/auth/signinUsecase";
import {
  InvalidPasswordError,
  UserNotFoundError,
} from "../../../src/core/domain/errors";
import type { User } from "../../../src/core/domain/models/user";

/**
 * モックのUserRepositoryを生成します。
 */
const createMockUserRepository = () => {
  return {
    findByEmail: vi.fn<UserRepository["findByEmail"]>(),
    create: vi.fn<UserRepository["create"]>(),
  } satisfies UserRepository;
};

/**
 * モックのPasswordHasherを生成します。
 */
const createMockPasswordHasher = () => {
  return {
    hash: vi.fn<PasswordHasher["hash"]>(),
    verify: vi.fn<PasswordHasher["verify"]>(),
  } satisfies PasswordHasher;
};

/**
 * テスト用のユーザーデータを生成します。
 */
const createTestUser = (overrides?: Partial<User>): User => ({
  id: "user-id-123",
  name: "testuser",
  email: "test@example.com",
  passwordHash: "hashed_password",
  avatarUrl: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  ...overrides,
});

describe("SigninUsecase", () => {
  const validInput = {
    email: "test@example.com",
    password: "password123",
  };

  it("正しい認証情報でユーザー情報を返す", async () => {
    const testUser = createTestUser();
    const userRepository = createMockUserRepository();
    userRepository.findByEmail.mockResolvedValue(testUser);

    const passwordHasher = createMockPasswordHasher();
    passwordHasher.verify.mockResolvedValue(true);

    const usecase = new SigninUsecase(userRepository, passwordHasher);
    const result = await usecase.execute(validInput);

    expect(result).toEqual(testUser);
    expect(userRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(passwordHasher.verify).toHaveBeenCalledWith(
      "password123",
      "hashed_password",
    );
  });

  it("存在しないメールアドレスの場合、UserNotFoundErrorをスローする", async () => {
    const userRepository = createMockUserRepository();
    userRepository.findByEmail.mockResolvedValue(undefined);

    const passwordHasher = createMockPasswordHasher();
    const usecase = new SigninUsecase(userRepository, passwordHasher);

    await expect(usecase.execute(validInput)).rejects.toThrow(
      UserNotFoundError,
    );

    // パスワード検証は呼ばれないことを確認
    expect(passwordHasher.verify).not.toHaveBeenCalled();
  });

  it("パスワードが一致しない場合、InvalidPasswordErrorをスローする", async () => {
    const testUser = createTestUser();
    const userRepository = createMockUserRepository();
    userRepository.findByEmail.mockResolvedValue(testUser);

    const passwordHasher = createMockPasswordHasher();
    passwordHasher.verify.mockResolvedValue(false);

    const usecase = new SigninUsecase(userRepository, passwordHasher);

    await expect(usecase.execute(validInput)).rejects.toThrow(
      InvalidPasswordError,
    );
  });
});
