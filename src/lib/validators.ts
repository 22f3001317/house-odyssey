import { z } from "zod";
export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid college email."),
  password: z.string().min(10, "Use at least 10 characters.").max(128),
});
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email."), password: z.string().min(1, "Enter your password.") });
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email."),
  subject: z.string().trim().min(3, "Add a short subject.").max(120),
  message: z.string().trim().min(10, "Write at least 10 characters.").max(2000),
  website: z.string().max(0).optional(), // honeypot: real people leave it empty
});
