# ******************************************************
#  1. Arquitectura do projecto da API
# ******************************************************

# 1.1 Estrutura do projecto

# 1.2 Requisitos tecnologicos
1. Versão do node: v18.20.4
2. Gestão de dependencias com o npm (npm install)
3. Base de dados mysql
4. Para testar a API: 
      4.1. Postman: https://www.postman.com/product/what-is-postman/
      4.2. curl: https://curl.se
      4.2.1. JPS Para formatar o JSON no curl 
        On macOS: brew install jq
        On Linux: sudo apt-get install jq
         On Windows: Use a package manager like choco or manually download it.
5. AdonisJs para a criação da API: https://docs.adonisjs.com/guides/preface/introduction
6. Lucid ORM (Object-Relational Mapping) : https://lucid.adonisjs.com/docs/introduction
6. VineJs para a validação das request HTTP: https://vinejs.dev/docs/introduction

# 1.3 Como configurar e subir a aplicação
1. Criar a base de dados SGF: veja a secção: [1.5 Configurar a base de dados - Mysql]
2. Criar as tabelas e executar a carga inicial dos dados:
    i. Drop das tabelas: node ace migration:reset 
    ii. Criar as tableas e inserir na base: node ace migration:fresh --seed
    iii. Alterar o ficheiro .env e configurar a base de dados, hostname e porta do servidor
3. Instação das dependencias: npm install
4. Deploy da aplicação: node ace serve --watch
5. Listar todos os seriços disponibilizados: node ace list:routes
6. Build da API para a entrega em produção: node ace build

# 1.4 Comandos uteis
i. commando para matar todos os processos de node em execução
ps aux | grep '[n]ode' | awk '{print $2}'|xargs kill -9

ii. Formatar o codico via command line. Não é necessario se o editor estiver configurado com estas extensões
 npm run lint
 npm run lint -- --fix #Run ESLint and auto-fix issues
 npm run format

ii. Correr no ambiente de desenvolvimento (a flag --hmr ou --watch permite monitorar os recursos)
node ace serve --hmr
node ace serve --watch

iii. Ver os serviços disponibilizados 
node ace list:routes

iv. Links e comandos para a criação de entidades, serviços, controladores, validadores, rotas etc: 
criação das entidades: Model => ( https://lucid.adonisjs.com/docs/models )
criação de controlladores: Controller => (https://docs.adonisjs.com/guides/basics/controllers)
criação de serviços: Services => ()
criação de objectos da base de dados: migrations => (https://lucid.adonisjs.com/docs/migrations)
criação inserção automatica objectos da base de dados: seeder => (https://lucid.adonisjs.com/docs/seeders)
criação de seederes para a insercao dos dados na BD seeder => (https://v5-docs.adonisjs.com/guides/database/seeders)
       
node ace make:model user
node ace make:controller user
node ace make:migreation user
node ace make:seeder MainSeeder/index
node ace make:seeder user
node ace migration:run
node ace migration:reset
node ace migration:fresh --seed
node ace make:model user --cm

# 1.5 Configurar a base de dados - Mysql
i. Step 1: Log in to MySQL
 $ mysql -u root -p

ii. Step1.1 list database users
$ SELECT User FROM mysql.user;

ii. Step 2: Create a New Database
 $ CREATE DATABASE sgf;

iii. Step 3: Create a New User
$ DROP USER IF EXISTS sgfuser;

$ CREATE USER 'sgfuser'@'%' IDENTIFIED BY 'sgf123';

iv. Step 4: Grant Privileges to the New User
 $ GRANT ALL PRIVILEGES ON sgf.* TO 'sgfuser'@'%';

v. Step 5: Apply Privileges
 $ FLUSH PRIVILEGES;

vi. Step 6: Exit MySQL
EXIT;

vii. Step 7: Test new MySQL user
 $ mysql -u sgfuser -p -h localhost

viii. Step 8: List tables
 $ show tables;

# 1.6 Como testar a API no Postman
No postman: File -> import -> https://winter-firefly-631772.postman.co/workspace/Sebadora~ce3a5692-37f9-49a8-92d4-9b04f8413c88/   collection/7769307-449d78d4-cb3f-455c-80d7-30d9198fe4a6?action=share&creator=7769307