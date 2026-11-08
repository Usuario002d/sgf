import { inject } from "@adonisjs/core";
import Documents from "#models/documents/documents";

/*
* Servicos para o plano de contas
* Cipriano P. Sagene (ciprianosagene@gmail.com)
*/

@inject()
export default class DocumentsService {

    public async findAll() {
        return (await Documents.query()
            .withScopes((scopes) => scopes.active()))
    }

}