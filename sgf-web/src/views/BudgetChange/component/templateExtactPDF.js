import { jsPDF } from "jspdf";
import 'jspdf-autotable';

/**
 * Gera um PDF com layout sofisticado, logo centralizado, cabeçalho confidencial e marca d'água no fundo.
 */
const templateExtractPDF = ({
  title,
  subtitle,
  tables = [],
  footerText,
  logoImage,
  generatedBy,
  filename
}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.height;
  const margin = 40;
  let cursorY = 5;

  // Adiciona o logo no topo, centralizado e aumentado
  const logoWidth = 60;
  const logoHeight = 60;
  const logoX = (pageWidth - margin - logoWidth);
  const logoY = cursorY;

  if (logoImage) {
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
  }

  // Configuração da marca d'água
  const watermarkText = 'SEBADORA';
  const watermarkFontSize = 7;
  const step = 100;

  const drawWatermark = () => {
    doc.setFontSize(watermarkFontSize);
    doc.setTextColor(210, 210, 210);

    let xPos = 0;
    let yPos = 0;

    for (xPos = 0; xPos < pageWidth; xPos += step) {
      for (yPos = 0; yPos < pageHeight; yPos += step) {
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
  doc.text(title, margin, cursorY, { align: 'left' });

  cursorY += 15;

  // Subtítulo
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.text(subtitle, margin, cursorY, { align: 'left' });

  cursorY += 15;

  // Data e Gerado por
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  const currentDate = new Date().toLocaleDateString("pt-PT");
  doc.text(`Data da Operação: ${currentDate}`, margin, cursorY);
  cursorY += 15;

  // Processar cada tabela separadamente
  tables.forEach((table, index) => {
    // Adicionar título da tabela
    if (index > 0) cursorY += 15; // Espaço entre tabelas
    
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text(table.title, margin, cursorY);
    cursorY += 15;

    // Configurações padrão da tabela
    const tableConfig = {
      head: [table.headers || []],
      body: table.rows,
      startY: cursorY,
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
      columnStyles: table.columnStyles || {}
    };

    // Gerar a tabela
    doc.autoTable(tableConfig);
    
    // Atualizar a posição Y para a próxima tabela
    cursorY = doc.lastAutoTable.finalY + 10;
  });

  // Rodapé em todas as páginas
  const addFooter = () => {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const pageNumber = doc.internal.getNumberOfPages();
    const bottomMargin = 10;

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Gerado por: ${generatedBy}`, margin, pageHeight - bottomMargin - 10);

    if (footerText) {
      doc.setFontSize(7);
      doc.text(footerText, margin, pageHeight - bottomMargin);
    }

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Página ${pageNumber}`, pageWidth - margin, pageHeight - bottomMargin, { align: 'right' });
  };

  // Adicionar rodapé e marca d'água em todas as páginas
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    addFooter();
    drawWatermark();
  }

  doc.save(filename || 'relatorio_sebadora.pdf');
};

export default templateExtractPDF;