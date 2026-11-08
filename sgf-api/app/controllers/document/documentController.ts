import DocumentsService from "#services/document/document_service";
import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

/**
 * Cipria Sagene
 */
@inject()
export default class DocumentController {

  constructor(
    private documentService: DocumentsService
  ) { }


  async findAllDiariesWithDocuments({ response }: HttpContext) {
    return response.ok(await this.documentService.findAll());
  }

}