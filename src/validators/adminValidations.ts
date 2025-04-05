import { NextFunction, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";

export const validateGetAllUsers = [
    query('page')
    .optional()
    .isInt({min: 1}).withMessage("page must be an integer greater than equal to 1"),
    query('limit')
    .optional()
    .isInt({min: 1}).withMessage("limit must be greater than or equal to 1"),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },

]

export const validateGetUSer =[
    query('userId')
    .exists().withMessage("userId is required"),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },

]

export const validateGetAllDrivers = [
    query('page')
    .optional()
    .isInt({min : 1}).withMessage("page must be an integer greater than zero "),
    query('limit')
    .optional()
    .isInt({min: 1}).withMessage("limit must be an integer greater than zero"),
    (req: Request, res: Response, next: NextFunction) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
     next();
   },

]


export const  validateGetDriver = [
    query('driverId')
    .exists().withMessage("driverId is required"),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
]



export const  validateapproveDriver = [
    body('driverId')
    .exists().withMessage("driverId is required"),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
]



export const  validatesuspendDriver = [
    body('driverId')
    .exists().withMessage("driverId is required"),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
]


export const validateApproveWithdrawal = [
  body('withdrawalId')
    .exists().withMessage('withdrawalId is required')
    .isUUID().withMessage('withdrawalId must be a valid UUID'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];
