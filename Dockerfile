# ── PersonalLearningPro Dockerfile ──
# Multi-stage build: development + production

# ────────────────────────────────────
# Stage 1: Development
# ────────────────────────────────────
FROM node:20-slim AS development

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for dev mode)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Expose the app port (Express serves both API + Vite client)
EXPOSE 5001

# Start in development mode
CMD ["npm", "run", "dev"]

# ────────────────────────────────────
# Stage 2: Build
# ────────────────────────────────────
FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ────────────────────────────────────
# Stage 3: Production
# ────────────────────────────────────
FROM node:20-slim AS production

WORKDIR /app

# Copy dependency manifests and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built artifacts from the build stage
COPY --from=build /app/dist ./dist

EXPOSE 5001

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
