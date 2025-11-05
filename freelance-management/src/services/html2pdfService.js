// Client-side wrapper for html2pdf.js
// Usage: html2pdfService.downloadInvoiceFromElement(element, filename)

import html2pdf from 'html2pdf.js';

export const html2pdfService = {
    async downloadInvoiceFromElement(element, filename = 'invoice.pdf') {
        if (!element) throw new Error('No element provided to html2pdf');

        const opt = {
            margin:       [10, 10, 10, 10],
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, allowTaint: true },
            jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };

        // html2pdf returns a Promise when called as below
        return new Promise((resolve, reject) => {
            try {
                html2pdf().set(opt).from(element).save().then(() => resolve(true)).catch(reject);
            } catch (err) {
                reject(err);
            }
        });
    }
};
