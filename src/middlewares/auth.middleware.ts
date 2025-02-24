import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types";
import { Statuscode } from "../utils/Statuscode";



export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Token is required" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: No token provided" });
  }

  const secret = process.env.JWT_SECRET || "";

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded || !decoded?.userId) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Invalid token" });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Token has expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Invalid token" });
    }
    if (error instanceof jwt.NotBeforeError) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Token not active yet" });
    }

    return res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};


export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: You do not have permission" });
    }
    next();
  };
};
