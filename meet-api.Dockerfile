
# before getting image
# $(aws ecr get-login --region ap-northeast-2 --no-include-email)
# docker build -f meet-api:Dockerfile . -t 325498511266.dkr.ecr.ap-northeast-2.amazonaws.com/meet-api
# ECR 경로는 325498511266.dkr.ecr.ap-northeast-2.amazonaws.com/meet-api:[latest | versions]
FROM 325498511266.dkr.ecr.ap-northeast-2.amazonaws.com/meet-api:base-node
COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]