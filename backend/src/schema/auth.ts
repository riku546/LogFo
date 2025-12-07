import { z } from "zod";

/**
 * Auth request schemas shared across signup/signin handlers.
 */
export const signupSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  userName: z.string().min(1, "Username is required"),
});

export const signinSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
