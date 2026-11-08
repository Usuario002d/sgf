# *********************************************************************************************
# 2.1 - Modulo de Segurança
#    i. Descrição:
#       É o primeiro modulo desenvolvido no projecto e define a estrutura e logica dos 
#        requisitos não funcionais segurnçà e acessos dos utilizadores.
#    ii. Modelo de dados
#        ![O modelo de dados e relacionamento pode ser encontrado na imagem](resources/modulo_seguranca.png)
#    iii. Funçionalidades:
#         1. Login e Logout
#         2. Registrar utilizador
#         3. Recuperar senha
#         4. Altarar senha
#    iv.  Configurar o modulo
#    v.   Serviços disponibilizados: 
## *******************************************************************************************

# iv - Configurar o modulo de segurança
1. Step 1: Criação do projecto API com auth tipo tokens
npm init adonisjs@latest sgf-api -- --kit=api --auth-guard=access_tokens --db=mysql

2. Step 2: Commitar o projecto no repositorio gitlab
cd sgf-api
git remote add origin https://gitlab.com/sebadora/sgf/sgf-api.git
git branch -M developer
git push -uf origin developer

# v. Serviços
1. Step1: Autenticação com token

curl --location 'http://localhost:3333/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
"email":"root@gmail.com",
"password":"sebadora123"
}'

2. Logout
2. Criação do utilizador
3. Listar utilizadores
4. Altarar senha
4. Recuperar senha