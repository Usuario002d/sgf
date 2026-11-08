import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbHost = env.get('DB_HOST') || process.env.MYSQLHOST || '127.0.0.1'
const dbPort = Number(env.get('DB_PORT') || process.env.MYSQLPORT || 3306)
const dbUser = env.get('DB_USER') || process.env.MYSQLUSER || 'sgf'
const dbPassword = env.get('DB_PASSWORD') || process.env.MYSQLPASSWORD || 'sgf'
const dbDatabase = env.get('DB_DATABASE') || process.env.MYSQLDATABASE || 'sgf'

console.log('DB_HOST:', dbHost)
console.log('DB_USER:', dbUser)
console.log('DB_DATABASE:', dbDatabase)

const dbConfig = defineConfig({
  connection: 'mysql',
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbDatabase,
      },
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
