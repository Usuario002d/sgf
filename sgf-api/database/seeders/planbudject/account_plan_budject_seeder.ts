import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AccountPlanYear from '../../../app/models/planbudject/account_plan_year.js'

export default class extends BaseSeeder {
  async run() {
    
    const currentYear = new Date().getFullYear()

    await AccountPlanYear.createMany([
      {
        year: currentYear,
        description: 'Plano de contas do ano' + currentYear,
      },
    ])
  }
}

