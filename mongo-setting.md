굳이 docker-compose로 express와 mongo를 엮을 필요는 없을 지 몰라도 CodePipeLine의 CodeDeploy에서 한 번에 down 시켰다가 up 시킬 수 있도록 하려고 그냥 mongodb도 묶어서 이용해본다.
좋은 경험이 될 것도 같고.
docker-compose로 express container와 mongo container를 묶기 때문에 굳이 port binding은 하지 않아도 된다.
mongo container는 stop 되면 바로 --rm 옵션에 의해 삭제된다.
DB인 만큼 data가 삭제되면 골치아프므로 \$HOME/mongodata의 하부에 데이터를 저장한다.

## how to run the container soley

docker run --rm --name mongo-server -v \$HOME/mongodata:/data/db mongo

\_근데 docker-compose로 쓰는 게 나을 것임.
