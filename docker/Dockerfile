FROM node:14

LABEL maintainer="mangoweb"

ARG MANGOVERSION=master
RUN npm install -g npm@7 && npm install -g https://github.com/manGoweb/mango-cli.git#$MANGOVERSION

# Optional development test step
# RUN (cd /usr/local/lib/node_modules/mango-cli && npm install-test)

RUN mkdir /src
WORKDIR /src

ENTRYPOINT ["mango"]
CMD ["build"]
