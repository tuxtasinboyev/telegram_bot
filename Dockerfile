FROM node:22-alpine

WORKDIR /app

# 1. Install dependencies
COPY package*.json ./
RUN npm install

# 2. Copy project files
COPY . .

# 3. Prisma generate and migrate
RUN npx prisma generate
RUN npx prisma migrate deploy

# 4. Build NestJS
RUN npm run build

# 5. App runs on port 3000
EXPOSE 3000

# 6. Start the bot
CMD ["node", "dist/main"]
