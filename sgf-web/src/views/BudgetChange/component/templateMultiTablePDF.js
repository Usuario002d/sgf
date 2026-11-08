import { jsPDF } from "jspdf";
import 'jspdf-autotable';

/**
 * Gera um PDF com múltiplas tabelas (layout sofisticado)
 */
const templateMultiTablePDF = ({
  title,
  subtitle,
  tableContent = [],
  footerText,
  logoImage,
  generatedBy,
  filename,
  monthFilter
}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.height;
  const margin = 40;

  let cursorY = 5;

  // Logo
  const logoWidth = 60;
  const logoHeight = 60;
  const logoX = (pageWidth - margin - logoWidth);
  const logoY = cursorY;

  if (logoImage) {
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
  }

  // Marca d'água
  const watermarkText = 'SEBADORA';
  const watermarkFontSize = 7;
  const step = 100;

  const drawWatermark = () => {
    doc.setFontSize(watermarkFontSize);
    doc.setTextColor(210, 210, 210);

    for (let xPos = 0; xPos < pageWidth; xPos += step) {
      for (let yPos = 0; yPos < pageHeight; yPos += step) {
        doc.text(watermarkText, xPos + step / 2, yPos + step / 2, { align: 'center', angle: 45 });
      }
    }
  };

  drawWatermark();

  cursorY += 60;

  // Título
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(title, margin, cursorY);

  cursorY += 15;

  // Filtro de mês
  if (monthFilter) {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(`Análise do Mês: ${monthNames[monthFilter - 1]}`, margin, cursorY);
    cursorY += 15;
  }

  // Subtítulo
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.text(subtitle, margin, cursorY);

  cursorY += 15;

  // Data
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  const currentDate = new Date().toLocaleDateString("pt-PT");
  doc.text(`Data da Operação: ${currentDate}`, margin, cursorY);
  cursorY += 10;

  // Gera todas as tabelas do array
  tableContent.forEach((table, index) => {
    doc.autoTable({
      head: table.head,
      body: table.body,
      columnStyles: table.columnStyles,
      startY: cursorY + 5,
      margin: { left: margin, right: margin },
      styles: {
        font: 'times',
        fontSize: 7,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.1,
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        lineColor: [120, 120, 120],
        lineWidth: 0.5,
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: 'left',
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const pageNumber = doc.internal.getNumberOfPages();

        // Footer: "Gerado por"
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Gerado por: ${generatedBy}`, margin, pageHeight - 20);

        // Footer: texto extra
        if (footerText) {
          doc.setFontSize(7);
          doc.setTextColor(100);
          doc.text(footerText, margin, pageHeight - 10);
        }

        // Número da página
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Página ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

        // Marca d'água em cada página
        drawWatermark();
      }
    });

    cursorY = doc.lastAutoTable.finalY + 10;

    // Se chegou ao fim da página, nova página
    if (cursorY > (pageHeight - 100) && index < tableContent.length - 1) {
      doc.addPage();
      drawWatermark();
      cursorY = 60;
    }
  });

  doc.save(filename || 'relatorio_multitabelas.pdf');
};

export default templateMultiTablePDF;
