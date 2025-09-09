FROM node:22-alpine AS builder

WORKDIR /app
# package*.json ./
COPY . ./ 

RUN npm ci

EXPOSE 3333

CMD ["node","src/server.ts"]

