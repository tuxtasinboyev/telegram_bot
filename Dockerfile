FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npx prisma migrate deploy

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
