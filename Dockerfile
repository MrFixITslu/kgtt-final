# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build the React application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom Nginx configuration to handle SPA routing and listen on port 3070
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build assets to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3070
EXPOSE 3070

CMD ["nginx", "-g", "daemon off;"]
