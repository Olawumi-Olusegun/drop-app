import { config } from "dotenv";

// Load the correct environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === "development" ? ".env.development" : ".env";
config({ path: envFile });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
