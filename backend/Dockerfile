FROM node:20-alpine

WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install --legacy-peer-deps --prefer-offline

# Copy app code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
