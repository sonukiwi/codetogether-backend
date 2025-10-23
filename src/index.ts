import type { CreateRoomApiRequestBody, LoginApiRequestBody } from "./types";
import AuthController from "./controllers/auth.controller";
import RoomController from "./controllers/room.controller";
import UserController from "./controllers/user.controller";
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
    let corsHeaders = {};
    try {
      const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(
        ","
      ) as string[];

      const url = new URL(req.url);
      const method = req.method;
      const origin = req.headers.get("origin") as string;

      corsHeaders = {
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
          ? origin
          : "",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      };

      if (method === "OPTIONS") {
        return Response.json(
          {},
          {
            headers: corsHeaders,
          }
        );
      }

      if (url.pathname === API_PATHS.LOGIN && method === "POST") {
        const validationRes = await handle_request_validation(
          loginApiRequestBodySchema,
          await req.json()
        );

        const reqBody = validationRes.data as LoginApiRequestBody;
        return await AuthController.login(reqBody.access_token, corsHeaders);
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

      if (url.pathname === API_PATHS.GET_PROFILE && method === "GET") {
        const loggedInUserPayload = verify_jwt_token(
          req.headers.get(AUTH_CONFIG.JWT_TOKEN_HEADER) as string
        );
        const userId = loggedInUserPayload.userId;

        return await UserController.get_profile(userId, corsHeaders);
      }

      if (url.pathname === API_PATHS.IS_TOKEN_VALID && method === "GET") {
        let isTokenValid = false;

        try {
          verify_jwt_token(
            req.headers.get(AUTH_CONFIG.JWT_TOKEN_HEADER) as string
          );
          isTokenValid = true;
        } catch (e: unknown) {
          isTokenValid = false;
        }

        return Response.json(
          {
            is_valid: isTokenValid,
          },
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }

      return Response.json(
        {
          message: "Invalid API Path",
        },
        { status: 400, headers: corsHeaders }
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
            headers: corsHeaders,
          }
        );
      } else {
        return Response.json(
          {
            message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
          },
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }
  },
});

console.log(`Listening on port ${process.env.SERVER_PORT} ...`);
