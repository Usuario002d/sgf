# ******************************************************
#  Instruccoes para a configuracao da aplicacao no ambiente google cloud
# ******************************************************

# 1. Requisitos tecnologicos
1. Baixar o cliente gcloud url:[https://cloud.google.com/sdk/docs/install-sdk?hl=pt-br]
2. Preparar o pacote na Imagens [.README_DOCKER.md]
3. Deployar o pacote no gcloud

# 1. Configurar a BD cloud SQL 
  1. Set Up Google Cloud SQL
     a. Create a Cloud SQL Instance:
      In the Google Cloud Console, go to Cloud SQL.
      Create a new MySQL instance and configure the database settings (username, password, etc.).
      Note the Instance Connection Name (e.g., project-id:region:instance-name).
     
     b. Create a Database:
      Inside your SQL instance, create a new database for your AdonisJS API:
        CREATE DATABASE sgf;

     b. Set Up User and Password:
       Ensure you have a MySQL user with proper permissions for the database.

  2. Set Up Cloud SQL Auth Proxy
      The Cloud SQL Auth Proxy provides secure and authorized access to your Cloud SQL instance.
      a. Install the Proxy:
        On your local machine or server, download the Cloud SQL Auth Proxy:
        For linux:
          cd sgf-api/resource
          curl -o cloud-sql-proxy-linux https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
          chmod +x cloud-sql-proxy
        For Mac
          cd sgf-api/resource
          curl -o cloud-sql-proxy-mac https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
          chmod +x cloud-sql-proxy

          # see Releases for other versions
curl "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.0/cloud-sql-proxy.darwin.arm64" -o cloud-sql-proxy-mac
chmod +x cloud-sql-proxy

      b. Run the Proxy:
        Start the proxy to connect to your Cloud SQL instance:
          ./cloud-sql-proxy [INSTANCE_CONNECTION_NAME]
          ex: ./cloud-sql-proxy-linux endless-gasket-441516-h4:africa-south1:cloud-mysql-1-dev
              ./cloud-sql-proxy-mac endless-gasket-441516-h4:africa-south1:cloud-mysql-1-dev


# 2.Deployar o pacote no gcloud
 a. Configurar co cliente do Google Cloud SDK [https://cloud.google.com/sdk/auth_success]
  # Depois de configurar o cliente gcloud devemos Autenticar ao servico da cloud
    $ gcloud auth login
    $ gcloud config set project <PROJECT_ID>
   EX: $ gcloud config set project endless-gasket-441516-h4

 b. Habilite APIs Necessárias (APIS dos container Registry)
 $ gcloud services enable run.googleapis.com containerregistry.googleapis.com

c. Upload da Imagem para o Container Registry
  1. build da imagem:
    $ docker tag adonis-api gcr.io/[PROJECT_ID]/adonis-api
    EX: docker tag sgf-api:latest gcr.io/endless-gasket-441516-h4/sgf-api:latest
    #Ver a imagem criada
    $ docker images
     # output:
      # REPOSITORY                                TAG              IMAGE ID       CREATED             SIZE
        gcr.io/endless-gasket-441516-h4/sgf-api   latest           3541a96e1cb3   37 minutes ago      229MB

  2. Envie a imagem:
    $ docker push gcr.io/[PROJECT_ID]/adonis-api
     EX: docker push gcr.io/endless-gasket-441516-h4/sgf-api

     Nota: Quando tiver o erro: [denied: Unauthenticated request. Unauthenticated requests do not have permission "artifactregistry.repositories.uploadArtifacts" on resource "projects/endless-gasket-441516-h4/locations/us/repositories/gcr.io" (or it may not exist) ]
      Causa: O erro indica que a solicitação de envio da imagem para o Google Container Registry foi rejeitada porque o sistema não autenticou a conta ou a conta não possui as permissões necessárias para fazer upload de artefatos.
      Solucao: Autenticar no Docker com o Google Cloud. O Google Cloud usa credenciais para autenticar suas operações Docker. Deve se configurar o Docker para usar as credenciais executando o comabdo abaixo:
       $ gcloud auth configure-docker

d. Deploy na Cloud Run
  1. Execute:
    gcloud run deploy adonis-api \
      --image gcr.io/[PROJECT_ID]/adonis-api \
      --platform managed \
      --region [REGION] \
      --allow-unauthenticated
    EX: 
       gcloud run deploy sgf-api \
         --image gcr.io/endless-gasket-441516-h4/sgf-api \
         --platform managed \
         --region us-central1 \
        --allow-unauthenticated
  2. Após o comando, receberá uma URL para acessar sua API.

  3. Monitoramento e Debug
    Logs: Verifique logs da aplicação no Cloud Run:
    gcloud logs read --platform run

c. Configurando Variáveis de Ambiente
AdonisJS exige variáveis no .env. No Cloud Run, configure-as manualmente:

No console do Google Cloud, vá para Cloud Run > Serviços.
Clique no serviço da API e vá para Editar > Variáveis de Ambiente.
Adicione as variáveis do seu .env (como APP_KEY, DB_HOST, etc.).
