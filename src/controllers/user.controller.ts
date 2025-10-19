import { DB_CONFIG, RESPONSE_MESSAGES } from "../../config";
import db from "../db";
import { AppError } from "../errors/app.error";

async function get_profile(userId: number, headers: any) {
  const [rows] = await db.query(
    `SELECT * FROM ${DB_CONFIG.TABLES.USERS.NAME} WHERE id = ?`,
    [userId]
  );

  const doesUserExist = (rows as any[]).length === 1;

  if (doesUserExist === false) {
    throw new AppError(RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST, 401);
  }

  const user = (rows as any[])[0];

  return Response.json(
    {
      name: user.name,
      email: user.email,
      picture_url: user.picture_url,
    },
    {
      status: 200,
      headers,
    }
  );
}

export default {
  get_profile,
};
