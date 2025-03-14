import { NextFunction, Request, Response } from "express";
import prisma from "../config/db";
import { Statuscode } from "../utils/Statuscode";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "@prisma/client";


interface VerifyToken extends JwtPayload {
  userId: string;
  role: UserRole;
}

export const rejectBlockedUsers = async (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Token is required" });
    return;
  }

  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const secret = process.env.JWT_ACCESS_TOKEN_SECRET || "";

  if (!secret) {
    res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Invalid token!" });
    return;
  }

  try {

    const decoded = jwt.verify(token, secret) as VerifyToken;

    if (!decoded || !decoded?.userId) {
      res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Invalid token" });
      return;
    }

    const userId = decoded.userId;

    if (!userId) {
      return res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized!" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isBlocked: true },
    });

    if (!user) {
      return res.status(Statuscode.NOT_FOUND).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(Statuscode.FORBIDDEN).json({ message: "Your account is blocked." });
    }

    next();
  } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
          res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Token has expired" });
          return;
        }
    
        if (error instanceof jwt.JsonWebTokenError) {
          res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Invalid token" });
          return;
        }
        if (error instanceof jwt.NotBeforeError) {
          res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Token not active yet" });
          return;
        }

      res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
      return;
  }
};