import DiariesService from "#services/diaries/diaries_service";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

/**
 * Cipriano Sagene
 */
@inject()
export default class DiariesController {

  constructor(
    private diariesService: DiariesService
  ) { }


  async findAllDiaries({ response }: HttpContext) {
    return response.ok(await this.diariesService.findAll());
  }

}