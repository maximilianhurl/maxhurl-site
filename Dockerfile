FROM node:18-alpine as base

WORKDIR /app
ADD . /app

ENV PORT=80
ENV ORIGIN=https://www.maxhurl.co.uk

RUN npm i && npm run build && rm -rf node_modules

EXPOSE 80

CMD ["node", "build"]
