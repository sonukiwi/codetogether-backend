import { z } from "zod";
import { DB_CONFIG } from "../config";

export const loginApiRequestBodySchema = z.object({
  access_token: z.string().min(1, "Access token is required"),
});

export const createRoomRequestBodySchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
  type: z.enum(DB_CONFIG.TABLES.ROOMS.VALIDATIONS.ROOM_TYPE.ALLOWED_VALUES),
});
