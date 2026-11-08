// import type { HttpContext } from '@adonisjs/core/http'

import { inject } from "@adonisjs/core";
import CollectivePersonService from "../../services/collectiveperson/collective_person_service.js";
import ProviderValidator from "../../validators/collectiveperson/ProviderValidator.js";
import { HttpContext } from "@adonisjs/core/http";
import BankValidator from "../../validators/collectiveperson/BankValidator.js";

@inject()
export default class CollectivePersonController {

  constructor(
    private collectivePersonService: CollectivePersonService
  ) { }

  async createProvider({ request, response }: HttpContext) {
    const data = await request.validateUsing(ProviderValidator.validateFields())

    try {
      return response.created(await this.collectivePersonService.createProvider(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro ao criar a requisicao interna',
        error: error.message,
      });
    }
  }

  async createBank({ request, response }: HttpContext) {
    const data = await request.validateUsing(BankValidator.validateFields())

    try {
      return response.created(await this.collectivePersonService.createBank(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro ao criar a requisicao interna',
        error: error.message,
      });
    }
  }

  async findAllProviders({ response }: HttpContext) {
    return response.ok(await this.collectivePersonService.findAllProviders());
  }

  async findProviderByAccountFinancialNumber({ request, response }: HttpContext) {
    const number = request.param('accountFinancialNumber');
    return response.ok(await this.collectivePersonService.findProviderByAccountFinancialNumber(number));
  }

  async findAllBanks({ response }: HttpContext) {
    return response.ok(await this.collectivePersonService.findAllBanks());
  }

  async findBankByAccountFinancialNumber({ request, response }: HttpContext) {
    const number = request.param('accountFinancialNumber');
    return response.ok(await this.collectivePersonService.findBankByAccountFinancialNumber(number));
  }
}