import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { AccountingJournalDTO } from '../../services/accounting/utils/dtos.js';

export default class AccountingJournalValidator {

    private static schemaFields = vine.object({
        journalNumber: vine.string(),
        description: vine.string(),
    });

    private static messagesLabels = {
        required: 'O campo [{{ field }}] é obrigatorio',
        minLength: 'O campo [{{ field }}] deve ter no minimo {{ min }} caractere',
        date: 'O campo [{{ field }}] deve estar no formato {{ format }}',
        enum: 'O campo [{{ field }}] é invalido, os valores devem ser:[{{ choices }}]',
        // Error message for the username field
        'journalNumber.database.unique': 'O diario com o Numero [{{ value }}] já existe no sistema',
        'id.database.existe': 'O id [{{ value }}] não existe no sistema',
    }

    private static setMessages = (() => {
        vine.messagesProvider = new SimpleMessagesProvider(this.messagesLabels)
    })

    public static validateFields = (() => {
        this.setMessages();
        return vine.compile(this.schemaFields)
    });

    public static async validateOnCreate(data: AccountingJournalDTO) {
    }
}