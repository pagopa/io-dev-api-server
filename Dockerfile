FROM node:12.4.0-alpine

WORKDIR /usr/src/app

COPY ./ ./

EXPOSE 3000

RUN yarn install

CMD [ "sh", "-c", "yarn start"]

