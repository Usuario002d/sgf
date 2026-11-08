##### *****************************************************
# 2.2. - Modulo de Plano e Orçamento
#    i. Descricao:
#       É o primeiro modulo desenvolvido no projecto e define a estrutura e logica dos requisitos não        #       funcional segurnçà e acessos dos utilizadores.
#    ii. Modelo de dados
#       ![O modelo de dados e relacionamento pode ser encontrado na imagem](resources/modolo_seguranca.png)
#   iii. Funcionalidades esperadas neste modulo
#      1.
#      2.
#      3.
#      4.
#      5.
#   v. Serviços:
#      
##### *****************************************************

# 2.v. Serviços disponibilizados pela API para o Modulo de plano de contas

# 2.v.1 - Planos de conta - Criação e pesquisas
 # i. Criar plano de contas (createAccountPlan)
 O atributo "writable" diz se a conta é de movimento ou controle [ moviment, controll ]
 O atributo "type" diz se a conta é de orcamento ou financeira [ budject, financial ]
 O atributo "class" diz se a classe da conta:
        [A = 'A'] //'X.0.0.0.00'
        [B = 'B'], //'X.X.0.0.00'
        [C = 'C'], //'X.X.X.0.00'
        [D = 'D'], //'X.X.X.X.00'
        [E = 'E'], //'X.X.X.X.XX'

curl -s --location 'http://localhost:3333/sgf-api/planbudject/accountplan/createAccountPlan' \
--header 'Content-Type: application/json' \
--data ' {
        "number": "1.1.1.1.05",
        "description": "Vencimento Base do Pessoal Civil Fora do Quadro11",
        "writable": "moviment",
        "type": "budject",
        "class": "2",
         "parentAccountPlanNumber": "1.1.1.1.00"

    }' | jq

# ii. Listar todos os planos de conta activos (findAllAccountPlan)
curl -s --location --request GET 'http://localhost:3333/sgf-api/planbudject/accountplan/findAllAccountPlan' --header 'Content-Type: application/json' | jq

# ii. Listar todos os planos de conta, tantos activos como inactivos (findAnyAccountPlan)
curl -s --location --request GET 'http://localhost:3333/sgf-api/planbudject/accountplan/findAnyAccountPlan' --header 'Content-Type: application/json' | jq

# iv. Buscar plano de conta activo pelo numero da conta (findAccountPlanByNumber/:number)
curl -s --location --request GET 'http://localhost:3333/sgf-api/planbudject/accountplan/findAccountPlanByNumber/1.1.1.1.02' --header 'Content-Type: application/json' | jq

# iv. Buscar qualquer (activo ou inactivo) plano de conta pelo numero da conta (findAnyAccountPlanByNumber/:number)
curl -s --location --request GET 'http://localhost:3333/sgf-api/planbudject/accountplan/findAccountPlanByNumber/1.1.1.1.02' --header 'Content-Type: application/json' | jq

# 2.v.1 - Orçamento do plano de contas
# i. Criar o plano do orcamento de um ano especifico (createAccountPlanYear)
curl -s --location 'http://localhost:3333/sgf-api/planbudject/createAccountPlanYear' \
--header 'Content-Type: application/json' \
--data ' {
        "year": "2024",
        "description": "Plano de orçamento do ano 2024"
    }' | jq

# ii. Lista o plano do orcamento de um ano especifico (findAllAccountPlanYear)
curl --location --request POST 'http://localhost:3333/sgf-api/planbudject/findAllAccountPlanYear' | jq 

# iii. Lista o plano do orcamento de um ano especifico (findAccountPlanYearByYear/year)
curl --location --request POST 'http://localhost:3333/sgf-api/planbudject/findAccountPlanYearByYear/2024' | jq 

# iii. Criar a entrada do orçamento do plano de conta especifico (createAccountPlanEntry)
  O atributo "startPostingMonth" representa o mês inicial esperado para o inicio dos lançamentos
  O atributo "endPostingMonth" representa o mês fim esperado para o inicio dos lançamentos
  O atributo "initialAllocation" representa a dotação inicial

curl -s --location 'http://localhost:3333/sgf-api/planbudject/initialAllocationAccountPlanEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "accountPlanNumber": "1.1.1.1.05",
        "value": 10000,
        "operationDate": "2024-10-10"
    }' 
    |jq

# iv. Listar todos as entradas do plano orçamental do ano corrente (findAccountPlanEntriesByYear/year)
curl -s --location --request POST 'http://localhost:3333/sgf-api/planbudject/findAccountPlanBudjectEntriesByYear/2024' | jq

# v. Listar todos as entradas do plano orçamental com as respectivas operções (fetchAccountPlanEntriesByYear/year)
curl -s --location --request POST 'http://localhost:3333/sgf-api/planbudject/fetchAccountPlanEntriesByYear/2024' | jq

# vi. Busca a entrada do plano orçamental com as respectivas operções pelo ano e numero da conta (fetchAccountPlanEntriesByYearAndNumber/year/accountPlanNumber)
curl -s --location --request POST 'http://localhost:3333/sgf-api/planbudject/fetchAccountPlanEntriesByYearAndNumber/2024/1.0.0.0.00' |jq

# 2.v.1.1 - Planos de conta - Actualização a dotação do plano de contas (reforço, anulação, redistribuição reforço, redistribuição anulação)
 # i. reforço da dotação (reinforceAccountPlanEntry)
  Parametros do body: 
        "accountPlanNumber" O numero/codigo da conta do plano de conta
        "value" O valor do reforço,
        "operationDate": "2024-10-10"

curl --location 'http://localhost:3333/sgf-api/planbudject/reinforceAccountPlanEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "accountPlanNumber": "1.0.0.0.00",
        "value": 100,
        "operationDate": "2024-10-10"
    }'

 # ii. Anulação da dotação (annulAccountPlanEntry)
  Parametros do body: 
        "accountPlanNumber" O numero/codigo da conta do plano de conta
        "value" O valor do reforço

curl --location 'http://localhost:3333/sgf-api/planbudject/annulAccountPlanEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "accountPlanNumber": "1.0.0.0.00",
        "value": 100,
        "operationDate": "2024-10-10"
    }'

 # iii. redistribuição reforço (redistribuitioReinforcimentAccountPlanEntry)
   Parametros do body: 
        "originAccountPlanNumber" O numero/codigo da conta do plano de conta origem
        "targetAccountPlanNumber" O numero/codigo da conta do plano de conta destino
        "value" O valor do reforço
 
 curl --location 'http://localhost:3333/sgf-api/planbudject/redistribuitioReinforcimentAccountPlanEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "originAccountPlanNumber": "1.0.0.0.00",
        "targetAccountPlanNumber": "1.0.0.0.00",
        "value": 100,
        "operationDate": "2024-10-10"
    }'

 # v. redistribuição anulação (redistributeAnnulmentAccountPlanEntry)
 Parametros do body: 
        "originAccountPlanNumber" O numero/codigo da conta do plano de conta origem
        "targetAccountPlanNumber" O numero/codigo da conta do plano de conta destino
        "value" O valor do reforço
 
curl --location 'http://localhost:3333/sgf-api/planbudject/redistributeAnnulmentAccountPlanEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "originAccountPlanNumber": "1.1.1.1.01",
        "targetAccountPlanNumber": "1.1.1.1.02",
        "value": 6000,
        "operationDate": "2024-10-10"
    }'