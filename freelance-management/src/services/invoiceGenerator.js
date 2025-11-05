// Invoice Generator API removed per user request.
// This stub exists so imports don't break. Use `html2pdfService` for client-side PDF generation.

export class InvoiceGeneratorService {
    checkAPIStatus() {
        return Promise.resolve({ status: 'removed', message: 'Remote Invoice Generator API removed. Use html2pdf client-side.' });
    }

    async downloadInvoice() {
        throw new Error('Remote Invoice Generator API has been removed. Use html2pdf client-side implementation.');
    }
}

export const invoiceGeneratorService = new InvoiceGeneratorService();