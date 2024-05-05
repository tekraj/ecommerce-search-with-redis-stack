FROM node:18-alpine AS base


FROM base AS builder
RUN apk add  libc6-compat
RUN apk update

WORKDIR /app
RUN npm i -g turbo
COPY . .
RUN turbo prune --scope=@ecommerce/server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add  libc6-compat
RUN apk update
RUN npm i -g pnpm@9.0.6
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app


COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm turbo run build --scope=@ecommerce/server--include-dependencies --no-deps


FROM base AS runner
WORKDIR /app


RUN addgroup --system --gid 1001 node
RUN adduser --system --uid 1001 node
USER node
COPY --from=installer /app .

CMD ["node", "/app/apps/server/dist/server.js"]
