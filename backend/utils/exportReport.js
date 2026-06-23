const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const generatePDF = (res, title, headers, rows, filename) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
  doc.moveDown();

  const colWidth = (doc.page.width - 100) / headers.length;
  let y = doc.y;

  doc.fontSize(10).font('Helvetica-Bold');
  headers.forEach((header, i) => {
    doc.text(header, 50 + i * colWidth, y, { width: colWidth, continued: false });
  });
  y += 20;
  doc.font('Helvetica');

  rows.forEach((row) => {
    if (y > doc.page.height - 50) {
      doc.addPage();
      y = 50;
    }
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ''), 50 + i * colWidth, y, { width: colWidth });
    });
    y += 18;
  });

  doc.end();
};

const generateExcel = async (res, title, headers, rows, filename) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title);
  sheet.addRow(headers);
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
};

module.exports = { generatePDF, generateExcel };
