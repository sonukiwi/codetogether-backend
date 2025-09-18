import { z } from "zod";

export const loginApiRequestBodySchema = z.object({
  access_token: z.string().min(1, "Access token is required"),
});
