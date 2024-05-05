FROM node:18-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json .
RUN npm install -g turbo@latest
COPY . .

# ----------------------
# Stage: Installer
# ----------------------
FROM base AS installer


RUN npm install -g pnpm@latest
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
COPY . .
COPY .gitignore .gitignore
RUN pnpm install

# ----------------------
# Stage: Builder
# ----------------------
FROM installer AS builder
# Build the project and its dependencies
RUN pnpm turbo run build --scope=@ecommerce/server --include-dependencies --no-deps
RUN pnpm db:generate
# ----------------------
# Stage: Runner
# ----------------------
FROM base AS runner


RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs
USER nodejs
WORKDIR /app
COPY --from=installer /app .
CMD ["node", "/app/apps/server/dist/index.js"]
