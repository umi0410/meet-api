## Meeting app API server 기술 스택

* nodejs express, Socket.io , MongoDB, Socket.io 를 통한 API server

* AWS PipeLine(CodeBuild, CodeDeploy)를 통한 배포 자동화

* Docker, docker-compose, ECR을 통한 편리한 배포

  

## CodePipeLine, Docker 설정 - 20200202

#### Workflow

`docker-compose`를 통해 `express`와 `mongo` container 이용.

대개 필요한 `node_modules`는 `ECR`의 `meet-api:base-node` 태그 이미지에 저장해두었음.

이후에 변경사항은 `docker-compose`에서 바로 `meet-api.Dockerfile`을 통해 build 해서 run 시킨다.



CodePipeLine에선 CodeBuild와 CodeDeploy를 이용한다.

CodeBuild는 사실상 github 소스 자체(node_modules 제외)를 CodeDeploy에게 넘겨주는 역할일 뿐이고, CodeDeploy에서 넘겨받은 파일을 바탕으로 docker-compose.yml의 build에서 docker image를 빌드한 뒤 바로 docker-compose up -d를 통해 deploy한다.

이 때 CodeDeploy 를 통해 EC2가 IAM Role로 ECR에 접근하는 것이 아니라, aws cli를 통해 직접 ECR에 로그인하기 때문에, IAM User가 ECR에 대한 접근 권한이 있어야한다. (ubuntu user마다 aws configure가 달라질 수 있음을 주의할 것)

#### Advantages?

결과적으로 `CodePipeLine`과 `docker-compose`를 이용함으로써 `github repository`의 `master branch`로 푸시하기만 하면 `EC2`에 `docker-compose down을 실행시킴으로써 원래 서버 작업을 중단시키고 새로 이미지를 빌드한 뒤 `docker-compose up -d` 를 수행하는 작업 모두가 자동화 되었다.