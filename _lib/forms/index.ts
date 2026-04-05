import { z } from "zod"

// Login Schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register Schema
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address").toLowerCase().trim(),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address").toLowerCase().trim(),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
