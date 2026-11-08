import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Transaction from '../../../app/models/security/transaction.js'
import Menu from '../../../app/models/security/menu.js'

export default class extends BaseSeeder {
  async run() {

    await Transaction.createMany([
      {
        code: '001',
        description: 'Manter utilizadores',
        menuItemId: (await Menu.findByOrFail("code","101")).id,
      },
      {
        code: '002',
        description: 'Consultar utilizadores',
        menuItemId: (await Menu.findByOrFail("code","201")).id,
      },
    ])
  }

}