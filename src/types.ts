export type LoginApiRequestBody = {
  access_token: string;
};

export type GoogleTokenVerificationApiSuccessResponse = {
  name: string;
  email: string;
  email_verified: boolean;
  picture: string;
};

export type GoogleTokenVerificationApiFailureResponse = {
  error: string;
  error_description: string;
};

export type ValidateAgainstSchemaResponse = {
  data: unknown;
  errors: Array<{ path: string; message: string }>;
};

export type JwtTokenExpiry = "24h";
