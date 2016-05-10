FROM node:4


RUN npm install -g bower node-gyp sails  -qq 

RUN groupadd -r node \
    &&	useradd -r -m -g node node

ADD . /usr/src/app
RUN chown -R node:node /usr/src/app
USER node
WORKDIR /usr/src/app
RUN npm install -q
RUN cp -a node_modules_override/kaltura node_modules/
ENV PORT 1337  
ENV MONGO_HOST mongo
ENV MONGO_PORT 27107
CMD [ "sails", "lift" ]
EXPOSE 1337
