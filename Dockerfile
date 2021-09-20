FROM node:10.19.0

WORKDIR /usr/src/cht-error-processing

COPY package*.json ./

RUN npm install

COPY . .

FROM alpine

COPY --from=library/docker:latest /usr/local/bin/docker /usr/bin/docker
COPY --from=docker/compose:latest /usr/local/bin/docker-compose /usr/bin/docker-compose

RUN docker-compose up

CMD [ "node", "index.js" ]