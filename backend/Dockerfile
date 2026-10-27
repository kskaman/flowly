# Build context is the repo root (see docker-compose.yaml) so the shared workspace package is available.
FROM node:22-slim

WORKDIR /app

# Install OpenSSL for Prisma's native engines
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy workspace manifests first so the dependency layer is cached
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY packages/shared/package.json packages/shared/

# Install backend + shared dependencies (dev ones are needed for the build and the Prisma CLI)
RUN npm ci -w backend -w @flowly/shared

COPY packages/shared packages/shared
COPY backend backend

WORKDIR /app/backend

# Generate the Prisma client inside the container
RUN npx prisma generate

# Compile TypeScript to dist/
RUN npm run build

# Expose the port
EXPOSE 3000

RUN chmod +x docker-entrypoint.sh


ENV NODE_ENV=development

ENTRYPOINT ["./docker-entrypoint.sh"]

# Start the app
CMD ["node", "./dist/index.js"]