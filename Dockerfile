# Use Node.js with Alpine for a lightweight image
FROM node:lts-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire source code
COPY . .

# Build the TypeScript files
RUN npm run build

# Expose the application port
EXPOSE 5150

# Run the compiled JavaScript file
CMD ["node", "build/index.js"]
