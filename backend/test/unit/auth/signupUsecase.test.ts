import { describe, expect, it, vi } from "vitest";
import type { PasswordHasher } from "../../../src/core/application/interfaces/passwordHasher";
import type { UserRepository } from "../../../src/core/application/interfaces/userRepository";
import { SignupUsecase } from "../../../src/core/application/usecases/auth/signupUsecase";
import { EmailAlreadyInUseError } from "../../../src/core/domain/errors";

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
    hash: vi.fn<PasswordHasher["hash"]>().mockResolvedValue("hashed_password"),
    verify: vi.fn<PasswordHasher["verify"]>(),
  } satisfies PasswordHasher;
};

describe("SignupUsecase", () => {
  const validInput = {
    email: "test@example.com",
    password: "password123",
    userName: "testuser",
  };

  it("新規ユーザーを正常に登録できる", async () => {
    const userRepository = createMockUserRepository();
    userRepository.findByEmail.mockResolvedValue(undefined);

    const passwordHasher = createMockPasswordHasher();
    const usecase = new SignupUsecase(userRepository, passwordHasher);

    await usecase.execute(validInput);

    expect(passwordHasher.hash).toHaveBeenCalledWith("password123");
    expect(userRepository.create).toHaveBeenCalledWith({
      name: "testuser",
      email: "test@example.com",
      passwordHash: "hashed_password",
    });
  });

  it("重複したメールアドレスの場合、EmailAlreadyInUseErrorをスローする", async () => {
    const userRepository = createMockUserRepository();
    userRepository.findByEmail.mockResolvedValue({
      id: "existing-id",
      name: "existing",
      email: "test@example.com",
      passwordHash: "hash",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const passwordHasher = createMockPasswordHasher();
    const usecase = new SignupUsecase(userRepository, passwordHasher);

    await expect(usecase.execute(validInput)).rejects.toThrow(
      EmailAlreadyInUseError,
    );

    // パスワードハッシュ化やDB作成は呼ばれないことを確認
    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
