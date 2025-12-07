import { z } from "zod";

export const ErrorSchema = z.object({
  success: z.literal(false),
  errorMessage: z.string(),
  validationErrors: z.array(z.string()).optional(),
});
