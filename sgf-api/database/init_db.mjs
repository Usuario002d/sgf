import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveConnectionConfig() {
  const rawUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;
  if (rawUrl && rawUrl.startsWith('mysql://')) {
    try {
      const parsed = new URL(rawUrl);
      return {
        host: parsed.hostname,
        port: Number(parsed.port || 3306),
        user: decodeURIComponent(parsed.username || 'root'),
        password: decodeURIComponent(parsed.password || ''),
        database: parsed.pathname.replace(/^\//, '') || 'railway',
      };
    } catch (e) {
      console.error('[DB-INIT] Erro ao analisar MYSQL_URL:', e.message);
    }
  }

  const railwayPass = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD;
  const host = process.env.DB_HOST || process.env.MYSQLHOST || (railwayPass ? 'mysql.railway.internal' : '');
  const port = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);
  const user = process.env.DB_USER || process.env.MYSQLUSER || (railwayPass ? 'root' : '');
  const password = process.env.DB_PASSWORD || railwayPass || '';
  const database = process.env.DB_DATABASE || process.env.MYSQLDATABASE || (railwayPass ? 'railway' : '');

  return { host, port, user, password, database };
}

async function initDatabaseIfNeeded() {
  const cfg = resolveConnectionConfig();

  if (!cfg.host || !cfg.user || !cfg.database) {
    console.log('[DB-INIT] Variáveis de base de dados ainda não definidas no serviço. Configure MYSQL_URL ou DB_HOST nas Variables.');
    return;
  }

  let conn;
  try {
    console.log(`[DB-INIT] A ligar a MySQL em ${cfg.host}:${cfg.port} (db: ${cfg.database})...`);
    conn = await mysql.createConnection({
      ...cfg,
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
      console.log('[DB-INIT] ✅ Base de dados já inicializada e pronta.');
    }
  } catch (err) {
    console.error('[DB-INIT] Aviso ao verificar/inicializar base de dados:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

initDatabaseIfNeeded();
