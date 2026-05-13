import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function createSafeAction<TInput, TOutput>(
  validationSchema: z.ZodSchema<TInput> | null,
  handler: (
    data: TInput,
    session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
  ) => Promise<TOutput>,
) {
  return async (input: TInput): Promise<ActionResponse<TOutput>> => {
    try {
      const validatedData = validationSchema
        ? validationSchema.parse(input)
        : input;

      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        return { success: false, error: "Unauthorized: Please sign in again." };
      }

      const result = await handler(
        validatedData,
        session as NonNullable<typeof session>,
      );

      return { success: true, data: result };
    } catch (error) {
      console.error("Action Error:", error);

      // Handle Error from Zod (Validation)
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.issues[0].message,
        };
      }

      // Handle common Error from throw new Error
      return {
        success: false,
        error: error instanceof Error ? error.message : "Something went wrong",
      };
    }
  };
}
