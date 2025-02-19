import { Request } from "express";

export interface AuthRequest extends Request {
    user?: { userId: string; role: string };
  }

  export enum UserRole {
    RIDER = "rider",
    DRIVER = "driver",
    ADMIN = "admin",
  }