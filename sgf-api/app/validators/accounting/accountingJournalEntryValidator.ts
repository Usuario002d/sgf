import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import AccountPlanEntry from '../../models/planbudject/account_plan_entry.js';
import { AccoutPlanType, OperatorType } from '../../models/utility/Enums.js';
import { AccountingJounalEntryDTO, AccountingJounalItemDTO } from '../../services/accounting/utils/dtos.js';
import AccountingDocument from '../../models/accounting/accounting_document.js';
import AccountingJournal from '../../models/accounting/accounting_journal.js';
import InternalRequest from '../../models/request/internal_request.js';
import { Console } from 'console';

export default class AccountingJournalEntryValidator {

    private static schemaFieldsAccountingJournalItems = vine.object({
        id: vine.number().optional(),
        operationDate: vine.date(),
        operator: vine.enum(Object.values(OperatorType)),
        value: vine.number(),
        description: vine.string(),
        accountPlanNumber: vine.string(),
        accountPlanId: vine.number().optional(),
        accountPlanYearId: vine.number().optional(),
        entryId: vine.number().optional(),

        createtBy: vine.number().optional(),
        updatedBy: vine.number().optional().nullable(),
        createdAt: vine.date().optional(),
        updatedAt: vine.date().optional().nullable(),

    });

    private static schemaFieldsAccountingJournalItemsTableDataBudject = vine.object({
        id: vine.number().optional(),
        description: vine.string(),
        account: vine.string(),
        debit: vine.number().optional(),
        entryId: vine.number().optional(),

        createtBy: vine.number().optional(),
        updatedBy: vine.number().optional().nullable(),
        createdAt: vine.date().optional(),
        updatedAt: vine.date().optional().nullable(),
    });

    private static schemaFieldsAccountingJournalEntry = vine.object({

        id: vine.number().optional(),
        operationDate: vine.date(),
        accountPlanYearId: vine.number().optional(),
        accountingJournalNumber: vine.string().optional(),
        accountingJournalId: vine.number().optional(),
        accountingDocumentNumber: vine.string().optional(),
        accountingDocumentId: vine.number().optional(),
        internalRequestNumber: vine.string().optional(),
        internalRequestId: vine.number().optional(),
        journalDocumentNumber: vine.string().optional(),  // Novo campo
        paid: vine.boolean(),  // Novo campo
        receivable: vine.boolean(),  // Novo campo
        transactionType: vine.string().optional(),
        items: vine.array(
            AccountingJournalEntryValidator.schemaFieldsAccountingJournalItems
        ),
        tableDataBudject: vine.array(
            AccountingJournalEntryValidator.schemaFieldsAccountingJournalItemsTableDataBudject
        ).optional(),
        createtBy: vine.number().optional(),
        updatedBy: vine.number().optional().nullable(),
        createdAt: vine.date().optional(),
        updatedAt: vine.date().optional().nullable(),
        is_parcial: vine.boolean().optional(),
        payment_type: vine.string().optional(),
        remaining_balance: vine.number().optional()



    })

    private static messagesLabels = {
        required: 'O campo [{{ field }}] é obrigatorio',
        minLength: 'O campo [{{ field }}] deve ter no minimo {{ min }} caractere',
        date: 'O campo [{{ field }}] deve estar no formato {{ format }}',
        enum: 'O campo [{{ field }}] é invalido, os valores devem ser:[{{ choices }}]',

        // Error message for the username field
        'id.database.existe': 'O id [{{ value }}] não existe no sistema',
        'accountingDocumentNumber.database.notexists': 'O Documento com numero [{{ value }}] não existe no sistema',
        'accountingJournalNumber.database.notexists': 'O Diario com numero [{{ value }}] não existe no sistema',

        'accountPlanEntry.database.exists': 'O plano de conta com o numero da conta [{{ value }}] já existe no sistema',
        'accountPlanEntry.database.not.exists': 'A entrada do plano conta pai o numero da conta [{{ value }}] não existe no sistema',

        'item.accountPlanBudject.database.not.exists': 'O numero da conta [{{ value }}] não existe no sistema',
        'item.accountPlanFinancial.database.not.exists': 'O numero da conta [{{ value }}] não existe no sistema',
        'item.provider.database.not.exists': 'O numero da conta [{{ value }}] não existe no sistema',
        'item.bank.database.not.exists': 'O numero da conta [{{ value }}] não existe no sistema',

        'accountingJournalNumber.notvalid': 'O numero do diario [{{ value }}] não é valido para esta operação',
        'accountingDocumentNumber.notvalid': 'O numero do documento [{{ value }}] não é valido para esta operação',
    }

    private static setMessages = (() => {
        vine.messagesProvider = new SimpleMessagesProvider(this.messagesLabels)
    })

    public static validateFields = (() => {
        this.setMessages();
        return vine.compile(this.schemaFieldsAccountingJournalEntry)
    });

    private static async validadeExistsJournalAndDocument(data: { accountingDocumentNumber: string, accountingJournalNumber: string, journalDocumentNumber: string }) {


        console.log("existDocument", data);

        const existDocument = await AccountingDocument.query()
            .where('documentNumber', data.accountingDocumentNumber)
            .first();

        if (!existDocument) {
            throw new Error(this.messagesLabels['accountingDocumentNumber.database.notexists'].replace('value', data.accountingDocumentNumber));
        }

        const existJournal = await AccountingJournal.query()
            .where('journalNumber', data.accountingJournalNumber)
            .preload('documents')
            .first();

        if (!existJournal) {
            throw new Error(this.messagesLabels['accountingJournalNumber.database.notexists'].replace('value', data.accountingJournalNumber));
        }

        const configuredDocument = existJournal.documents.filter(document => document.documentNumber == existDocument.documentNumber);
        console.log("configuredDocument", configuredDocument)

        if (!configuredDocument) {
            throw new Error(this.messagesLabels['accountingDocumentNumber.notvalid'].replace('value', data.accountingDocumentNumber));
        }

            // Validação do novo campo journalDocumentNumber
            if (!data.journalDocumentNumber) {
                // A propriedade journalDocumentNumber não existe em data
                console.log("O campo journalDocumentNumber não foi fornecido.");
            }

    }

    public static async validateOnWithoutInternalRequest(data: AccountingJounalEntryDTO, type: string) {
        // Validar existência do diário e do documento
        await this.validadeExistsJournalAndDocument({
            accountingDocumentNumber: data.accountingDocumentNumber,
            accountingJournalNumber: data.accountingJournalNumber,
            journalDocumentNumber: data.journalDocumentNumber
        });

        switch (type) {
            case AccountingJournal.OPENING:
                if (AccountingJournal.OPENING !== data.accountingJournalNumber) {
                    throw new Error(
                        this.messagesLabels['accountingJournalNumber.notvalid']
                            .replace('value', data.accountingJournalNumber)
                    );
                }
                AccountingJournalEntryValidator.validateItemsWithoutInternalRequest(data.items, AccountingJournal.OPENING);
                break;

                console.log("Chegou22");

            case AccountingJournal.BILLS_TO_RECEIVE:
                if (AccountingJournal.BILLS_TO_RECEIVE !== data.accountingJournalNumber) {
                    throw new Error(
                        this.messagesLabels['accountingJournalNumber.notvalid']
                            .replace('value', data.accountingJournalNumber)
                    );
                }
                AccountingJournalEntryValidator.validateItemsWithoutInternalRequest(data.items, AccountingJournal.BILLS_TO_RECEIVE);
                break;

                console.log("Chegou223");


            case AccountingJournal.BANK_IN:
                if (AccountingJournal.BANK_IN !== data.accountingJournalNumber) {
                    throw new Error(
                        this.messagesLabels['accountingJournalNumber.notvalid']
                            .replace('value', data.accountingJournalNumber)
                    );
                }
                AccountingJournalEntryValidator.validateItemsWithoutInternalRequest(data.items, AccountingJournal.BANK_IN);
                break;  

                console.log("Chegou224");

            default:
                throw new Error(
                    this.messagesLabels['accountingJournalNumber.notvalid']
                        .replace('value', type)
                );
        }
    }

    private static async validateItemsWithoutInternalRequest(items: AccountingJounalItemDTO[], journalNumber: string): Promise<string[]> {
        const errors: string[] = [];
    
        for (const item of items) {
            try {
                const financialAccountPlanEntry = await AccountPlanEntry.query()
                    .where('accountPlanNumber', item.accountPlanNumber)
                    .whereHas('accountPlan', (builder) => {
                        builder.where('number', item.accountPlanNumber);
                        builder.where('type', AccoutPlanType.FINANCIAL);
                    })
                    .first();
    
                if (!financialAccountPlanEntry) {
                    errors.push(
                        this.messagesLabels['accountPlanEntry.database.not.exists'].replace(
                            'value',
                            `${item.accountPlanNumber}, ${AccoutPlanType.FINANCIAL.toString()}`
                        )
                    );
                    continue;
                }
    
                if (AccountingJournal.OPENING === journalNumber && financialAccountPlanEntry.finalAllocation !== 0) {
                    errors.push(`O lançamento de abertura já foi carregado para o plano de conta ${item.accountPlanNumber}`);
                }
    
            } catch (error) {
                errors.push(`Erro ao validar item ${item.accountPlanNumber}: ${error.message}`);
            }
        }
    
        return errors;
    }
    
    public static async validateOnWithInternalRequest(data: AccountingJounalEntryDTO, type: string) {

        await this.validadeExistsJournalAndDocument({ accountingDocumentNumber: data.accountingDocumentNumber, accountingJournalNumber: data.accountingJournalNumber, journalDocumentNumber:data.journalDocumentNumber });

        switch (type) {
            case AccountingJournal.BILLS_TO_PAY:
                {
                    if (AccountingJournal.BILLS_TO_PAY !== data.accountingJournalNumber) {
                        throw new Error(this.messagesLabels['accountingJournalNumber.notvalid'].replace('value', data.accountingJournalNumber));
                    };
                    AccountingJournalEntryValidator.validateItensWithInternalRequest(data);
                    break; // Evita que o código continue para os outros casos
                }
            case AccountingJournal.BANK_OUT:
                {
                    if (AccountingJournal.BANK_OUT !== data.accountingJournalNumber) {
                        throw new Error(this.messagesLabels['accountingJournalNumber.notvalid'].replace('value', data.accountingJournalNumber));
                    };
                    AccountingJournalEntryValidator.validateItensWithInternalRequest(data);
                    break; // Evita que o código continue para os outros casos
                }
            case AccountingJournal.REGULARIZATION:
                {
                    if (AccountingJournal.REGULARIZATION !== data.accountingJournalNumber) {
                        throw new Error(this.messagesLabels['accountingJournalNumber.notvalid'].replace('value', data.accountingJournalNumber));
                    };
                    AccountingJournalEntryValidator.validateItensWithInternalRequest(data);
                    break; // Evita que o código continue para os outros casos
                }
            default:
                throw new Error(this.messagesLabels['accountingJournalNumber.notvalid'].replace('value', type));
        }
        
    }

    // private static async validateItensWithInternalRequest(data: AccountingJounalEntryDTO) {
    //     //Caso seja o lancamento de abertura verificamos se existe a abertura
    //     if (!data.internalRequestNumber) {
    //         throw Error(" Requisicao não encontrada no sistema" + data.internalRequestNumber);
    //     }

    //     const internalRequest = await InternalRequest.query()
    //         .where('requestNumber', data.internalRequestNumber)
    //         .preload('accountPlanBudject')
    //         .preload('accountPlanFinancial')
    //         .preload('provider')
    //         .first();

    //     console.log(data)
    //     //Caso seja o lancamento de abertura verificamos se existe a abertura
    //     if (!internalRequest) {
    //         throw Error(" Requisicao não encontrada no sistema" + data.internalRequestNumber);
    //     }

    //     const accountPlanBudject = internalRequest.accountPlanBudject;
    //     const accountPlanFinancial = internalRequest.accountPlanFinancial;
    //     const provider = internalRequest.provider;


    
    //     let hasBujectAccount = false;
    //     let hasFinancialAccount = false;
    //     let hastProvider = false;
    //     let hasBank = false;

    //     console.log("Data dados", data)

    //     data.items.forEach(async (itemData) => {
    //         hasBujectAccount = !hasBujectAccount && accountPlanBudject?.number
    //             ? itemData.accountPlanNumber == accountPlanBudject.number
    //             : hasBujectAccount;
        
    //         hasFinancialAccount = !hasFinancialAccount && accountPlanFinancial?.number
    //             ? itemData.accountPlanNumber == accountPlanFinancial.number
    //             : hasFinancialAccount;
        
    //         hastProvider = !hastProvider && provider?.accountPlanFinancialNumber
    //             ? itemData.accountPlanNumber == provider.accountPlanFinancialNumber
    //             : hastProvider;
    //     });
        

    //     if (hasBujectAccount) {
    //         throw new Error(this.messagesLabels['item.accountPlanBudject.database.not.exists'].replace('value', accountPlanBudject.number + " , " + AccoutPlanType.BUDJECT.toString()));
    //     }
    //     if (!hasFinancialAccount) {
    //         throw new Error(this.messagesLabels['item.accountPlanFinancial.database.not.exists'].replace('value', accountPlanFinancial.number + " , " + AccoutPlanType.FINANCIAL.toString()));
    //     }
    //     // if (!hastProvider) {
    //     //     throw new Error(this.messagesLabels['item.provider.database.not.exists'].replace('value', provider.accountPlanFinancialNumber));
    //     // }
    // }

    private static async validateItensWithInternalRequest(data: AccountingJounalEntryDTO) {
        // Caso seja o lancamento de abertura verificamos se existe a abertura
        if (!data.internalRequestNumber) {
            throw Error(" Requisicao não encontrada no sistema" + data.internalRequestNumber);
        }
    
        const internalRequest = await InternalRequest.query()
            .where('requestNumber', data.internalRequestNumber)
            .preload('accountPlanBudject')
            .preload('accountPlanFinancial')
            .preload('provider')
            .first();
    
        // Caso seja o lancamento de abertura verificamos se existe a abertura
        if (!internalRequest) {
            throw Error(" Requisicao não encontrada no sistema" + data.internalRequestNumber);
        }
    
        const accountPlanBudject = internalRequest.accountPlanBudject;
        const accountPlanFinancial = internalRequest.accountPlanFinancial;
        const provider = internalRequest.provider;
    
        let hasBujectAccount = false;
        let hasFinancialAccount = false;
        let hastProvider = false;
        let hasBank = false;
    
        data.items.forEach(async (itemData) => {
            hasBujectAccount = !hasBujectAccount && accountPlanBudject?.number
                ? itemData.accountPlanNumber == accountPlanBudject.number
                : hasBujectAccount;
        
            // Verifica se accountPlanFinancial é nulo e usa o itemData.accountPlanNumber
            const financialNumberToCompare = accountPlanFinancial?.number || itemData.accountPlanNumber;
            hasFinancialAccount = !hasFinancialAccount && financialNumberToCompare
                ? itemData.accountPlanNumber == financialNumberToCompare
                : hasFinancialAccount;
        
            hastProvider = !hastProvider && provider?.accountPlanFinancialNumber
                ? itemData.accountPlanNumber == provider.accountPlanFinancialNumber
                : hastProvider;
        });
    
        if (hasBujectAccount) {
            throw new Error(this.messagesLabels['item.accountPlanBudject.database.not.exists'].replace('value', accountPlanBudject.number + " , " + AccoutPlanType.BUDJECT.toString()));
        }
        
        // Ajuste na mensagem de erro para considerar quando accountPlanFinancial é nulo
        if (!hasFinancialAccount) {
            const financialNumber = accountPlanFinancial?.number || "não definido (usado valor do item)";
            throw new Error(this.messagesLabels['item.accountPlanFinancial.database.not.exists'].replace('value', financialNumber + " , " + AccoutPlanType.FINANCIAL.toString()));
        }
    }
}