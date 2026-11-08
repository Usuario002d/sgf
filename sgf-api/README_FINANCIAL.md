##### *****************************************************
# 2.2. - Modulo do Plano e Financeiro
#    i. Descricao:
#       É o primeiro modulo desenvolvido no projecto e define a estrutura e logica dos requisitos não        #       funcional segurnçà e acessos dos utilizadores.
#    ii. Modelo de dados
#       ![O modelo de dados e relacionamento pode ser encontrado na imagem](resources/modolo_seguranca.png)
#   iii. Funcionalidades esperadas neste modulo
#      1. Carga ou lancamento inicial do plano financeiro (Efectua-se o lancamento inicial)
#      2. 
#      3.
#      4.
#      5.
#   v. Serviços:
#      
##### *****************************************************

# 2.v. Serviços disponibilizados pela API para o Modulo de plano de contas

# 2.v.1 - Planos de conta - Criação e pesquisas
 # i. Criar plano de contas financeiro (createAccountPlan)
 O atributo "writable" diz se a conta é de movimento ou controle [ moviment, controll ]
 O atributo "type" diz se a conta é de orcamento ou financeira [ budject, financial ]
 O atributo "class" diz se a classe da conta:
        [A = 'A'] //'X'
        [B = 'B'], //'XX'
        [C = 'C'], //'XXX'
        [D = 'D'], //'XXXX' 

curl -s --location 'http://localhost:3333/sgf-api/planbudject/accountplan/createAccountPlan' \
--header 'Content-Type: application/json' \
--data ' {
        "number": "1111",
        "description": "Vencimento Base do Pessoal Civil Fora do Quadro11",
        "writable": "moviment",
        "type": "budject",
        "class": "D"
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
# i. Criar o plano do orcamento de um ano especifico (createAccountPlanBudject)
curl -s --location 'http://localhost:3333/sgf-api/planbudject/createAccountPlanBudject' \
--header 'Content-Type: application/json' \
--data ' {
        "year": "2024",
        "description": "Plano de orçamento do ano 2024"
    }' | jq

# ii. Lista o plano do orcamento de um ano especifico (findAllAccountPlanBudject)
curl --location --request POST 'http://localhost:3333/sgf-api/planbudject/findAllAccountPlanBudject' | jq 

# iii. Lista o plano do orcamento de um ano especifico (findAccountPlanBudjectByYear/year)
curl --location --request POST 'http://localhost:3333/sgf-api/planbudject/findAccountPlanBudjectByYear/2024' | jq 

# iii. Criar a entrada do orçamento do plano de conta especifico (createAccountPlanBudjectEntry)
  O atributo "startPostingMonth" representa o mês inicial esperado para o inicio dos lançamentos
  O atributo "endPostingMonth" representa o mês fim esperado para o inicio dos lançamentos
  O atributo "initialAllocation" representa a dotação inicial

curl -s --location 'http://localhost:3333/sgf-api/planbudject/createAccountPlanBudjectEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "startPostingMonth": 1,
        "endPostingMonth": 12,
        "initialAllocation": 1200000,
        "accountPlanNumber": "1.1.1.1.02"
    }' |jq

# iv. Listar todos as entradas do plano orçamental do ano corrente (findAccountPlanBudjectEntriesByYear/year)
curl -s --location --request POST 'http://localhost:3333/sgf-api/planbudject/findAccountPlanBudjectEntriesByYear/2024' | jq

# v. Listar todos as entradas do plano orçamental com as respectivas operções (fetchAccountPlanBudjectEntriesByYear/year)
curl -s --location --request POST 'http://localhost:3333/sgf-api/planbudject/fetchAccountPlanBudjectEntriesByYear/2024' | jq

# vi. Busca a entrada do plano orçamental com as respectivas operções pelo ano e numero da conta (fetchAccountPlanBudjectEntriesByYearAndNumber/year/accountPlanNumber)
curl -s --location --request POST 'http://localhost:3333/sgf-api/planbudject/fetchAccountPlanBudjectEntriesByYearAndNumber/2024/1.0.0.0.00' |jq

# 2.v.1.1 - Planos de conta - Actualização a dotação do plano de contas (reforço, anulação, redistribuição reforço, redistribuição anulação)
 # i. reforço da dotação (reinforceAccountPlanBudjectEntry)
  Parametros do body: 
        "accountPlanNumber" O numero/codigo da conta do plano de conta
        "value" O valor do reforço

curl --location 'http://localhost:3333/sgf-api/planbudject/reinforceAccountPlanBudjectEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "accountPlanNumber": "1.0.0.0.00",
        "value": 100
    }'

 # ii. Anulação da dotação (annulAccountPlanBudjectEntry)
  Parametros do body: 
        "accountPlanNumber" O numero/codigo da conta do plano de conta
        "value" O valor do reforço

curl --location 'http://localhost:3333/sgf-api/planbudject/annulAccountPlanBudjectEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "accountPlanNumber": "1.0.0.0.00",
        "value": 100
    }'

 # iii. redistribuição reforço (redistribuitioReinforcimentAccountPlanBudjectEntry)
   Parametros do body: 
        "originAccountPlanNumber" O numero/codigo da conta do plano de conta origem
        "targetAccountPlanNumber" O numero/codigo da conta do plano de conta destino
        "value" O valor do reforço
 
 curl --location 'http://localhost:3333/sgf-api/planbudject/redistribuitioReinforcimentAccountPlanBudjectEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "originAccountPlanNumber": "1.2.2.0.003",
        "targetAccountPlanNumber": "1.6.1.0.002",
        "value": 100
    }'

 # v. redistribuição anulação (redistributeAnnulmentAccountPlanBudjectEntry)
 Parametros do body: 
        "originAccountPlanNumber" O numero/codigo da conta do plano de conta origem
        "targetAccountPlanNumber" O numero/codigo da conta do plano de conta destino
        "value" O valor do reforço
 
curl --location 'http://localhost:3333/sgf-api/planbudject/redistributeAnnulmentAccountPlanBudjectEntry' \
--header 'Content-Type: application/json' \
--data ' {
        "originAccountPlanNumber": "1.1.1.1.01",
        "targetAccountPlanNumber": "1.1.1.1.02",
        "value": 6000
    }'