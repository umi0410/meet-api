cd /home/ubuntu/meet-api
cp /home/ubuntu/meet-api-env/ /home/ubuntu/meet-api/
$(aws ecr get-login --region ap-northeast-2 --no-include-email)
docker-compose up -d