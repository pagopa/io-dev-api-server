FROM node:16.19.0-alpine@sha256:1621ddffc775ccf10dc8710660e70d5bfb8e4ee349b926f133698e6512144b73

WORKDIR /usr/src/app

COPY ./ ./

EXPOSE 3000

RUN yarn install --production

CMD [ "sh", "-c", "sh configure.sh && yarn start"]

