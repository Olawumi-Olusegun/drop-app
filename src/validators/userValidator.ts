import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateSaveCardDetails = [
  body('userId')
    .exists().withMessage('userId is required')
    .isUUID().withMessage('userId must be a valid UUID'),
  body('reference')
  .exists().withMessage('reference is required')
  .isString().withMessage('refernce must be a string'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];