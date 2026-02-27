# ── PersonalLearningPro Dockerfile ──
# Multi-stage build optimized for:
# - Fast rebuilds (layer caching)
# - Small-ish production image
# - Non-root runtime
# - Separate dev target for docker-compose

# ------------------------------------------------------------
# Stage 1: deps (install once, reused by build/dev)
# ------------------------------------------------------------
FROM node:20-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ------------------------------------------------------------
# Stage 2: development (hot reload)
# ------------------------------------------------------------
FROM node:20-slim AS development
WORKDIR /app

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5001
CMD ["npm", "run", "dev"]

# ------------------------------------------------------------
# Stage 3: build (vite + server bundle)
# ------------------------------------------------------------
FROM node:20-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ------------------------------------------------------------
# Stage 4: production runtime
# ------------------------------------------------------------
FROM node:20-slim AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Install only production dependencies (separate from build cache)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
  && npm cache clean --force

# Copy built artifacts
COPY --from=build /app/dist ./dist

# Ensure uploads dir exists (server serves /public/uploads)
RUN mkdir -p public/uploads \
  && chown -R node:node /app

USER node

EXPOSE 5001

CMD ["node", "dist/index.js"]
