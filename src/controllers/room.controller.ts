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

async function get_room_metadata(roomId: string, headers: any) {
  const [res] = await db.query(
    `SELECT * FROM ${DB_CONFIG.TABLES.ROOMS.NAME} WHERE uuid = ?`,
    [roomId]
  );
  const doesRoomExist = (res as any[]).length === 1;

  if (doesRoomExist) {
    return Response.json(
      {
        metadata: (res as any[])[0],
      },
      {
        status: 200,
        headers,
      }
    );
  } else {
    return Response.json(
      {
        metadata: null,
      },
      {
        status: 404,
        headers,
      }
    );
  }
}

export default {
  create_room,
  get_room_metadata,
};
