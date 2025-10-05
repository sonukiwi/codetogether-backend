import { verify_google_access_token } from "../utils";
import { RESPONSE_MESSAGES } from "../../config";
import { AppError } from "../errors/app.error";
import db from "../db";
import { DB_CONFIG } from "../../config";
import jwt from "jsonwebtoken";
import type { JwtTokenExpiry } from "../types";

async function login(accessToken: string) {
  const userData = await verify_google_access_token(accessToken);

  if (userData.email_verified === false) {
    throw new AppError(RESPONSE_MESSAGES.EMAIL_NOT_VERIFIED, 401);
  }

  let userId: number;

  const [rows] = await db.query(
    `SELECT * FROM ${DB_CONFIG.TABLES.USERS.NAME} WHERE email = ?`,
    [userData.email]
  );

  const doesUserExist = (rows as any[]).length === 1;

  if (doesUserExist === false) {
    const [insertRes] = await db.query(
      `INSERT INTO ${DB_CONFIG.TABLES.USERS.NAME} (email, name, picture_url) VALUES (?, ?, ?)`,
      [userData.email, userData.name, userData.picture]
    );

    const { affectedRows } = insertRes as any;

    if (affectedRows === 0) {
      throw new AppError(RESPONSE_MESSAGES.UNEXPECTED_ERROR, 500);
    }

    userId = (insertRes as any).insertId;
  } else {
    userId = (rows as any[])[0].id;
  }

  // Generate JWT token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_TOKEN_EXPIRY as JwtTokenExpiry,
  });

  return Response.json(
    {
      token,
    },
    {
      status: 200,
    }
  );
}

export default {
  login,
};
