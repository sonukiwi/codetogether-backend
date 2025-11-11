export const RESPONSE_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  UNEXPECTED_ERROR: "Unexpected error",
  EMAIL_NOT_VERIFIED: "Email not verified",
  UNAUTHORIZED_REQUEST: "Unauthorized request",
};

export const API_PATHS = {
  LOGIN: "/login",
  ROOMS: {
    CREATE: "/create-room",
  },
  GET_PROFILE: "/profile",
  IS_TOKEN_VALID: "/is-token-valid",
  GET_ROOM_METADATA: "/room-metadata",
};

export const DB_CONFIG = {
  TABLES: {
    USERS: {
      NAME: "users",
    },
    ROOMS: {
      NAME: "rooms",
      VALIDATIONS: {
        ROOM_TYPE: {
          ALLOWED_VALUES: ["PUBLIC"],
        },
      },
    },
  },
};

export const AUTH_CONFIG = {
  JWT_TOKEN_HEADER: "authorization",
};
