FROM node:lts-alpine AS deps
LABEL authors="OpenHealth"

RUN apk add -U graphicsmagick

WORKDIR /app

COPY package.json prisma/ .

RUN npm install

FROM deps AS builder
COPY . .
RUN npm run build

FROM builder AS runtime
RUN adduser --disabled-password ohuser && chown -R ohuser .
USER ohuser
EXPOSE 3000
ENTRYPOINT ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && npm start"]

FROM deps AS test
COPY . .
RUN npx prisma generate
ENV NODE_ENV=test
CMD ["npm","run","test:coverage"]