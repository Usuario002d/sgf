import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDatabaseIfNeeded() {
  const host = process.env.DB_HOST || process.env.MYSQLHOST;
  const port = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);
  const user = process.env.DB_USER || process.env.MYSQLUSER;
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
  const database = process.env.DB_DATABASE || process.env.MYSQLDATABASE;

  if (!host || !user || !database) {
    console.log('[DB-INIT] Variáveis de base de dados incompletas, a saltar verificação inicial.');
    return;
  }

  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
    });

    const [tables] = await conn.query("SHOW TABLES LIKE 'account_plans'");
    if (tables.length === 0) {
      const sqlPath = path.join(__dirname, 'sgf_2026_estruturado.sql');
      if (fs.existsSync(sqlPath)) {
        console.log('[DB-INIT] Base de dados vazia detectada. A importar sgf_2026_estruturado.sql automaticamente...');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await conn.query(sql);
        console.log('[DB-INIT] ✅ Base de dados SGF 2026 (28 tabelas e 104 contas zeradas) importada com sucesso!');
      }
    } else {
      console.log('[DB-INIT] Base de dados já inicializada.');
    }
  } catch (err) {
    console.error('[DB-INIT] Aviso ao verificar/inicializar base de dados:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

initDatabaseIfNeeded();
