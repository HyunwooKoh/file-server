FROM node:14.20.0-alpine

ENV NODE_ENV=production

WORKDIR /src/

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci

COPY ./src/ ./src/

CMD [ "npm", "start" ]
