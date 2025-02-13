# ----------------------------------------------------
# Stage 1: Frontend Builder
# ----------------------------------------------------
FROM node:20 AS frontend-builder

WORKDIR /app/frontend

# 1. Copy just the package files and install all deps
COPY seed-planner-client/package*.json ./
RUN npm ci

# 2. Copy the actual frontend source
COPY seed-planner-client/ ./

# 3. Build the frontend. We call Vite via node so we skip file permission drama
RUN node ./node_modules/vite/bin/vite.js build


# ----------------------------------------------------
# Stage 2: Backend and Final Image
# ----------------------------------------------------
FROM node:20-slim

WORKDIR /app/backend

# 1. Copy backend package files
COPY seed-planner-api/package*.json ./

# 2. Install only runtime dependencies to keep final image small
RUN npm ci --omit=dev
# or if you're on older npm versions (< v9), do: RUN npm ci --production

# 3. Copy backend source
COPY seed-planner-api/ ./

# 4. Copy the compiled frontend from the builder stage into /public
COPY --from=frontend-builder /app/frontend/dist ./public

# 5. Set the exposed port and run
EXPOSE 3000
CMD ["node", "server.js"]
