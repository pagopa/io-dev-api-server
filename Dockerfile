FROM node:lts

WORKDIR /usr/src/app

COPY ./ ./

EXPOSE 3000

RUN yarn install --production

CMD [ "sh", "-c", "sh configure.sh && yarn start"]

