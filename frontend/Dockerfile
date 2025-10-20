# Multi-stage build for Docker deployment
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html/

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy node_modules if needed
COPY --from=builder /app/node_modules /usr/share/nginx/html/node_modules

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
