# =====================================================================
# COMANDOS E DOCUMENTACAO - SGF (MySQL + API + Web + Criacao de Utilizador)
# =====================================================================

## 1. Credenciais do Utilizador Criado (Login no SGF Web)
- **URL do SGF Web:** `http://localhost:3000/material-dashboard-react`
- **E-mail:** `admin@sgf.com`
- **Password:** `password123`
- **Perfil:** `1` (Adido Financeiro / SuperAdmin com todos os menus `39` a `67`)
- **ID criado na Base de Dados:** `19`

---

## 2. cURL / PowerShell para Criar um Novo Utilizador na API

### 2.1. No PowerShell (`Invoke-RestMethod`)
```powershell
Invoke-RestMethod -Uri "http://localhost:3333/sgf-api/user/createUser" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "name": "Administrador SGF",
    "email": "admin@sgf.com",
    "password": "password123",
    "phone": "841234567",
    "birthDate": "1990-01-01",
    "profile": "1",
    "isTech": true,
    "isAdmin": true,
    "isSuperAdmin": true,
    "permissions": [39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67]
  }'
```

### 2.2. Em cURL padrão (Git Bash / CMD / Postman Import)
```bash
curl -X POST "http://localhost:3333/sgf-api/user/createUser" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador SGF",
    "email": "admin@sgf.com",
    "password": "password123",
    "phone": "841234567",
    "birthDate": "1990-01-01",
    "profile": "1",
    "isTech": true,
    "isAdmin": true,
    "isSuperAdmin": true,
    "permissions": [39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67]
  }'
```

### 2.3. Campos aceites pelo endpoint `/sgf-api/user/createUser`
- `name` (obrigatório): Nome completo do utilizador
- `email` (obrigatório): E-mail único
- `password` (obrigatório): Senha com mínimo de 6 caracteres
- `phone` (opcional): Contacto telefónico
- `birthDate` (obrigatório): Data no formato `YYYY-MM-DD`
- `profile` (obrigatório): ID do perfil em string:
  - `"1"` = Adido Financeiro
  - `"2"` = Chefe da Missão
  - `"3"` = Assistente
  - `"4"` = Embaixador
- `isTech`, `isAdmin`, `isSuperAdmin` (opcionais): booleanos (`true`/`false`)
- `permissions` (opcional): Array de IDs da tabela `menus` (`39` a `67`)

---

## 3. Subir a API e o Web Localmente
Na pasta `D:\Projectos\SGF`:
- **Subir a API (`http://localhost:3333`):**
  ```powershell
  .\subir-api.bat
  ```
- **Subir o Web (`http://localhost:3000/material-dashboard-react`):**
  ```powershell
  .\subir-web.bat
  ```

---

## 4. Entrar na consola do MySQL (PowerShell)
Atalho rápido em `D:\Projectos\SGF`:
```powershell
.\mysql.bat
```

Ou comando completo:
```powershell
& "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe" exec -it sgf-mysql mysql -usgf -psgf sgf
```

Para entrar como administrador (`root`):
```powershell
& "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe" exec -it sgf-mysql mysql -uroot -proot sgf
```

---

## 5. Dados de ligação MySQL (DBeaver / MySQL Workbench / HeidiSQL)
- **Host:** `127.0.0.1` (ou `localhost`)
- **Porta:** `3306`
- **Base de Dados:** `sgf`
- **Utilizador / Password:** `sgf` / `sgf`
- **Utilizador Root / Password:** `root` / `root`
- **Container Docker:** `sgf-mysql`

---

## 6. Fazer Backup (Dump) e Restaurar
Exportar a base atual para um ficheiro `.sql`:
```powershell
& "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe" exec sgf-mysql mysqldump -uroot -proot --routines --triggers sgf > D:\Projectos\SGF\backup_sgf.sql
```

Importar um ficheiro `.sql` (ex.: `27Aug.sql`):
```powershell
& "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe" cp D:\Projectos\SGF\sgf-api\27Aug.sql sgf-mysql:/tmp/dump.sql
& "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe" exec sgf-mysql sh -c "mysql -uroot -proot sgf < /tmp/dump.sql"
```
