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

  const isProd = process.env.NODE_ENV === 'production';
  const host = process.env.DB_HOST || process.env.MYSQLHOST || (isProd ? 'mysql.railway.internal' : '127.0.0.1');
  const port = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);
  const user = process.env.DB_USER || process.env.MYSQLUSER || (isProd ? 'root' : 'sgf');
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || (isProd ? 'vuFumMqLaTPLVMdjVXbNVIDCgHqpLfJo' : 'sgf');
  const database = process.env.DB_DATABASE || process.env.MYSQLDATABASE || (isProd ? 'railway' : 'sgf');

  return { host, port, user, password, database };
}

async function initDatabaseIfNeeded() {
  const cfg = resolveConnectionConfig();

  let conn;
  try {
    console.log(`[DB-INIT] A ligar a MySQL em ${cfg.host}:${cfg.port} (db: ${cfg.database})...`);
    conn = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      multipleStatements: true,
    });

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${cfg.database}\`;`);
    await conn.query(`USE \`${cfg.database}\`;`);

    let needsImport = false;
    const [tables] = await conn.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      needsImport = true;
    } else {
      const [userCount] = await conn.query("SELECT COUNT(*) AS cnt FROM `users`");
      if (!userCount || userCount[0].cnt === 0) {
        needsImport = true;
      }
    }

    if (needsImport) {
      const sqlPath = path.join(__dirname, 'sgf_2026_estruturado.sql');
      if (fs.existsSync(sqlPath)) {
        console.log('[DB-INIT] Base de dados vazia ou incompleta detectada. A importar sgf_2026_estruturado.sql automaticamente...');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await conn.query(sql);
        console.log('[DB-INIT] ✅ Base de dados SGF 2026 (28 tabelas, utilizadores e 104 contas zeradas) importada com sucesso!');
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
