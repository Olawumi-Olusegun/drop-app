import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";


export const validateSignup = [
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phoneNumber').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('googleId').optional().isString().withMessage('Invalid Google ID'),
  body("role").isIn(["rider", "driver", "admin"]).withMessage("Kindly register as a 'rider' or 'driver'"),
];


export const validateSignin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
];


export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};



