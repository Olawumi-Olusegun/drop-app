FROM node:lts-alpine

WORKDIR /app

# Copy package.json and package-lock.json before installing dependencies
COPY package.json package-lock.json ./

# Install dependencies (including TypeScript if it's in package.json)
RUN npm install

# Ensure TypeScript is installed globally
RUN npm install -g typescript

# Copy all files AFTER installing dependencies
COPY . .

# Verify that TypeScript is installed (optional debugging step)
RUN npx tsc --version

# Build TypeScript files
RUN npm run build

# Expose the application port
EXPOSE 5150

# Start the application
CMD ["npm", "run", "start"]
