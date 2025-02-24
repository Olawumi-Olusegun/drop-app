
import { PrismaClient } from "@prisma/client";

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
      data: { onlineStatus: "online", role: "driver", latitude: 6.6059, longitude: 3.3490 }
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
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
