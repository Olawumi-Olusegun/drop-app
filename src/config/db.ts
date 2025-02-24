import { config } from "dotenv";

// Load the correct environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === "development" ? ".env.development" : ".env";
config({ path: envFile });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    console.error("Prisma connection error:", error);
    setTimeout(connectDB, 5000); // Retry connection
  }
};

connectDB();

export default prisma;

