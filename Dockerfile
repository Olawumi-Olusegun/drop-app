FROM node:lts-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5150

CMD [ "npm", "run", "start" ]