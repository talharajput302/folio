import { z } from "zod";

// Every API input is validated through one of these before it touches the DB.

export const loginSchema = z.object({
  email: z.string().email("A valid email is required."),
  password: z.string().min(1, "Password is required."),
});

// Strong-password rules — mirrored by the live checklist in the signup UI.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(200)
  .regex(/[A-Z]/, "Add an uppercase letter.")
  .regex(/[a-z]/, "Add a lowercase letter.")
  .regex(/[0-9]/, "Add a number.");

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  email: z.string().email("A valid email is required."),
  password: passwordSchema,
});

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

export const updateDocumentSchema = z
  .object({
    // Title may be empty — the UI shows a placeholder and a display fallback.
    title: z.string().trim().max(200).optional(),
    content: z.string().max(1_000_000, "Document is too large.").optional(),
  })
  .refine((v) => v.title !== undefined || v.content !== undefined, {
    message: "Nothing to update.",
  });

export const shareSchema = z.object({
  email: z.string().email("A valid email is required."),
  role: z.enum(["editor"]).default("editor"),
});

// File upload constraints (also enforced in the upload route).
export const UPLOAD = {
  maxBytes: 1_000_000, // 1 MB
  allowedExtensions: [".txt", ".md"] as const,
};

export type LoginInput = z.infer<typeof loginSchema>;
export type ShareInput = z.infer<typeof shareSchema>;
