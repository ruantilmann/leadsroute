import { oc } from "@orpc/contract";
import { z } from "zod";

const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const authUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const signupInputSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "Senha precisa ter no minimo 8 caracteres.")
    .regex(
      passwordComplexityRegex,
      "Senha deve conter letra maiuscula, minuscula, numero e simbolo."
    ),
});

export const signupOutputSchema = z.object({
  user: authUserSchema,
  emailVerificationRequired: z.boolean(),
});

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const loginOutputSchema = z.object({
  user: authUserSchema,
});

export const meInputSchema = z.object({}).optional();

export const meOutputSchema = z.object({
  user: authUserSchema,
});

export const refreshInputSchema = z.object({}).optional();

export const refreshOutputSchema = z.object({
  ok: z.literal(true),
});

export const logoutInputSchema = z.object({}).optional();

export const logoutOutputSchema = z.object({
  ok: z.literal(true),
});

export const logoutAllInputSchema = z.object({}).optional();

export const logoutAllOutputSchema = z.object({
  ok: z.literal(true),
});

export const requestEmailVerificationInputSchema = z.object({
  email: z.email(),
});

export const requestEmailVerificationOutputSchema = z.object({
  ok: z.literal(true),
});

export const verifyEmailInputSchema = z.object({
  token: z.string().min(32),
});

export const verifyEmailOutputSchema = z.object({
  ok: z.literal(true),
});

export const requestPasswordResetInputSchema = z.object({
  email: z.email(),
});

export const requestPasswordResetOutputSchema = z.object({
  ok: z.literal(true),
});

export const resetPasswordInputSchema = z.object({
  token: z.string().min(32),
  password: z
    .string()
    .min(8, "Senha precisa ter no minimo 8 caracteres.")
    .regex(
      passwordComplexityRegex,
      "Senha deve conter letra maiuscula, minuscula, numero e simbolo."
    ),
});

export const resetPasswordOutputSchema = z.object({
  ok: z.literal(true),
});

export const authContract = {
  signup: oc.input(signupInputSchema).output(signupOutputSchema),
  login: oc.input(loginInputSchema).output(loginOutputSchema),
  me: oc.input(meInputSchema).output(meOutputSchema),
  refresh: oc.input(refreshInputSchema).output(refreshOutputSchema),
  logout: oc.input(logoutInputSchema).output(logoutOutputSchema),
  logoutAll: oc.input(logoutAllInputSchema).output(logoutAllOutputSchema),
  requestEmailVerification: oc
    .input(requestEmailVerificationInputSchema)
    .output(requestEmailVerificationOutputSchema),
  verifyEmail: oc.input(verifyEmailInputSchema).output(verifyEmailOutputSchema),
  requestPasswordReset: oc
    .input(requestPasswordResetInputSchema)
    .output(requestPasswordResetOutputSchema),
  resetPassword: oc.input(resetPasswordInputSchema).output(resetPasswordOutputSchema),
};
