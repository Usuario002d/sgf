import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AccessProfile from '../../../app/models/security/accessprofile.js'
import Transaction from '../../../app/models/security/transaction.js'

export default class extends BaseSeeder {

  async run() {

    const profile002SecurityAdmin = await AccessProfile.findByOrFail("code", "002")

    const mantainUserTransaction = await Transaction.findByOrFail("code", "001")
    const viewUserTransaction = await Transaction.findByOrFail("code", "002")

    // Performs insert query inside the pivot table
    await profile002SecurityAdmin.related('transactions').attach([viewUserTransaction.id, mantainUserTransaction.id])
  }
}