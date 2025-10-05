import type { CreateRoomApiRequestBody, LoginApiRequestBody } from "./types";
import AuthController from "./controllers/auth.controller";
import RoomController from "./controllers/room.controller";
import { AppError } from "./errors/app.error";
import { handle_request_validation, verify_jwt_token } from "./utils";
import {
  createRoomRequestBodySchema,
  loginApiRequestBodySchema,
} from "./schemas";
import { RESPONSE_MESSAGES, API_PATHS, AUTH_CONFIG } from "../config";

Bun.serve({
  port: process.env.SERVER_PORT,
  async fetch(req) {
    try {
      const url = new URL(req.url);
      const method = req.method;

      if (url.pathname === API_PATHS.LOGIN && method === "POST") {
        const validationRes = await handle_request_validation(
          loginApiRequestBodySchema,
          await req.json()
        );

        const reqBody = validationRes.data as LoginApiRequestBody;
        return await AuthController.login(reqBody.access_token);
      }

      if (url.pathname === API_PATHS.ROOMS.CREATE && method === "POST") {
        const loggedInUserPayload = verify_jwt_token(
          req.headers.get(AUTH_CONFIG.JWT_TOKEN_HEADER) as string
        );

        const validationRes = await handle_request_validation(
          createRoomRequestBodySchema,
          await req.json()
        );

        const reqBody = validationRes.data as CreateRoomApiRequestBody;
        return await RoomController.create_room(
          reqBody.type,
          loggedInUserPayload.userId,
          reqBody.name,
          reqBody.description
        );
      }

      return Response.json(
        {
          message: "Invalid API Path",
        },
        { status: 400 }
      );
    } catch (e: unknown) {
      console.error(e);

      if (e instanceof AppError) {
        return Response.json(
          {
            message: e.message,
          },
          {
            status: e.statusCode,
          }
        );
      } else {
        return Response.json(
          {
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          },
          {
            status: 500,
          }
        );
      }
    }
  },
});

console.log(`Listening on port ${process.env.SERVER_PORT} ...`);
