/**
 * Chart Export Utilities
 * 
 * Functions for exporting charts as PNG, PDF, and CSV
 */

/**
 * Export chart as PNG image
 * @param {HTMLElement} chartElement - The chart container element
 * @param {string} filename - Output filename
 */
export async function exportChartAsPNG(chartElement, filename = 'chart.png') {
  try {
    // Dynamic import to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      logging: false,
    });

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw new Error('Failed to export chart as PNG. Please ensure html2canvas is installed.');
  }
}

/**
 * Export chart data as CSV
 * @param {Array} chartData - Array of data points
 * @param {string} filename - Output filename
 */
export function exportChartAsCSV(chartData, filename = 'chart.csv') {
  if (!chartData || chartData.length === 0) {
    throw new Error('No data to export');
  }

  try {
    // Get all unique keys from data objects
    const keys = Object.keys(chartData[0]);
    
    // Create CSV header
    const header = keys.join(',');
    
    // Create CSV rows
    const rows = chartData.map(row => {
      return keys.map(key => {
        const value = row[key];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',');
    });
    
    // Combine header and rows
    const csvContent = [header, ...rows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export chart as CSV');
  }
}

/**
 * Export chart as PDF with summary
 * @param {HTMLElement} chartElement - The chart container element
 * @param {Array} chartData - Chart data array
 * @param {Object} property - Property object
 * @param {Object} assumptions - Assumptions object
 * @param {string} filename - Output filename
 */
export async function exportChartAsPDF(chartElement, chartData, property, assumptions, filename = 'chart.pdf') {
  try {
    // Dynamic imports
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    
    // Capture chart as image
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add title
    pdf.setFontSize(18);
    pdf.text('Property Forecast Analysis', pdfWidth / 2, 15, { align: 'center' });
    
    // Add property info
    pdf.setFontSize(12);
    pdf.text(`Property: ${property?.nickname || property?.name || 'Unknown'}`, 15, 25);
    if (property?.address) {
      pdf.text(`Address: ${property.address}`, 15, 30);
    }
    pdf.text(`Export Date: ${new Date().toLocaleDateString()}`, 15, 35);
    
    // Add chart image
    const imgWidth = pdfWidth - 30;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 15, 45, imgWidth, Math.min(imgHeight, pdfHeight - 80));
    
    // Add assumptions section if there's space
    let yPos = 45 + Math.min(imgHeight, pdfHeight - 80) + 10;
    if (yPos < pdfHeight - 40 && assumptions) {
      pdf.setFontSize(14);
      pdf.text('Assumptions', 15, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      const assumptionText = [
        `Rent Increase: ${assumptions.annualRentIncrease}%`,
        `Expense Inflation: ${assumptions.annualExpenseInflation}%`,
        `Property Appreciation: ${assumptions.annualPropertyAppreciation}%`,
        `Vacancy Rate: ${assumptions.vacancyRate}%`,
        `Future Interest Rate: ${assumptions.futureInterestRate}%`,
        `Exit Cap Rate: ${assumptions.exitCapRate}%`,
      ];
      
      assumptionText.forEach((text, index) => {
        if (yPos < pdfHeight - 20) {
          pdf.text(text, 15, yPos + (index * 5));
        }
      });
    }
    
    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Failed to export chart as PDF. Please ensure jspdf is installed.');
  }
}

/**
 * Generate filename with timestamp
 * @param {string} propertyName - Property name
 * @param {string} chartType - Type of chart
 * @param {string} extension - File extension
 */
export function generateFilename(propertyName, chartType, extension) {
  const sanitizedName = propertyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  return `${sanitizedName}_${chartType}_${date}.${extension}`;
}

