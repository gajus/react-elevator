FROM node:7.7

WORKDIR /srv

ENV PATH="./node_modules/.bin:${PATH}" NPM_CONFIG_LOGLEVEL="warn" NPM_CONFIG_DEPTH=0 DEBUG="applaudience:*"

RUN \
  apt-get update &&\
  apt-get install libelf1

COPY package.json .

RUN npm install

COPY . /srv

CMD NODE_ENV=production node ./src/bin/index.js

EXPOSE 8000
