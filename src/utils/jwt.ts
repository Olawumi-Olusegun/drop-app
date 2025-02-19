import jwt from "jsonwebtoken";

export const generateToken = ({
  userId,
  role,
  expiresIn = "1h",
  secret = process.env.JWT_SECRET || "",
}: {
  userId: string;
  role: string;
  expiresIn?: any;
  secret?: string;
}): string => {

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ userId, role }, secret, { expiresIn });
};
