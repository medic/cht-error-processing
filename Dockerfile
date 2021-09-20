FROM node:10.19.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV COUCHURL= \
    doclimit=100 \
    changeslimit=1000\
    deployment= \
    fromSeq=now

EXPOSE 8200

EXPOSE 9200

CMD [ "node", "index.js", $COUCHURL, "--doclimit" + $doclimit, "--changeslimit" + $changeslimit, "--deployment" + $deployment, "--fromSeq" + $fromseq ]