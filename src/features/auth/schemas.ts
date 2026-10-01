import { z } from "zod";
import { emailSchema, passwordSchema, requiredString } from "@/lib/validation";

export const signInSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const signUpSchema = z
    .object({
        name: requiredString().max(70),
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((values) => values.password === values.confirmPassword, {
        error: "passwordMismatch",
        path: ["confirmPassword"],
    });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
