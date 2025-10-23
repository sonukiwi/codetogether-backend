import { DB_CONFIG, RESPONSE_MESSAGES } from "../../config";
import db from "../db";
import { AppError } from "../errors/app.error";
import type { RoomType } from "../types";
import { v4 as uuidv4 } from "uuid";

async function create_room(
  type: RoomType,
  ownerId: number,
  name: string,
  description: string,
  headers: any
) {
  const roomId = uuidv4();

  const [res] = await db.query(
    `INSERT INTO ${DB_CONFIG.TABLES.ROOMS.NAME} (uuid, name, description, owner_id, type) VALUES (?, ?, ?, ?, ?)`,
    [roomId, name, description, ownerId, type]
  );

  const { affectedRows } = res as any;

  if (affectedRows === 0) {
    throw new AppError(RESPONSE_MESSAGES.UNEXPECTED_ERROR, 500);
  }

  return Response.json(
    {
      roomId,
    },
    {
      status: 201,
      headers,
    }
  );
}

export default {
  create_room,
};
