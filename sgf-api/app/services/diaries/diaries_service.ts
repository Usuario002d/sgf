import { inject } from "@adonisjs/core";
import Diaries from "#models/daily/diaries";

/*
* Servicos para o plano de contas
* Cipriano P. Sagene (ciprianosagene@gmail.com)
*/

@inject()
export default class DiariesService {

    public async findAll() {
        return (await Diaries.query()
            .withScopes((scopes) => scopes.active()))
    }

}