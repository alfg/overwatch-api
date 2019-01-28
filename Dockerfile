FROM node:alpine

WORKDIR /opt/overwatch-api
COPY package.json /opt/overwatch-api/package.json
RUN npm install
COPY . /opt/overwatch-api
EXPOSE 3000

CMD ["npm", "start"]