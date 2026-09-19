import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "development-secret-change-this";

export interface AuthTokenPayload {
  userId: string;
  role: string;
}

export function generateAuthToken(
  payload: AuthTokenPayload,
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAuthToken(
  token: string,
): AuthTokenPayload {
  return jwt.verify(
    token,
    JWT_SECRET,
  ) as AuthTokenPayload;
}