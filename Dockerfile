FROM node:alpine

EXPOSE 5000/tcp

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "./dist/server/index.js"]