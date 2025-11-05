import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (invoiceData) => {
    const { invoice, project, client } = invoiceData;
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Colors - Professional Black & Gray palette
    const primaryColor = [20, 20, 20]; // Deep black
    const darkColor = [40, 40, 40]; // Dark gray
    const lightGray = [120, 120, 120]; // Medium gray
    const accentColor = [60, 60, 60]; // Dark accent
    const backgroundColor = [248, 248, 248]; // Very light gray
    const borderColor = [200, 200, 200]; // Light border
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Header Section with Brand Identity
    doc.setFillColor(...backgroundColor);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Professional Logo Design (Text-based)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 15, 50, 30, 3, 3, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.roundedRect(margin, 15, 50, 30, 3, 3, 'S');
    
    // Logo Text - Professional Design
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('TECHLEAD', margin + 3, 25);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('ANKAN', margin + 3, 35);
    
    // Company Name and Branding
    doc.setTextColor(...darkColor);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('Techlead-ANKAN', margin + 60, 25);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...lightGray);
    doc.text('Professional Web & Tech Solutions', margin + 60, 35);
    
    // Contact Information (Right aligned)
    doc.setFontSize(9);
    doc.setTextColor(...lightGray);
    const contactX = pageWidth - margin - 80;
    doc.text('Contact: +91 8617790081', contactX, 18);
    doc.text('Email: mr.ankanmaity@gmail.com', contactX, 26);
    
    // Professional Links
    doc.setTextColor(...accentColor);
    doc.text('Portfolio: techlead-ankan.com', contactX, 34);
    doc.text('GitHub: github.com/Techlead-ANKAN', contactX, 42);
    doc.text('LinkedIn: linkedin.com/in/ankan-maity', contactX, 50);
    
    // Invoice Header
    doc.setFillColor(...darkColor);
    doc.rect(0, 60, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', margin, 76);
    
    // Invoice Number (Right aligned)
    doc.setFontSize(14);
    doc.text(`#${invoice.invoice_number}`, pageWidth - margin - 50, 76);
    
    // Invoice Metadata Section
    const metaY = 100;
    
    // Left side - Invoice details
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Invoice Details', margin, metaY);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...lightGray);
    doc.text('Issue Date:', margin, metaY + 12);
    doc.text('Due Date:', margin, metaY + 20);
    doc.text('Payment Method:', margin, metaY + 28);
    doc.text('Invoice Type:', margin, metaY + 36);
    
    doc.setTextColor(...darkColor);
    doc.text(new Date(invoice.invoice_date).toLocaleDateString('en-IN'), margin + 35, metaY + 12);
    doc.text(new Date(invoice.due_date).toLocaleDateString('en-IN'), margin + 35, metaY + 20);
    doc.text(invoice.payment_method, margin + 35, metaY + 28);
    doc.text(invoice.invoice_type.toUpperCase(), margin + 35, metaY + 36);
    
    // Right side - Client and Project
    const rightX = pageWidth / 2 + 10;
    
    // Client Information
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To', rightX, metaY);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(client.name, rightX, metaY + 12);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...lightGray);
    let clientY = metaY + 20;
    
    if (client.company) {
        doc.text(client.company, rightX, clientY);
        clientY += 8;
    }
    if (client.email) {
        doc.text(client.email, rightX, clientY);
        clientY += 8;
    }
    if (client.phone) {
        doc.text(client.phone, rightX, clientY);
    }
    
    // Project Information Box
    const projectY = metaY + 50;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, projectY, pageWidth - (margin * 2), 25, 2, 2, 'F');
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Project:', margin + 10, projectY + 8);
    
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.text(project.title, margin + 35, projectY + 8);
    
    if (project.start_date) {
        doc.setFontSize(8);
        doc.setTextColor(...lightGray);
        doc.text(`Duration: ${new Date(project.start_date).toLocaleDateString('en-IN')}`, margin + 10, projectY + 18);
        if (project.end_date) {
            doc.text(` to ${new Date(project.end_date).toLocaleDateString('en-IN')}`, margin + 60, projectY + 18);
        }
    }
    
    // Services Table
    const tableY = projectY + 40;
    
    // Prepare table data with proper currency formatting
    const formatCurrency = (amount) => {
        return `Rs ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };
    
    const tableData = invoice.services && invoice.services.length > 0 
        ? invoice.services.map(service => [
            service.description || 'Service',
            (service.quantity || 1).toString(),
            formatCurrency(service.rate || 0),
            formatCurrency(service.amount || 0)
        ])
        : [
            [invoice.description || 'Development Services', '1', 
             formatCurrency(invoice.amount), 
             formatCurrency(invoice.amount)]
        ];
    
    // Create table with professional styling
    autoTable(doc, {
        startY: tableY,
        head: [['Description', 'Qty', 'Rate', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: [...darkColor],
            fontStyle: 'bold',
            fontSize: 10,
            cellPadding: 6,
            lineColor: [...borderColor],
            lineWidth: 0.5
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [...darkColor],
            cellPadding: 6,
            lineColor: [...borderColor],
            lineWidth: 0.25
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        },
        margin: { left: margin, right: margin },
        columnStyles: {
            0: { cellWidth: 'auto', halign: 'left' },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 50, halign: 'right' },
            3: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
        },
        styles: {
            overflow: 'linebreak',
            fontSize: 9
        }
    });
    
    // Total Section with Professional Design
    const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : tableY) + 15;
    
    // Total Amount Box
    doc.setFillColor(...darkColor);
    doc.roundedRect(pageWidth - margin - 120, finalY, 120, 30, 3, 3, 'F');
    
    // Total label and amount
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL AMOUNT', pageWidth - margin - 115, finalY + 10);
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(formatCurrency(invoice.amount), pageWidth - margin - 115, finalY + 22);
    
    // Payment Status Badge
    const statusColor = invoice.status === 'paid' ? [60, 60, 60] : [100, 100, 100];
    doc.setFillColor(...statusColor);
    doc.roundedRect(margin, finalY + 5, 60, 15, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text(`STATUS: ${invoice.status.toUpperCase()}`, margin + 5, finalY + 14);
    
    // Payment Terms and Notes Section
    const notesY = finalY + 50;
    
    if (invoice.payment_terms) {
        doc.setTextColor(...darkColor);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Payment Terms:', margin, notesY);
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...lightGray);
        const splitTerms = doc.splitTextToSize(invoice.payment_terms, pageWidth - (margin * 2));
        doc.text(splitTerms, margin, notesY + 10);
    }
    
    if (invoice.notes) {
        const noteStartY = invoice.payment_terms ? notesY + 25 : notesY;
        
        doc.setTextColor(...darkColor);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Additional Notes:', margin, noteStartY);
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...lightGray);
        const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
        doc.text(splitNotes, margin, noteStartY + 10);
    }
    
    // Professional Footer
    const footerY = pageHeight - 30;
    doc.setFillColor(...backgroundColor);
    doc.rect(0, footerY, pageWidth, 30, 'F');
    
    // Thank you message
    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Thank you for your business!', pageWidth / 2, footerY + 12, { align: 'center' });
    
    // Footer details
    doc.setTextColor(...lightGray);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Invoice generated on ${new Date().toLocaleDateString('en-IN')} | Techlead-ANKAN`, 
              pageWidth / 2, footerY + 20, { align: 'center' });
    
    // Professional border
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY + 25, pageWidth - margin, footerY + 25);
    
    return doc;
};