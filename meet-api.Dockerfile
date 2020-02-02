
# before getting image
# $(aws ecr get-login --region ap-northeast-2 --no-include-email)
# docker build -f meet-api:Dockerfile . -t 325498511266.dkr.ecr.ap-northeast-2.amazonaws.com/meet-api
# ECR 경로는 325498511266.dkr.ecr.ap-northeast-2.amazonaws.com/meet-api:[latest | versions]
FROM 325498511266.dkr.ecr.ap-northeast-2.amazonaws.com/meet-api:base-node
COPY . /app
WORKDIR /app
RUN npm install

# https://github.com/ufoscout/docker-compose-wait
# mongo container가 시작뿐만 아니라 서비스가 정상화되기를 기다려줌.
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

# docker compose에서 environment로 기다릴 호스트 명명
CMD "/wait && npm start"