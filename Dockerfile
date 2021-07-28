FROM node:14.17.0
WORKDIR /App
RUN  npm install -g truffle
COPY . .
CMD  truffle test