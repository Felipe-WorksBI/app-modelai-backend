FROM node:22-alpine AS builder

WORKDIR /app
# package*.json ./
COPY . ./ 

RUN npm ci

# compilar TS → JS
RUN npm run build

EXPOSE 3333

CMD ["npm","start"]

