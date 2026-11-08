import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

console.log('DB_HOST:', env.get('DB_HOST'));
console.log('DB_USER:', env.get('DB_USER'));
console.log('DB_PASSWORD:', env.get('DB_PASSWORD'));
console.log('DB_DATABASE:', env.get('DB_DATABASE'));

const dbConfig = defineConfig({
  connection: 'mysql',
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
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