import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).default('user'),
  companyName: z.string(),
  status: z.enum(['active', 'inactive']).default('active')
});

export type CreateUserInput = z.infer<typeof createUserSchema>;