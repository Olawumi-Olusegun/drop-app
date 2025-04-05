import {  DriverType, RegistrationStatus } from "@prisma/client";
import prisma from "../../../config/db";
import { CourierDriverRegistrationInput, DocumentUploadPayload, DriverRegistrationInput } from "../../../types";



export const registerCourierDriver = async (data:CourierDriverRegistrationInput) => {
  // Ensure dateOfBirth is in full ISO format.
  const dateOfBirthISO = data.dateOfBirth.includes("T")
    ? data.dateOfBirth
    : data.dateOfBirth + "T00:00:00Z";

  // Ensure the user exists.
  const userExists = await prisma.user.findUnique({
    where: { id: data.userId },
  });
  if (!userExists) {
    throw new Error("User does not exist");
  }

  // Check if a driver already exists for this user.
  const existingDriver = await prisma.driver.findUnique({
    where: { userId: data.userId },
  });
  
  if (existingDriver) {
   
    throw new Error("Driver already exists");
  }


  const driver = await prisma.$transaction(async (tx) => {

    const createdDriver = await tx.driver.create({
      data: {
        userId: data.userId,
        driverType: DriverType.courier,
        transportType: data.transportType,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        nationality: data.nationality,
        dateOfBirth: new Date(dateOfBirthISO),
        fullAddress: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        totalCompletedRides: 0,
        registrationStatus: RegistrationStatus.pending,
        registrationDate: new Date(),
      },
    });


    await tx.driverIdentification.create({
      data: {
        driverId: createdDriver.id,
        issuingCountry: data.issuingCountry,
        documentType: data.verificationType,
        nin: data.nin,
        passportPhotoUrl: "",
        idCardFrontUrl: "",
        idCardBackUrl: "",
        licenseNumber: data.licenseNumber,
        licenseExpiryDate: data.licenseExpiryDate,
        licensePhotoUrl: "",
        selfieWithLicenseUrl: "",
      },
    });


    await tx.driverVehicle.create({
      data: {
        driverId: createdDriver.id,
        carBrand: data.carBrand,
        carModel: data.carModel,
        licensePlateNumber: data.licensePlateNumber,
        carColor: data.carColour,
        carPictureUrl: "",
        vehicleRegistration: "",
        roadWorthiness: "",
      },
    });

    return createdDriver;
  });

  return { driver };

}
export const updateCourierDriverDocuments = async (payload: DocumentUploadPayload) => {
  const { driverId, documents } = payload;
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw new Error("Driver not found");
  }


  await prisma.$transaction(async (tx) => {

    await tx.driver.update({
      where: {id: driverId},
      data: {profileImage: documents.profileImage}
    })
    await tx.driverIdentification.update({
      where: { driverId },
      data: {
        passportPhotoUrl: documents.passportPhotoUrl || undefined,
        idCardFrontUrl: documents.idCardFrontUrl || undefined,
        idCardBackUrl: documents.idCardBackUrl || undefined,
        licensePhotoUrl: documents.licensePhotoUrl,
        selfieWithLicenseUrl: documents.selfieWithLicenseUrl,
      },
    });

    await tx.driverVehicle.update({
      where: { driverId },
      data: {
        carPictureUrl: documents.carPictureUrl,
        roadWorthiness: documents.roadWorthiness,
      },
    });
  });

  return { message: "Documents updated successfully" };
};
const getBoundingBox = (lat: number, lng: number, radius: number) => {
  const earthRadius = 6371;
  const deltaLat = (radius / earthRadius) * (180 / Math.PI);
  const deltaLng =
    ((radius / earthRadius) * (180 / Math.PI)) /
    Math.cos((lat * Math.PI) / 180);

  return {
    minLat: lat - deltaLat,
    maxLat: lat + deltaLat,
    minLng: lng - deltaLng,
    maxLng: lng + deltaLng,
  };
};

export const getAvailableCourier = async (
  driverLat: number,
  driverLng: number,
  maxDistance: number
): Promise<any[]> => {
  const { minLat, maxLat, minLng, maxLng } = getBoundingBox(
    driverLat,
    driverLng,
    maxDistance
  );
  const courier = await prisma.courierService.findMany({
    where: {
      //status: "pending",
      pickupLatitude: {
        gte: minLat,
        lte: maxLat,
      },
      pickupLongitude: {
        gte: minLng,
        lte: maxLng,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return courier;
};