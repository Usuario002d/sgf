import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

function resolveDbConnection() {
  const rawUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL
  if (rawUrl && rawUrl.startsWith('mysql://')) {
    try {
      const parsed = new URL(rawUrl)
      return {
        host: parsed.hostname,
        port: Number(parsed.port || 3306),
        user: decodeURIComponent(parsed.username || 'root'),
        password: decodeURIComponent(parsed.password || ''),
        database: parsed.pathname.replace(/^\//, '') || 'railway',
      }
    } catch (e) {
      console.error('Error parsing MYSQL_URL:', e)
    }
  }

  const railwayPass = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD
  const defaultHost = railwayPass ? 'mysql.railway.internal' : '127.0.0.1'
  const defaultUser = railwayPass ? 'root' : 'sgf'
  const defaultDb = railwayPass ? 'railway' : 'sgf'

  return {
    host: env.get('DB_HOST') || process.env.MYSQLHOST || defaultHost,
    port: Number(env.get('DB_PORT') || process.env.MYSQLPORT || 3306),
    user: env.get('DB_USER') || process.env.MYSQLUSER || defaultUser,
    password: env.get('DB_PASSWORD') || railwayPass || 'sgf',
    database: env.get('DB_DATABASE') || process.env.MYSQLDATABASE || defaultDb,
  }
}

const conn = resolveDbConnection()
console.log('DB_HOST:', conn.host)
console.log('DB_USER:', conn.user)
console.log('DB_DATABASE:', conn.database)

const dbConfig = defineConfig({
  connection: 'mysql',
  connections: {
    mysql: {
      client: 'mysql2',
      connection: conn,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      seeders: {
        paths: ['./database/seeders/MainSeeder']
      }
    },
  },
})

export default dbConfig
