import { NextResponse } from 'next/server';
import { calculateAmortizationSchedule } from '@/utils/mortgageCalculator';
import PDFDocument from 'pdfkit';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const propertyName = searchParams.get('propertyName') || 'Property';
    const lender = searchParams.get('lender') || 'Unknown Lender';
    const originalAmount = parseFloat(searchParams.get('originalAmount')) || 0;
    const interestRate = parseFloat(searchParams.get('interestRate')) || 0;
    const amortizationYears = parseFloat(searchParams.get('amortizationYears')) || 25;
    const paymentFrequency = searchParams.get('paymentFrequency') || 'Monthly';
    const startDate = searchParams.get('startDate') || new Date().toISOString();

    // Create mortgage object for calculation
    const mortgage = {
      lender,
      originalAmount,
      interestRate: interestRate / 100, // Convert percentage to decimal
      rateType: 'Fixed',
      termMonths: 60,
      amortizationYears,
      paymentFrequency,
      startDate
    };

    // Calculate amortization schedule
    const schedule = calculateAmortizationSchedule(mortgage);

    if (format === 'csv') {
      return generateCSV(schedule, propertyName, lender);
    } else if (format === 'pdf') {
      return generatePDF(schedule, propertyName, lender, mortgage);
    } else {
      return NextResponse.json({ error: 'Invalid format. Use csv or pdf.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating amortization schedule:', error);
    return NextResponse.json({ error: 'Failed to generate amortization schedule' }, { status: 500 });
  }
}

function generateCSV(schedule, propertyName, lender) {
  // Create CSV content
  const csvContent = [
    // Header
    ['Payment #', 'Date', 'Payment', 'Principal', 'Interest', 'Remaining Balance'].join(','),
    // Data rows
    ...schedule.payments.map(payment => [
      payment.paymentNumber,
      payment.paymentDate,
      payment.monthlyPayment.toFixed(2),
      payment.principal.toFixed(2),
      payment.interest.toFixed(2),
      payment.remainingBalance.toFixed(2)
    ].join(','))
  ].join('\n');

  // Create filename
  const filename = `${propertyName.replace(/[^a-zA-Z0-9]/g, '_')}_amortization_schedule.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}

function generatePDF(schedule, propertyName, lender, mortgage) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const filename = `${propertyName.replace(/[^a-zA-Z0-9]/g, '_')}_amortization_schedule.pdf`;
        
        resolve(new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`
          }
        }));
      });

      // Header
      doc.fontSize(20).text('Amortization Schedule', { align: 'center' });
      doc.moveDown();
      
      // Property and mortgage details
      doc.fontSize(12);
      doc.text(`Property: ${propertyName}`, { align: 'left' });
      doc.text(`Lender: ${lender}`, { align: 'left' });
      doc.text(`Original Amount: $${mortgage.originalAmount.toLocaleString()}`, { align: 'left' });
      doc.text(`Interest Rate: ${(mortgage.interestRate * 100).toFixed(2)}%`, { align: 'left' });
      doc.text(`Amortization: ${mortgage.amortizationYears} years`, { align: 'left' });
      doc.text(`Payment Frequency: ${mortgage.paymentFrequency}`, { align: 'left' });
      doc.text(`Total Payments: ${schedule.totalPayments}`, { align: 'left' });
      doc.text(`Total Interest: $${schedule.totalInterest.toLocaleString()}`, { align: 'left' });
      doc.moveDown();

      // Table header
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 100;
      const col3 = 200;
      const col4 = 300;
      const col5 = 400;
      const col6 = 500;

      doc.fontSize(10);
      doc.text('Payment #', col1, tableTop);
      doc.text('Date', col2, tableTop);
      doc.text('Payment', col3, tableTop);
      doc.text('Principal', col4, tableTop);
      doc.text('Interest', col5, tableTop);
      doc.text('Balance', col6, tableTop);

      // Draw header line
      doc.moveTo(col1, tableTop + 15).lineTo(col6 + 100, tableTop + 15).stroke();

      let currentY = tableTop + 25;

      // Add payment rows (limit to first 50 payments to avoid huge PDFs)
      const maxPayments = Math.min(50, schedule.payments.length);
      for (let i = 0; i < maxPayments; i++) {
        const payment = schedule.payments[i];
        
        if (currentY > 750) { // Start new page if needed
          doc.addPage();
          currentY = 50;
        }

        doc.text(payment.paymentNumber.toString(), col1, currentY);
        doc.text(new Date(payment.paymentDate).toLocaleDateString(), col2, currentY);
        doc.text(`$${payment.monthlyPayment.toFixed(2)}`, col3, currentY);
        doc.text(`$${payment.principal.toFixed(2)}`, col4, currentY);
        doc.text(`$${payment.interest.toFixed(2)}`, col5, currentY);
        doc.text(`$${payment.remainingBalance.toFixed(2)}`, col6, currentY);

        currentY += 15;
      }

      // Add summary at the end
      if (schedule.payments.length > maxPayments) {
        doc.addPage();
        doc.fontSize(12).text('Summary', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10);
        doc.text(`Total Payments: ${schedule.totalPayments}`, { align: 'left' });
        doc.text(`Total Interest: $${schedule.totalInterest.toLocaleString()}`, { align: 'left' });
        doc.text(`Final Payment Date: ${schedule.finalPaymentDate}`, { align: 'left' });
        doc.text(`Note: This schedule shows the first ${maxPayments} payments.`, { align: 'left' });
        doc.text(`Complete schedule available in CSV format.`, { align: 'left' });
      }

      // Footer
      doc.fontSize(8);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 50, doc.page.height - 50);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
