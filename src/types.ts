//import { verificationType } from "@prisma/client";
import { Request } from "express";
import passport from 'passport';

export interface AuthRequest extends Request {
  user: {
    userId: string;
    driverId?: string
    role: string;
    googleId?: string;
  };
}


  export enum UserRole {
    RIDER = "rider",
    DRIVER = "driver",
    ADMIN = "admin",
  }

export type VerificationType = 'NIN' | 'Passport' | 'IdCard'
export interface DriverRegistrationInput {
  userId: string;
  verificationType: VerificationType


  firstName: string;
  middleName: string;
  lastName: string;
  nationality: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  issuingCountry: string;
  documentType: string;
  nin?: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  carBrand: string;
  carModel: string;
  licensePlateNumber: string;
  carColour: string;
}

export interface DocumentUploadPayload {
  driverId: string;
  documents: {
    passportPhotoUrl?: string;
    idCardFrontUrl?: string;
    idCardBackUrl?: string;
    licensePhotoUrl: string;
    selfieWithLicenseUrl: string;
    carPictureUrl: string;
    vehicleRegistration: string;
    roadWorthiness?: string;


  }
}