FROM node:lts-slim
WORKDIR /simplifyqa-cli
COPY . .
RUN npm i -g
RUN mkdir /simplifyqa-cli/logs
