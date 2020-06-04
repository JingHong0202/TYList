FROM node:12-alpine

COPY . /TYList/
WORKDIR /TYList

RUN npm install --production

EXPOSE 7001

CMD ["npm","start"]