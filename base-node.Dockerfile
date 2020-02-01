FROM node:13
# 325498511266.dkr.ecr.ap-northeast-2.amazonaws.com/meet-api:base-node 로 푸시하기
COPY package.json /app/package.json
WORKDIR /app
RUN npm install
# CMD ["node"]