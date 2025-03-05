import { body, validationResult, query, param } from 'express-validator';
import { Request, Response, NextFunction, } from 'express';


const allowedVerificationTypes = ['NIN', 'Passport', 'IdCard'];

export const validateDriverRegistration = [
  body('userId').isUUID().withMessage('userId must be a valid UUID'),
  body('verificationType')
    .isIn(allowedVerificationTypes)
    .withMessage(`verificationType must be one of ${allowedVerificationTypes.join(', ')}`),
  body('firstName').notEmpty().withMessage('firstName is required'),
  body('middleName').notEmpty().withMessage('middleName is required'),
  body('lastName').notEmpty().withMessage('lastName is required'),
  body('nationality').notEmpty().withMessage('nationality is required'),
  body('dateOfBirth').isISO8601().withMessage('dateOfBirth must be a valid ISO8601 date'),
  body('address').notEmpty().withMessage('address is required'),
  body('city').notEmpty().withMessage('city is required'),
  body('postalCode').notEmpty().withMessage('postalCode is required'),
  body('country').notEmpty().withMessage('country is required'),
  body('issuingCountry').notEmpty().withMessage('issuingCountry is required'),
  body('documentType').notEmpty().withMessage('documentType is required'),
  body('nin').optional().isString().withMessage('nin must be a string'),
  body('licenseNumber').notEmpty().withMessage('licenseNumber is required'),
  body('licenseExpiryDate')
    .isISO8601()
    .withMessage('licenseExpiryDate must be a valid ISO8601 date'),
  body('carBrand').notEmpty().withMessage('carBrand is required'),
  body('carModel').notEmpty().withMessage('carModel is required'),
  body('licensePlateNumber').notEmpty().withMessage('licensePlateNumber is required'),
  body('carColour').notEmpty().withMessage('carColour is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateUpdateDriverDocuments = [
  body('driverId').isUUID().withMessage('driverId must be a valid UUID'),

  body('documents').exists().withMessage('documents object is required'),

  body('documents.licensePhotoUrl')
    .isURL()
    .withMessage('licensePhotoUrl must be a valid URL'),
  body('documents.selfieWithLicenseUrl')
    .isURL()
    .withMessage('selfieWithLicenseUrl must be a valid URL'),
  body('documents.carPictureUrl')
    .isURL()
    .withMessage('carPictureUrl must be a valid URL'),
  body('documents.vehicleRegistration')
    .isURL()
    .withMessage('vehicleRegistration must be a valid URL'),

  body('documents.passportPhotoUrl').optional().isURL().withMessage('passportPhotoUrl must be a valid URL'),
  body('documents.idCardFrontUrl').optional().isURL().withMessage('idCardFrontUrl must be a valid URL'),
  body('documents.idCardBackUrl').optional().isURL().withMessage('idCardBackUrl must be a valid URL'),
  body('documents.roadWorthiness').optional().isURL().withMessage('roadWorthiness must be a valid URL'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateDriverDashboard = [
  query('driverId')
    .exists().withMessage('driverId is required')
    .isUUID().withMessage('driverId must be a valid UUID'),
  query('date')
    .optional()
    .isISO8601().withMessage('date must be a valid ISO8601 date'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
export const validateAvailableRides = [
  query('driverLatitude')
    .exists().withMessage('driverLatitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('driverLatitude must be a valid latitude'),
  query('driverLongitude')
    .exists().withMessage('driverLongitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('driverLongitude must be a valid longitude'),
  query('maxDistance')
    .optional()
    .isNumeric().withMessage('maxDistance must be a number'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];


export const validateRideIdParam = [
  param('rideId')
    .exists().withMessage('rideId is required')
    .isUUID().withMessage('rideId must be a valid UUID'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];
export const validateGetUserDetails = [
  param('userId')
    .exists().withMessage('userId is required')
    .isUUID().withMessage('userId must be a valid UUID'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];
export const validateAcceptRide = [
  param('rideId')
    .exists().withMessage('rideId is required')
    .isUUID().withMessage('rideId must be a valid UUID'),
  body('driverId')
    .exists().withMessage('driverId is required')
    .isUUID().withMessage('driverId must be a valid UUID'),
  body('proposedPrice')
    .optional()
    .isNumeric().withMessage('proposedPrice must be a number'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];
export const validateCancelBid = [
  param('rideId')
    .exists().withMessage('rideId is required')
    .isUUID().withMessage('rideId must be a valid UUID'),
  body('driverId')
    .exists().withMessage('driverId is required')
    .isUUID().withMessage('driverId must be a valid UUID'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateNotifyArrival = [
  param('rideId')
    .exists().withMessage('rideId is required')
    .isUUID().withMessage('rideId must be a valid UUID'),
  body('driverId')
    .exists().withMessage('driverId is required')
    .isUUID().withMessage('driverId must be a valid UUID'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];


export const validateStartRide = [
  param('rideId')
    .exists().withMessage('rideId is required')
    .isUUID().withMessage('rideId must be a valid UUID'),
  body('driverId')
    .exists().withMessage('driverId is required')
    .isUUID().withMessage('driverId must be a valid UUID'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateCompleteRide = [
  param('rideId')
    .exists().withMessage('rideId is required')
    .isUUID().withMessage('rideId must be a valid UUID'),
  body('driverId')
    .exists().withMessage('driverId is required')
    .isUUID().withMessage('driverId must be a valid UUID'),
  body('finalFare')
    .exists().withMessage('finalFare is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateRateUser = [
  param('userId')
    .exists().withMessage('userId is required')
    .isUUID().withMessage('userId must be a valid UUID'),
  body('driverId')
    .exists().withMessage('driverId is required')
    .isUUID().withMessage('driverId must be a valid UUID'),
  body('rating')
    .exists().withMessage('rating is required')
    .isFloat({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString().withMessage('comment must be a string'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export const validateDriverRideHistory = [
  query('driverId')
    .exists().withMessage('driverId is required')
    .isUUID().withMessage('driverId must be a valid UUID'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page must be an integer greater than or equal to 1'),
  query('limit')
    .optional()
    .isInt({ min: 1 }).withMessage('limit must be an integer greater than or equal to 1'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];