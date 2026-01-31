import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  title: string;
  date: string;
  companyName?: string;
  data: any[];
  columns: { header: string; dataKey: string }[];
}

export const exportReportToPDF = (reportData: ReportData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 119, 182); // Brand color
  doc.text(reportData.companyName || 'Shiv Furniture', 14, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(reportData.title, 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${reportData.date}`, 14, 38);
  
  // Add table
  autoTable(doc, {
    startY: 45,
    head: [reportData.columns.map(col => col.header)],
    body: reportData.data.map(row => 
      reportData.columns.map(col => row[col.dataKey])
    ),
    theme: 'grid',
    headStyles: {
      fillColor: [0, 119, 182], // Brand primary color
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(`${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportTableToPDF = (
  title: string,
  columns: { header: string; key: string }[],
  data: any[],
  filename?: string
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(0, 119, 182);
  doc.text('Shiv Furniture', 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 38);
  
  // Table
  autoTable(doc, {
    startY: 45,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '-';
      if (typeof value === 'object' && value.props) {
        // Handle React components (like StatusBadge)
        return value.props.label || value.props.status || '-';
      }
      return String(value);
    })),
    theme: 'grid',
    headStyles: {
      fillColor: [0, 119, 182],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  const pdfFilename = filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(pdfFilename);
};
