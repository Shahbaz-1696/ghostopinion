import { z } from "zod";

export const singinSchema = z.object({
  identifier: z.string(),
  email: z.string().email(),
  password: z.string(),
});
