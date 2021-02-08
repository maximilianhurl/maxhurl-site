FROM node:14-alpine

RUN apk add --no-cache nginx

WORKDIR /app
ADD . /app

# ensure nginx PID dir exists
RUN mkdir -p /run/nginx
ADD nginx.conf /etc/nginx/conf.d/default.conf

RUN npm i && npm run build && rm -rf node_modules

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]