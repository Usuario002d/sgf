import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Applications from '../../../app/models/security/application.js'

export default class extends BaseSeeder {
  async run() {

    await Applications.createMany([
      {
        code: '001',
        type: 'SYSTEM',
        description: 'Sistema de Gestão financeira',
      },
      {
        code: '002',
        type: 'MODULE',
        description: 'Apoio funcional',
      },
    ])
  }
}