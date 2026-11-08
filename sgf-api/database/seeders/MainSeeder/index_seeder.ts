import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {

  private async runSeeder(Seeder: { default: typeof BaseSeeder }) {
    /**
     * Do not run when not in a environment specified in Seeder
     */
    /*
    if (
      (!Seeder.default.environment.includes('development'))
      || (!Seeder.default.environment.includes('testing'))
      || (!Seeder.default.environment.includes('production'))
    ) {
      console.log("Nemhum seeder era executado pois o ambiente è invalido")
      return
    }
    */

    await new Seeder.default(this.client).run()
  }

  async run() {
    /* Write your database queries inside the run method */

    //Modulo de segurança
    await this.runSeeder(await import('../security/application_seeder.js'))
    await this.runSeeder(await import('../security/organic_seeder.js'))

     await this.runSeeder(await import('../security/menu_seeder.js'))
     await this.runSeeder(await import('../security/transaction_seeder.js'))

     await this.runSeeder(await import('../security/access_profile_seeder.js'))
     await this.runSeeder(await import('../security/access_profile_transactions_seeder.js'))

      await this.runSeeder(await import('../security/user_seeder.js'))

    //Modulo de plano e orcamento
    await this.runSeeder(await import('../planbudject/account_plan_budject_seeder.js'))
    await this.runSeeder(await import('../planbudject/account_plan_seeder.js'))
    //await this.runSeeder(await import('../planbudject/account_plan_budject_entry_seeder.js'))
  }

}