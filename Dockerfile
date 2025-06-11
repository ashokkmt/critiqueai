# Step 1: Build the React app
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .

# Accept secret at build time
ARG VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY

RUN npm run build

# Step 2: Serve with NGINX
FROM nginx:stable-alpine

# Remove default NGINX config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf



# Copy the React build output to NGINX's web directory
COPY --from=build /app/dist /usr/share/nginx/html

# Set the port expected by Cloud Run
ENV PORT=8080
EXPOSE 8080

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]