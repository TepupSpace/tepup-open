# Local, production-like image for testing (`docker compose up --build`, see compose.yaml).
# Vercel does not use it. The app is built when the container starts, because the
# statically generated pages read the database, which only exists once compose is up.
FROM node:22-slim

# OpenSSL for Prisma; CA certificates for outbound HTTPS (Groq, if a key is set).
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencies first, so code changes don't reinstall them. `postinstall` runs
# `prisma generate`, which needs the schema and config.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 3000
CMD ["node", "docker/entrypoint.mjs"]
