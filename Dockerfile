FROM arm32v7/node:alpine

ENV USER=
ENV PASSWORD=
ENV DOMAIN=
ENV PERIOD=

WORKDIR /bridge
COPY ./src ./src
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm ci --loglevel warn

EXPOSE 8080

CMD ["npm","start"]