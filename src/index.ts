import type { LoginApiRequestBody } from "./types";
import AuthController from "./controllers/auth.controller";
import { AppError } from "./errors/app.error";
import { validate_against_schema } from "./utils";
import { loginApiRequestBodySchema } from "./schemas";
import { RESPONSE_MESSAGES, API_PATHS } from "../config";

const server = Bun.serve({
  port: process.env.SERVER_PORT,
  async fetch(req) {
    try {
      const url = new URL(req.url);
      const method = req.method;

      if (url.pathname === API_PATHS.LOGIN && method === "POST") {
        const validationRes = validate_against_schema(
          loginApiRequestBodySchema,
          await req.json()
        );

        if (validationRes.errors.length > 0) {
          const firstError = validationRes.errors[0];
          const errorMessage = `${firstError?.path}: ${firstError?.message}`;
          throw new AppError(errorMessage, 400);
        }

        const reqBody = validationRes.data as LoginApiRequestBody;
        return await AuthController.login(reqBody.access_token);
      }

      return Response.json(
        {
          message: "Invalid API Path",
        },
        { status: 404 }
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
