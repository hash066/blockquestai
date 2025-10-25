FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

USER 1000

CMD ["node", "sequencer.js"]
