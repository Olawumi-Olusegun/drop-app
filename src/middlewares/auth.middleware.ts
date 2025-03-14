import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest, UserRole } from "../types";
import { Statuscode } from "../utils/Statuscode";
import prisma from "../config/db";


interface VerifyToken extends JwtPayload {
  userId: string;
  role: UserRole;
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
console.log("AUTHENTICATION")
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

    const userExist = await prisma.user.findUnique({
      where: { id: decoded?.userId },
      select: { id: true, accessToken: true }
    });

    if (!userExist) {
      res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Unrecognisable user identity" });
      return;
    }

    if (token !== userExist.accessToken) {
      res.status(Statuscode.UNAUTHORIZED).json({ message: "Unauthorized: Invalid token" });
      return;
    }


    req.user = {
      userId: decoded.userId,
      driverId: decoded.driverId,
      role: decoded.role,
    };

    next();

  } catch (error) {
    console.log("ERROR")
    console.log(error)

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

    res.status(Statuscode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error", error });
    return;
  }
};


export const authorizeRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as AuthRequest)?.user?.role as UserRole;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to access this route" });
    }
    next();
  };
};
