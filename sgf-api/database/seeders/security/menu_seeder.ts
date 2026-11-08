import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Menu from '../../../app/models/security/menu.js'
import { MenuType } from '../../../app/models/utility/Enums.js'
import Applications from '../../../app/models/security/application.js'

export default class extends BaseSeeder {
  async run() {
    await Menu.createMany([
      {
        code: '100',
        type: MenuType.ROOT,
        description: 'Utilizadores',
        applicationId: (await Applications.findByOrFail("code","001")).id
      },
      {
        code: '101',
        type: MenuType.ITEM,
        parentId: 1,
        description: 'Manter utilizadores',
        applicationId: (await Applications.findByOrFail("code","001")).id
      },
      {
        code: '200',
        type: MenuType.ROOT,
        description: 'Relatorios',
        applicationId: (await Applications.findByOrFail("code","001")).id
      },

      {
        code: '201',
        type: MenuType.ITEM,
        parentId: 2,
        description: 'consultar Utilizadores',
        applicationId: (await Applications.findByOrFail("code","001")).id
      },
    ])
  }

}