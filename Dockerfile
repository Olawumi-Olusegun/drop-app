# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json current directory ./
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm ci

# Copy Prisma schema and .env file
COPY ./prisma/schema.prisma ./prisma/schema.prisma
#COPY .env ./

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build TypeScript application
RUN npx tsc

# Expose application port
EXPOSE 5150

# Start application: Migrate prisma first before running the application
CMD ["npm", "run", "start"]
