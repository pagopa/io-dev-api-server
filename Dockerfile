FROM node:18.20-alpine

WORKDIR /usr/src/app

COPY ./ ./

EXPOSE 3000

RUN yarn install

