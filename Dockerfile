FROM node:20.20.2-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG APP_VARIANT=production
RUN if [ "$APP_VARIANT" = "demo" ]; then npm run build:demo && cp -r dist/turismo-demo-v2/browser /output && cp nginx.conf /selected-nginx.conf; else npm run build:production && cp -r dist/turismo-app/browser /output && cp nginx.production.conf /selected-nginx.conf; fi
FROM nginx:stable-alpine
COPY --from=build /selected-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /output /usr/share/nginx/html
EXPOSE 80
