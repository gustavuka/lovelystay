# Use Node.js 20 LTS as the base image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (if needed)
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ] 
