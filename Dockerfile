# Stage 1: Build Backend (sgf-api)
FROM node:20-alpine AS api-builder
WORKDIR /api
COPY sgf-api/package*.json ./
RUN npm install --legacy-peer-deps
COPY sgf-api/ ./
RUN node ace build --ignore-ts-errors

# Stage 2: Unified Production Server (API + Pre-built Frontend SPA)
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333
ENV LOG_LEVEL=info
ENV APP_KEY=z8F7xK2mP9qR4vW1nL6jB3yT5cH0dG8s
COPY --from=api-builder /api/build ./
COPY sgf-web/build ./public
COPY sgf-api/database/init_db.mjs ./init_db.mjs
COPY sgf-api/database/sgf_2026_estruturado.sql ./sgf_2026_estruturado.sql
RUN npm install --omit=dev --legacy-peer-deps
EXPOSE 3333
CMD ["sh", "-c", "node init_db.mjs && node bin/server.js"]
