import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';


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
