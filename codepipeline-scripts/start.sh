cd /home/ubuntu/meet-api
$(aws ecr get-login --region ap-northeast-2 --no-include-email)
docker-compose build --no-cache
docker-compose up -d