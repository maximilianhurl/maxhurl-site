FROM node:14-alpine as base

RUN apk add --no-cache nginx

WORKDIR /app
ADD . /app

# ensure nginx PID dir exists
RUN mkdir -p /run/nginx
ADD nginx.conf /etc/nginx/conf.d/default.conf

RUN npm i && npm run build && rm -rf node_modules

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM base as test
COPY . /app/
RUN npm i && npm run validate && npm run lint