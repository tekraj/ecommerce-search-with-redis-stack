FROM node:18-alpine AS development
WORKDIR /app
COPY ./server/package*.json ./
RUN  npm install
COPY ./server .
EXPOSE 5000
CMD ["npm", "start"]

FROM node:18-alpine AS production
WORKDIR /app
COPY ./server/package*.json ./
RUN npm ci --only=production
COPY ./server/. .
RUN npm run build
EXPOSE 5000
CMD ["node", "./dist/index.js"]
