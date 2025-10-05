import { AppError } from "./errors/app.error";
import type {
  GoogleTokenVerificationApiFailureResponse,
  GoogleTokenVerificationApiSuccessResponse,
  JWTPayload,
  ValidateAgainstSchemaResponse,
} from "./types";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { RESPONSE_MESSAGES } from "../config";

export function validate_against_schema(
  schema: any,
  data: any
): ValidateAgainstSchemaResponse {
  try {
    const parsedData = schema.parse(data);
    return {
      data: parsedData,
      errors: [],
    };
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      return {
        data: null,
        errors: e.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      };
    }

    throw e;
  }
}

export async function handle_request_validation(schema: any, data: any) {
  const validationRes = validate_against_schema(schema, data);

  if (validationRes.errors.length > 0) {
    const firstError = validationRes.errors[0];
    const errorMessage = `${firstError?.path}: ${firstError?.message}`;
    throw new AppError(errorMessage, 400);
  }

  return validationRes;
}

export async function verify_google_access_token(
  accessToken: string
): Promise<GoogleTokenVerificationApiSuccessResponse> {
  const res = await fetch(process.env.GOOGLE_API_TO_VERIFY_TOKEN as string, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const isTokenValid = res.status === 200;

  if (isTokenValid) {
    const resData =
      (await res.json()) as GoogleTokenVerificationApiSuccessResponse;
    return resData;
  } else {
    const resData =
      (await res.json()) as GoogleTokenVerificationApiFailureResponse;
    throw new AppError(resData.error_description, res.status);
  }
}

export function verify_jwt_token(authorizationHeader: string) {
  if (!authorizationHeader) {
    throw new AppError(RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST, 401);
  }

  const accessToken = authorizationHeader.split(" ")[1] as string;

  try {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string
    );
    return decodedToken as JWTPayload;
  } catch (e: unknown) {
    throw new AppError(RESPONSE_MESSAGES.UNAUTHORIZED_REQUEST, 401);
  }
}
