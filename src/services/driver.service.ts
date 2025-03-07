import {
  BidStatus,
  PrismaClient,
  RegistrationStatus,
  Ride,
  RideBid,
  RideStatus,
  UserRating,
  verificationType,
} from "@prisma/client";
import { DocumentUploadPayload, DriverRegistrationInput } from "../types";
import { generatePresignedUrl } from "../utils/s3";
import { Response } from "express";
import haversine from "haversine-distance";
const prisma = new PrismaClient();

export const getAvailableDrivers = async (
  riderId: string,
  maxDistance: number = 10,
  unit: string = "km"
) => {
  try {
    // Fetch the rider's location
    const rider = await prisma.user.findUnique({
      where: { id: riderId },
      select: { latitude: true, longitude: true },
    });

    // Validate rider and coordinates
    if (!rider || rider.latitude === null || rider.longitude === null) {
      throw new Error("Rider location is required.");
    }

    const { latitude, longitude } = rider;

    await prisma.user.update({
      where: { id: "f1032fc2-8ad4-403b-9b3a-cdfdfd426a90" },
      data: {
        onlineStatus: "online",
        role: "driver",
        latitude: 6.6059,
        longitude: 3.349,
      },
    });

    // Fetch drivers who are online and have valid coordinates
    const drivers = await prisma.user.findMany({
      where: {
        role: "driver",
        onlineStatus: "online",
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        latitude: true,
        longitude: true,
      },
    });

    // Calculate distances and filter drivers within range
    const availableDrivers = drivers
      .map((driver) => {
        const distance = haversineDistance(
          { lat: latitude, lon: longitude },
          { lat: driver.latitude!, lon: driver.longitude! },
          unit
        );

        return { ...driver, distance };
      })
      .filter((driver) => driver.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance); // Sort by nearest first

    return availableDrivers;
  } catch (error) {
    console.error("Error in getAvailableDrivers:", error);
    throw error;
  }
};

// Haversine formula to calculate distance between two coordinates
const haversineDistance = (
  coord1: { lat: number; lon: number },
  coord2: { lat: number; lon: number },
  unit: string = "km"
) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = unit === "km" ? 6371 : 3958.8; // Earth's radius in km or miles
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
    Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
export const registerDriver = async (data: DriverRegistrationInput) => {
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


  const passportPhotoKey = `drivers/${driver.id}/passportPhoto.jpg`;
  const idCardFrontKey = `drivers/${driver.id}/idCardFront.jpg`;
  const idCardBackKey = `drivers/${driver.id}/idCardBack.jpg`;
  const licensePhotoKey = `drivers/${driver.id}/licensePhoto.jpg`;
  const selfieWithLicenseKey = `drivers/${driver.id}/selfieWithLicense.jpg`;
  const carPictureKey = `drivers/${driver.id}/carPicture.jpg`;
  const vehicleRegistrationKey = `drivers/${driver.id}/vehicleRegistration.jpg`;
  const roadWorthinessKey = `drivers/${driver.id}/roadWorthiness.jpg`;

  const [
    passPortPhotoUrl,
    idCardFrontUrl,
    idCardBackUrl,
    licensePhotoUrl,
    selfieWithLicenseUrl,
    carPictureUrl,
    vehicleRegistrationUrl,
    roadWorthinessUrl,
  ] = await Promise.all([
    generatePresignedUrl(passportPhotoKey),
    generatePresignedUrl(idCardFrontKey),
    generatePresignedUrl(idCardBackKey),
    generatePresignedUrl(licensePhotoKey),
    generatePresignedUrl(selfieWithLicenseKey),
    generatePresignedUrl(carPictureKey),
    generatePresignedUrl(vehicleRegistrationKey),
    generatePresignedUrl(roadWorthinessKey),
  ]);

  const preSignedUrls = {
    passPortPhotoUrl,
    idCardFrontUrl,
    idCardBackUrl,
    licensePhotoUrl,
    selfieWithLicenseUrl,
    carPictureUrl,
    vehicleRegistrationUrl,
    roadWorthinessUrl,
  };

  return { driver, preSignedUrls };
};

export const updateDriverDocuments = async (payload: DocumentUploadPayload) => {
  const { driverId, documents } = payload;

  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) {
    throw new Error("Driver not Found");
  }

  await prisma.driverIdentification.update({
    where: { driverId },
    data: {
      passportPhotoUrl: documents.passportPhotoUrl
        ? documents.passportPhotoUrl
        : undefined,
      idCardFrontUrl: documents.idCardFrontUrl
        ? documents.idCardFrontUrl
        : undefined,
      idCardBackUrl: documents.idCardBackUrl
        ? documents.idCardBackUrl
        : undefined,
      licensePhotoUrl: documents.licensePhotoUrl,
      selfieWithLicenseUrl: documents.selfieWithLicenseUrl,
    },
  });

  await prisma.driverVehicle.update({
    where: { driverId },
    data: {
      carPictureUrl: documents.carPictureUrl,
      roadWorthiness: documents.roadWorthiness,
    },
  });
  return { message: "Documents updated successfully" };
};

export const getDriverDashboard = async (driverId: string, date?: string) => {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });
  if (!driver) {
    throw new Error("Driver not found");
  }
  const targetDate = date ? new Date(date) : new Date();

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const rides = await prisma.ride.findMany({
    where: {
      driverId,
      status: RideStatus.completed,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const totalEarnings = rides.reduce(
    (sum, ride) => sum + (ride.finalFare || 0),
    0
  );
  const totalRides = rides.length;
  return { totalEarnings, totalRides };
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

export const getAvailableRides = async (
  driverLat: number,
  driverLng: number,
  maxDistance: number
): Promise<any[]> => {
  const { minLat, maxLat, minLng, maxLng } = getBoundingBox(
    driverLat,
    driverLng,
    maxDistance
  );
  const rides = await prisma.ride.findMany({
    where: {
      status: "pending",
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

  return rides;
};

export const getRideDetails = async (rideId: string): Promise<Ride | null> => {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
  });

  return ride;
};

export const getUserDetails = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }
  const now = new Date();
  const diffMs = now.getTime() - user.createdAt.getTime();
  const yearsUsingApp = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
  return { ...user, yearsUsingApp };
};

export const acceptRide = async (
  rideId: string,
  driverId: string,
  proposedPrice?: number
): Promise<{ ride: any; bid: any }> => {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) {
    throw new Error("Ride not Found");
  }

  if (ride.status !== RideStatus.pending) {
    throw new Error("Ride is no longer available");
  }
  const bid = await prisma.rideBid.create({
    data: {
      rideId,
      driverId,
      amount: proposedPrice !== undefined ? proposedPrice : 0,
    },
  });

  return { ride, bid };
};
export const cancelRideBid = async (
  rideId: string,
  driverId: string
): Promise<RideBid> => {
  const bid = await prisma.rideBid.findFirst({
    where: {
      rideId,
      driverId,
      status: BidStatus.pending,
    },
  });

  if (!bid) {
    throw new Error("No pending bid found for this ride and driver");
  }

  const updatedBid = await prisma.rideBid.update({
    where: { id: bid.id },
    data: {
      status: BidStatus.rejected,
    },
  });

  return updatedBid;
};

export const notifyArrival = async (
  rideId: string,
  driverId: string
): Promise<{ message: string }> => {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) {
    throw new Error("Ride not found");
  }

  return { message: "Driver arrival notified successfully" };
};

export const startRide = async (
  rideId: string,
  driverId: string
): Promise<Ride> => {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
  });
  if (!ride) {
    throw new Error("Ride not found");
  }
  if (ride.status !== RideStatus.accepted) {
    throw new Error("Ride cannot be started");
  }

  if (ride.driverId !== driverId) {
    throw new Error("Driver is not authorized to start this ride");
  }

  const updatedRide = await prisma.ride.update({
    where: { id: rideId },
    data: {
      status: RideStatus.ongoing,
    },
  });

  return updatedRide;
};

export const completeRide = async (
  rideId: string,
  driverId: string,
  finalFare: string
): Promise<Ride> => {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) {
    throw new Error("Ride not found");
  }
  if (ride.status !== RideStatus.ongoing) {
    throw new Error("Ride is not in progress");
  }

  if (ride.driverId !== driverId) {
    throw new Error("Driver is not authorized to complete this ride");
  }

  const updatedRide = await prisma.ride.update({
    where: { id: rideId },
    data: {
      finalFare: parseFloat(finalFare),
      status: RideStatus.completed,
    },
  });

  const completedRidesCount = await prisma.ride.count({
    where: {
      userId: ride.userId,
      status: RideStatus.completed,
    },
  });

  await prisma.user.update({
    where: { id: ride.userId },
    data: {
      totalCompletedRides: completedRidesCount,
    },
  });

  return updatedRide;
};

export const rateUser = async (
  userId: string,
  driverId: string,
  rating: number,
  comment?: string
): Promise<UserRating> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }
  const newRating = await prisma.userRating.create({
    data: {
      userId,
      driverId,
      rating,
      comment,
    },
  });

  const aggregation = await prisma.userRating.aggregate({
    _avg: {
      rating: true,
    },
    where: { userId },
  });

  const newAverage = aggregation._avg.rating || 0;

  await prisma.user.update({
    where: { id: userId },
    data: {
      averageRating: newAverage,
    },
  });
  return newRating;
};



export const getDriverWallet = async (driverId: string) => {
  const wallet = await prisma.driverWallet.findUnique({
    where: { driverId }
  })

  if (!wallet) {
    return await prisma.driverWallet.create({
      data: {
        driverId,
        balance: 0.0
      }
    })
  }

  return wallet;
}
export const getDriverRideHistory = async (
  driverId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  rides: Ride[];
  totalCount: number;
  page: number;
  limit: number;
}> => {
  const skip = (page - 1) * limit;

  const totalCount = await prisma.ride.count({
    where: { driverId },
  });
  const rides = await prisma.ride.findMany({
    where: { driverId },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  return { rides, totalCount, page, limit };
};
