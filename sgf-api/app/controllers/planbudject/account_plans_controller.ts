import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import AccountPlanService from "../../services/planbudject/account_plan_service.js";
import AccountPlanValidator from "../../validators/planbudject/accountPlanValidator.js";

/**
 * Gautchi Rogério Chambe
 */
@inject()
export default class AccountPlansController {

  constructor(
    private accountPlanService: AccountPlanService
  ) { }

  async createAccountPlan({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountPlanValidator.validateFields())

    try {
      return response.created(await this.accountPlanService.create(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorreu um erro ao criar o plano de contas',
        error: error.message,
      });
    }
  }

  async updateAccountPlan({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountPlanValidator.validateFields())
    try {
      return response.created((await this.accountPlanService.update(data)).serialize());

    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro ao actualizar o plano de contas',
        error: error.message,
      });
    }
  }

  async removeAccountPlan({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanValidator.validateFields())
    try {
      const result = await this.accountPlanService.remove(data);

      return response.status(200).json(result);
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorreu erro ao remover o plano de contas',
        error: error.message,
      });
    }
  }

  async findAllAccountPlan({ response }: HttpContext) {
    return response.ok(await this.accountPlanService.findAll());
  }

  async findAnyAccountPlan({ response }: HttpContext) {
    return response.ok(await this.accountPlanService.findAny());
  }

  async findAccountPlanByNumber({ request, response }: HttpContext) {
    const number = request.param('number');
    return response.ok(await this.accountPlanService.findByNumber(number));
  }

  async findAnyAccountPlanByNumber({ request, response }: HttpContext) {
    const number = request.param('number');
    return response.ok(await this.accountPlanService.findByNumber(number));
  }


}