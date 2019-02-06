FROM node:alpine

WORKDIR /opt/overwatch-api
COPY package.json /opt/overwatch-api/package.json
RUN npm install && npm install -g pm2
COPY . /opt/overwatch-api
EXPOSE 3000

CMD ["pm2-runtime", "npm run docs"]