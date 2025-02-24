# Stage 1: Build Stage
FROM node:20 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Run the unified build process
RUN npm run build

# Stage 2: Production Stage
FROM node:20-slim

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built backend
COPY --from=builder /app/.local/express/dist ./.local/express/dist

# Copy built frontend
COPY --from=builder /app/.local/vite/dist ./dist

# Copy package files for runtime dependency installation
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Expose the port your app listens on
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]
