FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN node ace build --ignore-ts-errors

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333
COPY --from=builder /app/build ./
RUN npm install --omit=dev --legacy-peer-deps
EXPOSE 3333
CMD ["node", "bin/server.js"]
