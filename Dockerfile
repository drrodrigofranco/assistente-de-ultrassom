# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install all dependencies (including devDependencies) to compile typescript files
RUN npm install --no-audit --no-fund

# Copy the rest of the application files
COPY . .

# Run the production build.
# This compiles the React frontend to /dist, and bundles server.ts into /dist/server.cjs
RUN npm run build


# Stage 2: Create tiny production runner image
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment variable
ENV NODE_ENV=production

# Copy package files to install only production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production --no-audit --no-fund

# Copy the compiled output folder from our build stage
COPY --from=builder /app/dist ./dist

# Expose port (Cloud Run automatically injects $PORT at runtime, but fallback/default is 3000)
EXPOSE 3000

# Start the application via standard Node.js on port 3000/PORT
CMD ["npm", "start"]
