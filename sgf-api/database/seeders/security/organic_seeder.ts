import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Organic from '../../../app/models/security/organic.js'

export default class extends BaseSeeder {
  async run() {
    await Organic.createMany([
      {
        code: '001',
        name:'EM',
        description: 'Embaixada de Mocambique',
      },
      {
        code: '002',
        name:'SBD',
        description: 'SABADORE',
      },
    ])
  }
}