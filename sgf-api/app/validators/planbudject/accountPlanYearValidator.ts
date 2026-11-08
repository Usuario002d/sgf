import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import AccountPlanYear from '../../models/planbudject/account_plan_year.js'

export default class AccountPlanYearValidator {

    private static schemaFields = vine.object({
        id: vine.number().optional(),
        year: vine.number().range([2024, new Date().getFullYear() + 1]), // Ensures year is between 2024 and the current year
        description: vine.string().minLength(1),
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
        'year.database.exists': 'O plano de contas [{{ value }}] já existe no sistema',
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

        const exist = await AccountPlanYear.findBy("year", data.year);

        if (exist) {
            throw new Error(this.messagesLabels['year.database.exists'].replace('value', data.year))
        }
    }
}