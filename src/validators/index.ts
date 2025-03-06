import { body, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";


export const validateSignup = [
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phoneNumber').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('googleId').optional().isString().withMessage('Invalid Google ID'),
  body("role").isIn(["rider", "driver", "admin"]).withMessage("Kindly register as a 'rider' or 'driver'"),
];


export const validateSignin = [
  body("identifier").notEmpty()
    .withMessage("Email or phone number is required!")
    .custom((value) => {
      if (!value.includes("@") && !/^\d+$/.test(value)) {
        throw new Error("Identifier must be a valid email or phone number");
      }
      return true;
    }),
  body("password").notEmpty().withMessage("Password is required")
];


export const validatePhoneNumberOTP = [
  body("phoneNumberOTP").notEmpty().withMessage("Phone number OTP is required"),
  body("phoneNumber").notEmpty().withMessage("Phone number is required"),
];

export const validateEmailOTP = [
  body("emailOTP").notEmpty().withMessage("Email OTP is required"),
  body('email').optional().isEmail().withMessage('Invalid email'),
];

export const validateRefreshToken = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

export const validateEmail = [
  body("email").isEmail().withMessage("Invalid email format"),
];

export const validateNewOTP = [
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('phoneNumber').optional().isMobilePhone('any').withMessage('Invalid phone number'),
];


export const validateCreatePassword = [
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("google").optional().isBoolean().withMessage("Google authentication flag must be a boolean"),
  body("phoneNumber").optional().isMobilePhone("any").withMessage("Invalid phone number"),
  body("password").isString().notEmpty().withMessage("Password is required"),
  body("confirmPassword").isString().notEmpty().withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

];


export const validateForgotPassword = [
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("phoneNumber").optional().isMobilePhone("any").withMessage("Invalid phone number"),
];

export const validateResetPassword = [
  body("otp").isString().notEmpty().withMessage("OTP is required"),
  body("phoneNumber").optional().isMobilePhone("any").withMessage("Invalid phone number"),
  body("password").isString().notEmpty().withMessage("Password is required"),
  body("confirmPassword").isString().notEmpty().withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];




export const validateUserLocation = [
  body('phoneNumber').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("role")
    .isString()
    .isIn(["rider", "driver", "admin"])
    .withMessage("Role must be either 'rider' or 'driver'"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate"),
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate"),
];


export const validateQueryParams = [
  query("latitude")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate between -90 and 90"),

  query("longitude")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate between -180 and 180"),

  query("radius")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Radius must be a positive number"),
];



export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};



