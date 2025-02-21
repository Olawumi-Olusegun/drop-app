import { NextFunction, Request, Response } from "express";

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    res.status(404).json({ message: error.message });
  };
  