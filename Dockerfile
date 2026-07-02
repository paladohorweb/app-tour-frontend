# ==========================================
# Etapa 1: compilación de Angular
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build


# ==========================================
# Etapa 2: servidor Nginx ligero
# ==========================================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/turismo-app/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/health || exit 1
