# Stage 1: Build Stage
FROM node:20 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Run the build script to compile both frontend and backend
RUN npm run build

# Stage 2: Production Stage
FROM node:20-slim

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built artifacts (both backend and frontend) from the builder stage
COPY --from=builder /app/.local ./.local
# If you need your source files for runtime (e.g., views, etc.), copy them too:
# COPY --from=builder /app/src ./src

# Copy package files for runtime dependency installation
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Expose the port your app listens on
EXPOSE 5000

# Start the application (this calls "node ./.local/express/dist/api.js" per your start script)
CMD ["npm", "start"]
