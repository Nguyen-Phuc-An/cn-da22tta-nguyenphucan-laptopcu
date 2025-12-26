FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-optional --prefer-offline || \
    npm install --legacy-peer-deps --no-optional

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
