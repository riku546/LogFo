import { ErrorSchema } from "backend/src/schema/error";

export const handleErrorResponse = (data: unknown) => {
  const parsed = ErrorSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Unexpected error response");
  }

  const { validationErrors, errorMessage } = parsed.data;

  if (validationErrors?.length) {
    throw new Error(validationErrors.join(", "));
  } else {
    throw new Error(errorMessage);
  }
};
