import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AccountPlanEntry from '../../../app/models/planbudject/account_plan_balance.js'
import AccountPlan from '../../../app/models/planbudject/account_plan.js'
import AccountPlanYear from '../../../app/models/planbudject/account_plan_year.js'

export default class extends BaseSeeder {
  async run() {

    const currentYear = new Date().getFullYear()
    const currentAccountPlanBudject = await AccountPlanYear.findBy('year', currentYear);
  
    await AccountPlanEntry.createMany([
      {
        startPostingMonth: 1,
        endPostingMonth: 12,
        reservePercent:0,
        initialAllocation:1000000,
        accountPlanBudjectId: currentAccountPlanBudject?.id,
        accountPlanId: (await AccountPlan.findBy('number', '1.0.0.0.00'))?.id,
      },
      {
        startPostingMonth: 1,
        endPostingMonth: 12,
        reservePercent:0,
        initialAllocation:1000000,
        accountPlanBudjectId: currentAccountPlanBudject?.id,
        accountPlanId: (await AccountPlan.findBy('number', '1.1.0.0.00'))?.id,
      },
    ])
  }
}

