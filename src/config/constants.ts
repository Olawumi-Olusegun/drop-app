import dotenv from "dotenv";

export const USER_ROLES = ["rider", "driver", "admin"];

if(process.env.NODE_ENV !== "production") {
    const configFile = `./../.env.${process.env.NODE_ENV}`;
    dotenv.config({ path: configFile });
}else {
    dotenv.config();
}


const CONSTANTS = {
    USER_ROLES,
    MONGO_URI: process.env.MONGO_URI || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "",
    DATABASE_PROVIDER: process.env.DATABASE_PROVIDER || "",
    PORT: process.env.DATABASE_PROVIDER || "",
    JWT_SECRET: process.env.DATABASE_PROVIDER || "",
    JWT_ACCESS_TOKEN_SECRET: process.env.DATABASE_PROVIDER || "",
    JWT_REFRESH_TOKEN_SECRET: process.env.DATABASE_PROVIDER || "",
    EXPRESS_SESSION_SECRET: process.env.DATABASE_PROVIDER || "",
    EMAIL_HOST: process.env.DATABASE_PROVIDER || "",
    EMAIL_PORT: process.env.DATABASE_PROVIDER || "",
    EMAIL_USER: process.env.DATABASE_PROVIDER || "",
    EMAIL_PASS: process.env.DATABASE_PROVIDER || "",
    POSTMARK_SERVER_TOKEN: process.env.DATABASE_PROVIDER || "",
    DROP_INNOVATION_EMAIL: process.env.DATABASE_PROVIDER || "",
    DATABASE_URL: process.env.DATABASE_PROVIDER || "",
    KUDISMS_API_URL: process.env.DATABASE_PROVIDER || "",
    KUDISMS_USERNAME: process.env.DATABASE_PROVIDER || "",
    KUDISMS_API_KEY: process.env.DATABASE_PROVIDER || "",
    KUDISMS_SENDER_ID: process.env.DATABASE_PROVIDER || "",
    AWS_S3_BUCKET_NAME: process.env.DATABASE_PROVIDER || "",
    AWS_ACCESS_KEY_ID: process.env.DATABASE_PROVIDER || "",
    AWS_SECRET_ACCESS_KEY: process.env.DATABASE_PROVIDER || "",
    AWS_S3_BUCKET_REGION: process.env.DATABASE_PROVIDER || "",
    COMMISION_RATE:0.085
}

export default CONSTANTS;
