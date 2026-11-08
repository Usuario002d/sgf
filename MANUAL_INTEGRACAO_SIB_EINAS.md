# Manual de Integração SIB / E-INAS
## Guia Prático dos Endpoints: `sync`, `importVerificationRecords` e `importBeneficiaries`

> **Documento de Referência Técnica & Interoperabilidade**  
> **Ambiente:** UAT (`https://sgb-uat.rsig.gov.mz/services/api/v1.0`)  
> **Autenticação:** HTTP Basic Auth (`sib_integrator:sib_einas_2026`)

---

### Resumo Comparativo: Qual endpoint utilizar?

| Critério | `sync` | `importVerificationRecords` | `importBeneficiaries` |
| :--- | :--- | :--- | :--- |
| **Objectivo Principal** | Importação rápida de beneficiários com dados essenciais. | Registo do inquérito socioeconómico completo do agregado. | Registo do inquérito completo **E** inscrição como beneficiário activo. |
| **Volume de Dados** | **Leve / Simplificado** (só identificação e pagamento). | **Completo / Detalhado** (habitação, bens, membros, papéis). | **Completo + Programa** (Ficha + Grupo-Alvo + Conta/PSP). |
| **Regista Ficha Social?** | ❌ Não (só cria registo de importação e beneficiário). | ✅ **Sim** (Ficha de Verificação com todos os indicadores). | ✅ **Sim** (Ficha de Verificação com todos os indicadores). |
| **Cria Beneficiário Activo?** | ✅ **Sim** (fica pronto para receber pagamento). | ❌ Não (fica apenas registado o agregado familiar). | ✅ **Sim** (fica imediatamente na folha de pagamentos). |
| **Tipo de Processamento** | Síncrono em lote (Batch). | Assíncrono em fila (JMS + staging). | Assíncrono em fila (JMS + staging). |
| **Cenário Típico de Uso** | Migrações rápidas, listas pré-existentes, emergências. | Censo e diagnóstico de campo (famílias ainda não aprovadas). | Admissão oficial e expansão directa de programas (ex: PSSB). |

---

## 1. Autenticação e Configuração Base

Todos os endpoints utilizam **Basic Authentication**:
* **URL Base (UAT):** `https://sgb-uat.rsig.gov.mz/services/api/v1.0`
* **Utilizador:** `sib_integrator`
* **Password:** `sib_einas_2026`
* **Header de Autorização:** `Authorization: Basic c2liX2ludGVncmF0b3I6c2liX2VpbmFzXzIwMjY=`
* **Content-Type:** `application/json`

---

## 2. Endpoint: `sync` (Dados Simplificados de Beneficiários)

### Quando usar?
Use este endpoint quando **já tem a lista de beneficiários aprovados** e quer apenas registá-los ou actualizá-los no E-INAS com o mínimo de dados necessários para pagamento (sem preencher o questionário de habitação).

### Método e Rota
`POST /services/api/v1.0/sync`

### Exemplo de Comando `curl`
```bash
curl -k --location 'https://sgb-uat.rsig.gov.mz/services/api/v1.0/sync' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic c2liX2ludGVncmF0b3I6c2liX2VpbmFzXzIwMjY=' \
--data '{
    "organicClassifierCode": "62L000241",
    "socialProgramCode": "PSSB",
    "beneficiaries": [
        {
            "householdCode": "0301AF0000001",
            "name": "João",
            "lastName": "Muchanga",
            "birthDate": "1980-05-20",
            "gender": "M",
            "memberNumber": 4,
            "neighborhoodOrVillageCode": "03010101V01",
            "targetGroupCode": "020",
            "accountNumber": "841234567",
            "paymentServiceProviderNuit": "400123456"
        }
    ]
}'
```

### Estrutura Completa dos Dados do Beneficiário Simplificado

O payload do beneficiário no `/sync` contempla os **13 campos** padrão:

| Nº | Campo no JSON | Nome no Negócio / Ficha | Tipo | Obrigatório? | Observação |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | `neighborhoodOrVillageCode` | COD. BAIRRO/POVOACAO | String | **Sim** | Código do Bairro/Povoação (deve existir activo na tabela `TERRITORIAL_CLASSIFIER`). |
| 2 | `householdCode` | CODIGO AF | String | **Sim** | Código único do Agregado Familiar (deve já existir no sistema). |
| 3 | `name` | NOMES | String | **Sim** | Primeiro nome / nomes do beneficiário principal. |
| 4 | `lastName` | APELIDO | String | **Sim** | Apelido do beneficiário principal. |
| 5 | `birthDate` | DATA NASCIMENTO | String | **Sim** | Formato `DD/MM/YYYY` ou `YYYY-MM-DD`. |
| 6 | `gender` | GENERO | String | **Sim** | `M` (Masculino) ou `F` (Feminino). |
| 7 | `memberNumber` | NUMERO DE MEMBROS | Integer | **Sim** | Total de membros do agregado familiar (ex: `4`). |
| 8 | `socialProgram` | PROGRAMA | String | Opcional | Sigla do Programa (ex: `PSSB`). Se omitido ou vazio, herda `socialProgramCode` da raiz. |
| 9 | `replacementReceiverName` | NOME DO RECEPTOR SUBSTITUTO | String | Opcional | Nome do receptor substituto (pode ir `""` se não houver). |
| 10 | `replacementReceiverLastName` | APELIDO DO RECEPTOR SUBSTITUTO | String | Opcional | Apelido do receptor substituto (pode ir `""` se não houver). |
| 11 | `targetGroupCode` | GRUPO ALVO | String | **Sim** | Código do Grupo Alvo activo (ex: `003`, `020`). |
| 12 | `paymentServiceProviderNuit` | NUIT DO PROVEDOR | String | Condicional | NUIT do prestador de pagamento móvel/bancário. |
| 13 | `accountNumber` | NUMERO DE CONTA | String | Condicional | Número de conta ou telemóvel associado ao provedor. |

> **Regra Importante para Pagamento Electrónico vs. Numerário:**  
> **Não é necessário remover campos do JSON!** A estrutura mantém sempre todos os campos:
> * **Se o pagamento for em Numerário (dinheiro físico / caixa):** mantêm-se os campos `paymentServiceProviderNuit: ""` e `accountNumber: ""` com valor vazio ou `null`.
> * **Se o pagamento for Electrónico (carteira móvel / banco):** se preencher `accountNumber`, é **obrigatório** indicar `paymentServiceProviderNuit`, e vice-versa.

---

## 3. Endpoint: `importVerificationRecords` (Apenas Ficha de Verificação)

### Quando usar?
Use este endpoint quando os técnicos de campo recolheram os dados socioeconómicos das famílias (inquérito domiciliário), mas **estas famílias ainda não foram aprovadas para receber subsídio**. O E-INAS guardará toda a composição familiar, habitação e bens, mas **não as activará como beneficiárias**.

### Método e Rota
`POST /services/api/v1.0/importVerificationRecords`

### Exemplo de Comando `curl`
```bash
curl -k --location 'https://sgb-uat.rsig.gov.mz/services/api/v1.0/importVerificationRecords' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic c2liX2ludGVncmF0b3I6c2liX2VpbmFzXzIwMjY=' \
--data '{
    "verificationRecords": [
        {
            "organicClassifier": "62L000241",
            "fillDate": "2026-03-11",
            "startTime": "08:00",
            "endTime": "09:30",
            "supervisor": "0301TECN00001",
            "socialPrograms": "PSSB",
            "household": {
                "householdCode": "0301AF0000001",
                "territoryCode": "03010101V01",
                "habitation": {
                    "mainWaterSource": "D2a",
                    "mainWallMaterial": "D3a",
                    "mainRoofingMaterial": "D4d",
                    "mainFloorMaterial": "D5c",
                    "typeOfLatrine": "D6a",
                    "lightSource": "D8a",
                    "housingTypeCode": "D9a",
                    "numberOfRooms": 3,
                    "hasElectricity": "Sim"
                },
                "householdProperties": [
                    { "code": "D10a" },
                    { "code": "D10g", "bovineCattle": "Sim" }
                ],
                "members": [
                    {
                        "memberNumber": "1",
                        "name": "João",
                        "lastName": "Muchanga",
                        "documentNumber": "123456789A",
                        "documentType": "BI",
                        "validateDate": "2030-05-20",
                        "birthDayDate": "1980-05-20",
                        "gender": "M",
                        "maritialStatus": "Casado",
                        "academicLevel": "Primário",
                        "profession": "Agricultor",
                        "nationality": "Moçambicana",
                        "disability": "Nenhuma",
                        "chronicDisease": "Nenhuma",
                        "isMainReceiver": true,
                        "isReplacementReceiver": false,
                        "isRespondent": true
                    },
                    {
                        "memberNumber": "2",
                        "name": "Ana",
                        "lastName": "Muchanga",
                        "documentNumber": "",
                        "documentType": "",
                        "validateDate": "",
                        "birthDayDate": "2010-08-15",
                        "gender": "F",
                        "maritialStatus": "Solteiro",
                        "academicLevel": "Primário",
                        "profession": "Estudante",
                        "nationality": "Moçambicana",
                        "disability": "Nenhuma",
                        "chronicDisease": "Nenhuma",
                        "isMainReceiver": false,
                        "isReplacementReceiver": false,
                        "isRespondent": false
                    }
                ],
                "replacementReceiver": {
                    "name": "Maria",
                    "lastName": "Muchanga",
                    "documentNumber": "555666777M",
                    "documentType": "BI",
                    "birthDayDate": "1982-02-10",
                    "gender": "F",
                    "maritialStatus": "Casado"
                }
            }
        }
    ]
}'
```

### Explicação dos Blocos:
* `habitation`: Indicadores de pobreza multidimensional (água, paredes, tecto, piso, latrina, luz).
* `members`: Lista de todas as pessoas que moram na casa. O membro número `1` deve ter `isMainReceiver = true`.
* `replacementReceiver`: Pessoa de confiança designada para receber o subsídio se o titular estiver impedido.

### Resposta de Sucesso (`200 OK`)
```json
{
    "statusCode": "200",
    "message": "Registos recebidos e colocados na fila de processamento com sucesso.",
    "totalReceived": 1,
    "totalQueued": 1
}
```

---

## 4. Endpoint: `importBeneficiaries` (Ficha Completa + Cadastro de Beneficiário)

### Quando usar?
Use este endpoint quando você tem o **inquérito socioeconómico completo** e o agregado **já foi formalmente aprovado para começar a receber o subsídio**.
Este endpoint une o poder da Ficha de Verificação (inquérito) com a activação imediata do Beneficiário na folha de pagamento.

### Método e Rota
`POST /services/api/v1.0/importBeneficiaries`

### Exemplo de Comando `curl`
```bash
curl -k --location 'https://sgb-uat.rsig.gov.mz/services/api/v1.0/importBeneficiaries' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic c2liX2ludGVncmF0b3I6c2liX2VpbmFzXzIwMjY=' \
--data '{
    "beneficiaryRecords": [
        {
            "organicClassifier": "62L000241",
            "fillDate": "2026-03-11",
            "startTime": "09:00",
            "endTime": "10:10",
            "supervisor": "0301TECN00001",
            "socialPrograms": "PSSB",
            "targetGroupCode": "020",
            "paymentServiceProviderNuit": "400123456",
            "accountNumber": "841234567",
            "household": {
                "householdCode": "0301AF0000005",
                "territoryCode": "03010101V05",
                "habitation": {
                    "mainWaterSource": "D2a",
                    "mainWallMaterial": "D3a",
                    "mainRoofingMaterial": "D4d",
                    "mainFloorMaterial": "D5c",
                    "typeOfLatrine": "D6a",
                    "lightSource": "D8a",
                    "housingTypeCode": "D9a",
                    "numberOfRooms": 3,
                    "hasElectricity": "Sim"
                },
                "members": [
                    {
                        "memberNumber": "1",
                        "name": "Fernando",
                        "lastName": "Macuacua",
                        "documentNumber": "999888777F",
                        "documentType": "BI",
                        "validateDate": "2030-01-01",
                        "birthDayDate": "1978-04-14",
                        "gender": "M",
                        "maritialStatus": "Casado",
                        "academicLevel": "Primário",
                        "profession": "Agricultor",
                        "nationality": "Moçambicana",
                        "disability": "Nenhuma",
                        "chronicDisease": "Nenhuma",
                        "isMainReceiver": true,
                        "isReplacementReceiver": true,
                        "isRespondent": true
                    }
                ]
            }
        }
    ]
}'
```

### Diferenciais em relação ao `importVerificationRecords`:
* `targetGroupCode` *(Obrigatório)*: Define a categoria de vulnerabilidade no programa (ex: `020`).
* `paymentServiceProviderNuit` & `accountNumber` *(Opcionais / Condicionais)*: Pagamento electrónico (móvel/banco) vs. Numerário no posto.

### Resposta de Sucesso (`200 OK`)
```json
{
    "statusCode": "200",
    "message": "Beneficiários recebidos e colocados na fila de processamento com sucesso.",
    "totalReceived": 1,
    "totalQueued": 1
}
```

---

## 5. Fluxo de Decisão Rápido

```
                                  Precisa importar dados para o E-INAS?
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
        Tem os dados do inquérito                                      NÃO tem os dados do inquérito 
       completo de habitação e bens?                                     (apenas dados de pagamento)?
                   │                                                               │
        ┌──────────┴──────────┐                                                    ▼
        ▼                     ▼                                                 USAR:
O agregado já está     O agregado ainda NÃO                                    `sync`
aprovado para receber  foi aprovado (apenas inquérito)?                          
     subsídio?                │
        │                     ▼
        │                   USAR:
        │          `importVerificationRecords`
        ▼
      USAR:
`importBeneficiaries`
```

---

## 6. Boas Práticas e Recomendações Técnicas

1. **Tamanho do Lote (Batch):**
   * Envie entre **1 a 500 registos** por pedido HTTP nos endpoints assíncronos (`importVerificationRecords` e `importBeneficiaries`).
   * No endpoint `sync`, lotes de até **500 a 1.000 registos** funcionam com alta performance.
2. **Atomicidade da Validação:**
   * Se um único registo dentro de um lote tiver um campo obrigatório em falta ou inválido, o lote inteiro é rejeitado com HTTP `400 Bad Request`.
3. **Idempotência (Envios Repetidos):**
   * Fichas já existentes na fila de processamento são ignoradas com segurança pelo servidor, prevenindo registos duplicados.
