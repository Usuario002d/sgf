import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import Provider from '../../models/person/provider.js'

export default class ProviderValidator {

    private static schemaFields = vine.object({
        id: vine.number().optional(),
        name: vine.string().minLength(1),
        description: vine.string(),
        accountPlanFinancialNumber: vine.string().minLength(1),
        nib: vine.string(),
        nuit: vine.string(),

        createtBy: vine.number().optional(),
        updatedBy: vine.number().optional().nullable(),
        createdAt: vine.date().optional(),
        updatedAt: vine.date().optional().nullable(),
    })

    private static messagesLabels = {
        required: 'O campo [{{ field }}] é obrigatorio',
        minLength: 'O campo [{{ field }}] deve ter no minimo {{ min }} caractere',
        date: 'O campo [{{ field }}] deve estar no formato {{ format }}',
        enum: 'O campo [{{ field }}] é invalido, os valores devem ser:[{{ choices }}]',
        // Error message for the username field
        'year.range': 'O Ano deve ser entre 2024 ate ao ano corrente',
        'accountPlanFinancialNumber.database.exists': 'O Fornecedor [{{ value }}] já existe no sistema',
    }

    private static setMessages = (() => {
        vine.messagesProvider = new SimpleMessagesProvider(this.messagesLabels)
    })

    public static validateFields = (() => {
        this.setMessages();
        return vine.compile(this.schemaFields)
    });

    public static validateOnCreate = async (data: any) => {
        this.setMessages();

        const exist = await Provider.findBy("accountPlanFinancialNumber", data.accountPlanFinancialNumber);

        if (exist) {
            throw new Error(this.messagesLabels['accountPlanFinancialNumber.database.exists'].replace('value', data.accountPlanFinancialNumber))
        }
    }
}