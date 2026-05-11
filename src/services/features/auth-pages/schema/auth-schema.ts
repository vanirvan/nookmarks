import * as z from "zod";

export const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
});
export type SignUpValues = z.infer<typeof signUpSchema>;
