import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { AccoutPlanType, QuantificationType } from '../../models/utility/Enums.js'
import { InternalRequestDTO } from '../../services/request/utils/dtos.js'
import AccountPlanEntry from '../../models/planbudject/account_plan_entry.js';
import Provider from '../../models/person/provider.js';

export default class InternalRequestValidator {

    private static schemaCreateFieldsItem = vine.object({
        id: vine.number().optional(),
        quantification: vine.enum(Object.values(QuantificationType)),
        quantity: vine.number(),
        description: vine.string(),
        operationDate: vine.date(),
        unitPrice: vine.number(),
        importancia: vine.number(),
        internalRequestId: vine.number().optional(),
        internalRequestNumber: vine.string().optional(),
        financiamentoView: vine.string().optional(),
        orcamento: vine.string(),
        createtBy: vine.number().optional(),
        updatedBy: vine.number().optional().nullable(),
        createdAt: vine.date().optional(),
        updatedAt: vine.date().optional().nullable(),
        beneficiaryName: vine.number().optional(),
        saldoExistente: vine.number(),
        availableAllocation: vine.number()
    });


    private static schemaCreateFields = vine.object({
        id: vine.number().optional(),
        requestNumber: vine.string().optional(),
        requestorName: vine.string(),
        requestorDepartment: vine.string(),
        operationDate: vine.date(),

        initialAvailabilityAccountBuject: vine.number().optional(),
        currentAccountBudjectBalance: vine.number().optional(),
        finalAccountBujectBalance: vine.number().optional(),
        totalRequestedValue: vine.number().optional(),
        documentNumber: vine.string().optional(),
        document: vine.string(),

        justification: vine.string(),
        sectorBudject: vine.string(),
        chapterBudject: vine.string(),
        clauseBudject: vine.string(),
        clauseNumberBudject: vine.string(),
        provideCode: vine.string(),
        accountPlanBudjectNumber: vine.string().optional(),
        accountPlanFinancialNumber: vine.string().optional(),
        accountPlanFinancialAssociation: vine.string().optional(),

        // Campo 'bank' agora obrigatório e sem limite de tamanho
        bank: vine.string().optional(),  // Banco é obrigatório, sem restrição de tamanho
        transactionType: vine.string(),
        isReceivable: vine.boolean().optional(),

        createtBy: vine.number().optional(),
        updatedBy: vine.number().optional().nullable(),
        createdAt: vine.date().optional(),
        updatedAt: vine.date().optional().nullable(),

        items: vine.array(
            this.schemaCreateFieldsItem,
        )
    })

    private static messagesLabels = {
        required: 'O campo [{{ field }}] é obrigatorio',
        minLength: 'O campo [{{ field }}] deve ter no minimo {{ min }} caractere',
        date: 'O campo [{{ field }}] deve estar no formato {{ format }}',
        enum: 'O campo [{{ field }}] é invalido, os valores devem ser:[{{ choices }}]',
        'number.database.unique': 'O numero da conta [{{ value }}] já existe no sistema',
        'id.database.unique': 'O id [{{ value }}] não existe no sistema',
        'accountPlanBudjectNumber.database.not.exists': 'O numero da conta [{{ value }}] não existe no sistema',
        'accountPlanFinancialNumber.database.not.exists': 'O numero da conta [{{ value }}] não existe no sistema',
        'provider.database.not.exists': 'Provedor com codico [{{ value }}] não existe no sistema',
    }

    private static setMessages = (() => {
        vine.messagesProvider = new SimpleMessagesProvider(this.messagesLabels)
    })

    public static validateFields = (() => {
        this.setMessages();
        return vine.compile(this.schemaCreateFields);
    });

    public static async validateOnCreate(data: InternalRequestDTO) {
        // Valida o tipo de dados e enums
        const provider = await Provider.query()
            .where("accountPlanFinancialNumber", data.provideCode).first();

        if (!provider) {
            throw new Error(this.messagesLabels['provider.database.not.exists']
                .replace('value', data.provideCode))
        }

        // const existAccountBuject = await AccountPlanEntry.query()
        //     .where("accountPlanNumber", data.accountPlanBudjectNumber)
        //     .whereHas('accountPlan', (builder) => {
        //         builder.where('number', data.accountPlanBudjectNumber)
        //             .where('type', AccoutPlanType.BUDJECT)
        //     });

        // if (!existAccountBuject) {
        //     throw new Error(this.messagesLabels['accountPlanBudjectNumber.database.not.exists']
        //         .replace('value', data.accountPlanBudjectNumber))
        // }

        // const existAccountFinancial = await AccountPlanEntry.query()
        //     .where("accountPlanNumber", data.accountPlanFinancialNumber)
        //     .whereHas('accountPlan', (builder) => {
        //         builder.where('number', data.accountPlanFinancialNumber)
        //             .where('type', AccoutPlanType.FINANCIAL);
        //     });

        // if (!existAccountFinancial) {
        //     throw new Error(this.messagesLabels['accountPlanFinancialNumber.database.not.exists']
        //         .replace('value', data.accountPlanFinancialNumber))
        // }
    }
}
