import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AccountPlan from '../../../app/models/planbudject/account_plan.js'
import { AccoutPlanClassType, AccoutPlanType, AccountPlanTypeWritableType } from '../../../app/models/utility/Enums.js'

export default class extends BaseSeeder {

   async run() {
    await AccountPlan.createMany([
      {
        number: '1.0.0.0.00',
        description: 'Despesas Correntes',
        writable: AccountPlanTypeWritableType.CONTROLL,
        class: AccoutPlanClassType.A,
        type: AccoutPlanType.BUDJECT,
      },
      {
        number: '1.1.0.0.00',
        description: 'Despesas com o Pessoal',
        writable: AccountPlanTypeWritableType.CONTROLL,
        class: AccoutPlanClassType.B,
        type: AccoutPlanType.BUDJECT,
      },
      {
        number: '1.1.1.0.00',
        description: 'Salários e Remunerações',
        writable: AccountPlanTypeWritableType.CONTROLL,
        class: AccoutPlanClassType.C,
        type: AccoutPlanType.BUDJECT,
      },
      {
        number: '1.1.1.1.00',
        description: 'Pessoal Civil',
        writable: AccountPlanTypeWritableType.CONTROLL,
        class: AccoutPlanClassType.D,
        type: AccoutPlanType.BUDJECT,

      },

      {
        number: '1.1.1.1.01',
        description: 'Vencimento Base do Pessoal Civil do Quadro',
        writable: AccountPlanTypeWritableType.MOVIMENT,
        class: AccoutPlanClassType.E,
        type: AccoutPlanType.BUDJECT,
      },

      {
        number: '1.1.1.1.02',
        description: 'Vencimento Base do Pessoal Civil Fora do Quadro',
        writable: AccountPlanTypeWritableType.MOVIMENT,
        class: AccoutPlanClassType.E,
        type: AccoutPlanType.BUDJECT,
      },
    ])
  }
}