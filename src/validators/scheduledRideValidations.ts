import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction, } from 'express';

export const validatescheduleRide = [
    body("riderId").isString(),
    body("pickupLocation").isString(),
    body("pickupLatitude").isFloat(),
    body("pickupLongitude").isFloat(),
    body("dropoffLocation").isString(),
    body("dropoffLatitude").isFloat(),
    body("dropoffLongitude").isFloat(),
    body("userTimezone").isString(),
    body("scheduledDateTime").isISO8601(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];



export const validatescheduleRideBid = [
    param("scheduledRideId").isString(), 
    body("driverId").isString(), 
    body("amount").isFloat(),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    },
];

export const validatesCancelRide = [
    param("rideId").isString(),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    },
];