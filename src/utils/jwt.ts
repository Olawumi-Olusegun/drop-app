import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError, NotBeforeError } from "jsonwebtoken";


export const generateToken = ({
  userId,
  role,
  expiresIn = "5h",
  secret = process.env.JWT_ACCESS_TOKEN_SECRET || "",
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

type Token = {
  token: string;
  secret?: string;
}

export const verifyJwtToken = ({
  token,
  secret = process.env.JWT_REFRESH_TOKEN_SECRET,
}: Token): { valid: boolean; error?: string; payload?: JwtPayload } => {
  try {
    const decoded = jwt.verify(token, secret || "") as JwtPayload;
    return { valid: true, payload: decoded };
  } catch (error) {
    const decoded = jwt.decode(token) as JwtPayload | null; 

    if (error instanceof TokenExpiredError) {
      return { valid: false, error: "Token has expired", payload: decoded || undefined };
    }
    if (error instanceof JsonWebTokenError) {
      return { valid: false, error: "Invalid token", payload: decoded || undefined };
    }
    if (error instanceof NotBeforeError) {
      return { valid: false, error: "Token is not active yet", payload: decoded || undefined };
    }
    return { valid: false, error: "Token verification failed", payload: decoded || undefined };
  }
};
