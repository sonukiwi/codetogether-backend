import { AppError } from "./errors/app.error";
import type {
  GoogleTokenVerificationApiFailureResponse,
  GoogleTokenVerificationApiSuccessResponse,
  ValidateAgainstSchemaResponse,
} from "./types";
import { ZodError } from "zod";

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

export async function verify_access_token(
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
