# Backend Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
# Copy only manifest to leverage Docker layer cache
COPY package.json ./
# Install all deps without requiring a lockfile (since repo lacks pnpm-lock.yaml)
RUN corepack enable && pnpm install --no-frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
# Bring installed node_modules
COPY --from=deps /app/node_modules ./node_modules
# Copy source (including prisma schema)
COPY . .
# Generate Prisma client and build the app
RUN corepack enable \
 && pnpm prisma generate \
 && pnpm build \
 && pnpm prune --prod

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy production node_modules and built artifacts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./package.json
# Start the server
CMD ["node", "dist/index.js"]
