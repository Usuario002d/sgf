import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import InternalRequestService from "../../services/request/internal_request_service.js";
import InternalRequestValidator from "../../validators/request/internalRequestValidator.js";
import { DateTime } from "luxon";
import AccountPlanEntry from "#models/planbudject/account_plan_entry";
import AccountPlanEntryEntry from "#models/planbudject/account_plan_entry_entry";
import InternalRequest from "#models/request/internal_request";
import InternalRequestItem from "#models/request/internal_request_item";

/**
 * Gautchi Rogério Chambe
 */
@inject()
export default class DashBoardController {

  constructor(
    private internalRequestService: InternalRequestService
  ) { }

  
  // async dashboardAvailableRequests({ request, response }: HttpContext) {
  //   return response.ok(await this.internalRequestService.findDashboardAvailableRequests(number));
  // }


  

  async dashboardData({response }: HttpContext) {
    return response.ok(await this.internalRequestService.fetchDashboardData());
  }

  async dashboardDataSecondSection({response }: HttpContext) {
    return response.ok(await this.internalRequestService.fetchDashboardData2());
  }

  async dashboardBudject({response }: HttpContext) {
    return response.ok(await this.internalRequestService.fetchBudget());
  }
  
  
}