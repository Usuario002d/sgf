import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { AccountPlanEntryDTO } from '../../services/planbudject/utils/dtos.js';
import AccountPlanEntry from '../../models/planbudject/account_plan_entry.js';
import { AccoutPlanType } from '../../models/utility/Enums.js';

export default class AccountPlanEntryValidator {

    private static schemaFieldsAssociateAccounts = vine.object({
        accountPlanFinancialNumber: vine.string(),
        accountPlanBujectsNumber: vine.array(
            vine.object({ accountPlanBujectNumber: vine.string() })
        ),
    });

    private static schemaFieldsWithConformance = vine.object({
        conformityType: vine.string(),
        observation: vine.string(),
        userId: vine.number() // Define que o userId será um número inteiro.
    });



    private static schemaFieldsReinforceOrAnnul = vine.object({
        accountPlanNumber: vine.string(),
        value: vine.number(),
        operationDate: vine.date(),
        requestNumber: vine.string().optional()
    });

    private static schemaFieldsUpdate = vine.object({
        accountPlanNumber: vine.string(),
        newValue: vine.number(),
        isInitialAllocation: vine.boolean(),
        operationDate: vine.string()
    });

    private static schemaDate = vine.object({
        date: vine.date()
    });
    
    private static schemaFieldsRedistributeReinforcementOrAnnulment = vine.object({
        destinationAccounts: vine.array(
            vine.object({
                targetAccountPlanNumber: vine.string(), // Número da conta destino
                value: vine.number(),                  // Valor a ser transferido para a conta destino
            })
        ),
        totalValue: vine.number(),                      // Valor total a ser retirado da conta origem
        type: vine.enum(['redistribution_reinforcement', 'annulment']), // Tipo da operação
        motivo: vine.string().optional(),
        operationDate: vine.date(),
        // Motivo da redistribuição (opcional)
        originAccountPlanNumber: vine.string()
    });

    private static schemaFields = vine.object({
        id: vine.number().optional(),
        startPostingMonth: vine.number(),
        endPostingMonth: vine.number(),
        reservePercent: vine.number().optional(),
        initialAllocation: vine.number(),
        finalAllocation: vine.number().optional(),
        accountPlanYearId: vine.number().optional(),
        accountPlanNumber: vine.string(),
        accountPlanId: vine.number().optional(),
        parentId: vine.number().optional(),
        parentAccountPlanNumber: vine.string(),
        createtBy: vine.number().optional(),
        updatedBy: vine.number().optional().nullable(),
        createdAt: vine.date().optional(),
        updatedAt: vine.date().optional().nullable(),
        isAnnulled: vine.boolean().optional(),
        requestNumber: vine.string().optional()
    })

    private static messagesLabels = {
        required: 'O campo [{{ field }}] é obrigatorio',
        minLength: 'O campo [{{ field }}] deve ter no minimo {{ min }} caractere',
        date: 'O campo [{{ field }}] deve estar no formato {{ format }}',
        enum: 'O campo [{{ field }}] é invalido, os valores devem ser:[{{ choices }}]',
        // Error message for the username field
        'number.database.unique': 'O numero da conta [{{ value }}] já existe no sistema',
        'id.database.existe': 'O id [{{ value }}] não existe no sistema',
        'accountPlanNumber.database.notexists': 'O numero da conta [{{ value }}] não existe no sistema',
        'accountPlanEntry.database.exists': 'O plano de conta com o numero da conta [{{ value }}] já existe no sistema',
        'accountPlanEntry.database.not.exists': 'A entrada do plano conta pai o numero da conta [{{ value }}] não existe no sistema',
        'only.moviment.valid': ' Operacoes permitidas somente em contas de movimento [{{ value }}]',
    }

    private static setMessages = (() => {
        vine.messagesProvider = new SimpleMessagesProvider(this.messagesLabels)
    })

    public static validateFields = (() => {
        this.setMessages();
        return vine.compile(this.schemaFields)
    });

    public static validateFieldsAssociateAccounts = (() => {
        this.setMessages();
        return vine.compile(this.schemaFieldsAssociateAccounts)
    });

    public static validateFieldsWithConformance = (() => {
        this.setMessages();
        return vine.compile(this.schemaFieldsWithConformance)
    });

    public static validateFieldsReinforceOrAnnul = (() => {
        this.setMessages();
        return vine.compile(this.schemaFieldsReinforceOrAnnul)
    });

    public static validateData() {
        return vine.compile(this.schemaFieldsUpdate);
    }

    public static validateDataBudjectTable() {
        return vine.compile(this.schemaDate);
    }

    public static validateFieldsRedistributeReinforcementOrAnnulment = (() => {
        this.setMessages();
        return vine.compile(this.schemaFieldsRedistributeReinforcementOrAnnulment)
    });

    public static async validateOnCreate(data: AccountPlanEntryDTO) {
        const exist = await AccountPlanEntry.query()
            .where('accountPlanNumber', data.accountPlanNumber)
            .whereHas('accountPlan', (builder) => {
                builder.where('number', data.accountPlanNumber);
            })
            .first();

        if (exist) {
            throw new Error(this.messagesLabels['accountPlanEntry.database.exists'].replace('value', data.accountPlanNumber));
        }

        const query = AccountPlanEntry.query()
            .where('accountPlanNumber', data.parentAccountPlanNumber)
            .whereHas('accountPlan', (builder) => {
                builder.where('number', data.parentAccountPlanNumber);
            });

        // Imprimir a consulta SQL gerada
        console.log(query.toSQL().sql); // Adicione esta linha para imprimir a consulta

        const existParent = await query.first();

        if (!existParent) {
            throw new Error(this.messagesLabels['accountPlanEntry.database.not.exists'].replace('value', data.parentAccountPlanNumber));
        }
    }

    public static async validateOnAssociate(data: { accountPlanFinancialNumber: string, accountPlanBujectsNumber: { accountPlanBujectNumber: string }[] }) {
        // Validar entrada financeira
        const financialQuery = AccountPlanEntry.query()
            .join('account_plans', 'account_plan_entries.account_plan_id', '=', 'account_plans.id')
            .where('account_plan_entries.account_plan_number', data.accountPlanFinancialNumber)
            .where('account_plans.number', data.accountPlanFinancialNumber)
            .where('account_plans.type', AccoutPlanType.FINANCIAL);

        // Imprimir a consulta SQL gerada
        console.log('Consulta SQL (Financeira):', financialQuery.toSQL().sql, 'Parâmetros:', financialQuery.toSQL().bindings);

        const existFinancialAccountEntry = await financialQuery.first();

        if (!existFinancialAccountEntry) {
            throw new Error(
                this.messagesLabels['accountPlanEntry.database.not.exists']
                    .replace(
                        'value',
                        `${data.accountPlanFinancialNumber} , ${AccoutPlanType.FINANCIAL.toString()}`
                    )
            );
        }

        // Validar entradas de orçamento
        for (const budjectAccountNumber of data.accountPlanBujectsNumber) {
            const budjectQuery = AccountPlanEntry.query()
                .join('account_plans', 'account_plan_entries.account_plan_id', '=', 'account_plans.id')
                .where('account_plan_entries.account_plan_number', budjectAccountNumber.accountPlanBujectNumber)
                .where('account_plans.number', budjectAccountNumber.accountPlanBujectNumber)
                .where('account_plans.type', AccoutPlanType.BUDJECT);

            console.log('Consulta SQL (Orçamento):', budjectQuery.toSQL().sql, 'Parâmetros:', budjectQuery.toSQL().bindings);

            const budjectAccountPlanEntry = await budjectQuery.first();

            if (!budjectAccountPlanEntry) {
                throw new Error(
                    this.messagesLabels['accountPlanEntry.database.not.exists']
                        .replace(
                            'value',
                            `${budjectAccountNumber.accountPlanBujectNumber} , ${AccoutPlanType.BUDJECT.toString()}`
                        )
                );
            }
        }
    }

}