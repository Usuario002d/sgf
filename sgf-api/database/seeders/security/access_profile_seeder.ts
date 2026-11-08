import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AccessProfile from '../../../app/models/security/accessprofile.js'

export default class extends BaseSeeder {
  async run() {
    await AccessProfile.createMany([
      {
        code: '001',
        description: 'Administrador do sistema',
      },
      {
        code: '002',
        description: 'Administrador de Segurança',
      },
      {
        code: '003',
        description: 'Apoio funcional',
      },
      {
        code: '004',
        description: 'Gestor de Finanças',
      },
    ]);
  }
}