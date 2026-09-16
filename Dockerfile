# Production Dockerfile for Codebase Doctor
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Generate Prisma Client & Build TypeScript
RUN npm run prisma:push
RUN npm run build

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy built dist folders & production packages
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

# Install git for repo cloning
RUN apk add --no-cache git

USER node

EXPOSE 5000

CMD ["npm", "start", "--prefix", "server"]
