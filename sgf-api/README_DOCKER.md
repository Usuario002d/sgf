# ******************************************************
#  Instruccoes para a configuracao da aplicacao no ambiente docker
# ******************************************************

# 1. Requisitos tecnologicos
1. Docker
2. Imagens docker (node, mysql)
    i. node:18.20.4-alpine (docker pull node:18.20.4-alpine )
    ii. mysql:latest (docker pull mysql:latest )

# 1.1 Configurar a rede no docker
i. Criar a rede para a comunicacao entre as aplicacoes no docer
  #create cedsif network if not exists
    $ docker network create dev-network

  #Listar as rede exeistente 
    $ docker network ls

  #Verifica containeres na mesma rede
    $ docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Networks}}\t{{.State}}\t{{.CreatedAt}}"

# 1.2 Configurar a base de dados - Mysql no Docker
i. Puxar a imagem do mysql
$ docker pull mysql:latest
$ docker images

ii. Limpar imagens sem tags
$ docker rmi -f $(docker images --filter dangling=true -q 2>/dev/null) 2>/dev/null

ii. Subir o container da base de dados com nome (mysql-instance)
  Nota: Primeiro deve indicar o caminho correcto do do volume
  /Users/gautchi/Git/gchambe-git-projects/iniciativas/sgf/sgf-api

  $ docker run -d \
  --name mysql-container-1 \
  -e MYSQL_ROOT_PASSWORD=dev123 \
  -v /Users/gautchi/Git/gchambe-git-projects/iniciativas/sgf/sgf-api/resources/mysql/volume:/var/lib/mysql \
  --hostname WORKSTATION \
  --net dev-network \
  -p 3306:3306 \
  mysql:latest

iii. Entrar no container e executar os scripts de criacao do utilizaro ou usar um client da Base de dados.
    i. Step 1: Entrar no container
       $ docker ps
       $ docker exec -it <container_name_or_id> sh
       EX: docker exec -it mysql-instance sh
       EX2: docker exec -it mysql-container mysql -u root -p

     ii. Se estiver usando o Docker use o seguinte comando para importar;
       cd /resources/mysql/script/sgf_ddl
       $ docker exec -i meu_conteiner_mysql mysql -u usuario_destino -p nome_da_base < sgf.sql
       $ docker exec -i mysql-container-1 mysql -u sgfuser -p sgf < sgf_ddl.sql
    
    ii. Step 2: Log in to MySQL
      $ mysql -u root -p

    iii. Step 2.1 list database users
      $ SELECT User FROM mysql.user;

    iv. Step 3: Create a New Database
      $ CREATE DATABASE sgf;

    iv. Step 4: Create a New User
      $ DROP USER IF EXISTS sgfuser;
      $ CREATE USER 'sgfuser'@'%' IDENTIFIED BY 'sgf123';

    v. Step 5: Grant Privileges to the New User
      $ GRANT ALL PRIVILEGES ON sgf.* TO 'sgfuser'@'%';

    vi. Step 6: Apply Privileges
      $ FLUSH PRIVILEGES;

    vii. Step 7: Exit MySQL
      $ exit;

    viii. Step 8: Test new MySQL user
      $ mysql -u sgfuser -p

      ix. Step 9: List databases
        $ show databases;

      x. Step 9: List tables
       $ use sgf;
       $ show tables sgf;

# 1.2 Configurar o deploy do pacote no docker
  i. Puxar a imagem do node versao 18
    $ docker pull node:18.20.4-alpine
    $ docker images

  ii. Build do pacote
    $ cd sgf-api
    $ npm install 
    $ node ace build
    $ docker build --tag sgf-api .  

  ii. Limpar imagens sem tags
    $ docker rmi -f $(docker images --filter dangling=true -q 2>/dev/null) 2>/dev/null


  iii. Execucao do container
     $ docker stop sgf-api-conatiner-1
     $ docker rm sgf-api-conatiner-1
     $ docker run  -d \
      --name sgf-api-conatiner-1 \
      --hostname WORKSTATION \
      --net dev-network \
      -p 3333:3333 \
      sgf-api:latest

  iii.a. Execucao do container e entrar na imagem
    $ docker run -it --net dev-network --name sgf-api-conatiner-1 --entrypoint sh sgf-api:latest

  iv. Validacao da aplicacao
    #Verifica containeres na mesma rede
    $ docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Networks}}\t{{.Ports}}\t{{.State}}\t{{.CreatedAt}}"    
  
    #Verifica saude da aplicacao
     

# 1.6 Como testar a API no Postman
No postman: File -> import -> https://winter-firefly-631772.postman.co/workspace/Sebadora~ce3a5692-37f9-49a8-92d4-9b04f8413c88/   collection/7769307-449d78d4-cb3f-455c-80d7-30d9198fe4a6?action=share&creator=7769307