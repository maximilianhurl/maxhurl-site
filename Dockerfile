FROM node:18-alpine as base

WORKDIR /app
ADD . /app

RUN npm i && npm run build && rm -rf node_modules && npm i --production

EXPOSE 80

CMD ["npm", "run", "start"]

FROM base as test
COPY . /app/
RUN npm i && npm run validate && npm run lint