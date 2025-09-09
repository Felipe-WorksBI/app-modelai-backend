# FROM node:22-alpine AS builder

# WORKDIR /app
# # package*.json ./
# COPY . ./ 

# RUN npm ci

# # compilar TS → JS
# RUN npm run build

# EXPOSE 3333

# CMD ["npm","start"]

FROM node:22-alpine AS builder

WORKDIR /app

# Copiar só os manifests primeiro (cache das deps)
COPY package*.json ./

RUN npm ci

# Copiar o resto do código
COPY . ./

# Compilar TS → JS
RUN npm run build

# -------- imagem final --------
FROM node:22-alpine AS runner

WORKDIR /app

# Copiar só o necessário da build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3333

CMD ["npm", "start"]
