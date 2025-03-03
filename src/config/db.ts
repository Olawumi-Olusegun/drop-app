import { config } from "dotenv";

// Load the correct environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === "development" ? ".env.development" : ".env";
config({ path: envFile });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Connection retry logic
let retryCount = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
    try {
      await prisma.$connect();
      console.log("Database connected successfully.");
    } catch (error) {
      console.error("Prisma connection error:", error);
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
        setTimeout(connectDB, 5000); // Retry after 5 seconds
      } else {
        console.error("Maximum retry attempts reached. Exiting...");
        process.exit(1); // Exit the process if retries are exhausted
      }
    }
  };


  // Graceful shutdown
const shutdown = async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  };
  
  // Handle process termination signals
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown)

connectDB();

export default prisma;

