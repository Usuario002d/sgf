import { jsPDF } from "jspdf";
import 'jspdf-autotable';

/**
 * Gera um PDF com layout sofisticado, logo centralizado, cabeçalho confidencial e marca d'água no fundo.
 */
const templatePDF = ({
  title,
  subtitle,
  tableContent,
  footerText,
  logoImage,
  generatedBy,
  filename,
  monthFilter
}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.height; // Altura da página
  const margin = 40;

  let cursorY = 5;

  // Adiciona o logo no topo, centralizado e aumentado

  const logoWidth = 60;
  const logoHeight = 60;
  const logoX = (pageWidth - margin - logoWidth);
  const logoY = cursorY;

  // Adiciona o logo à direita
  if (logoImage) {
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
  }


  // Tamanho da marca d'água
  const watermarkText = 'SEBADORA';
  const watermarkFontSize = 7; // Tamanho ajustado para 20
  const step = 100; // Distância entre as repetições da marca d'água

  // Função para desenhar a marca d'água no fundo
  const drawWatermark = () => {
    doc.setFontSize(watermarkFontSize); // Tamanho ajustado
    doc.setTextColor(210, 210, 210); // Cor cinza ainda mais clara (simula uma opacidade menor)

    let xPos = 0;
    let yPos = 0;

    // Repetir marca d'água por toda a página, sem sobrepor o conteúdo
    for (xPos = 0; xPos < pageWidth; xPos += step) {
      for (yPos = 0; yPos < pageHeight; yPos += step) {
        doc.text(watermarkText, xPos + step / 2, yPos + step / 2, { align: 'center', angle: 45 });
      }
    }
  };

  // Desenha a marca d'água na primeira página
  drawWatermark();

  cursorY += 60; // Começa mais abaixo do topo

  // Título
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(title, margin, cursorY, { align: 'left' });

  cursorY += 15; // Deixa espaço abaixo do Título


  // Adiciona o mês do filtro apenas se existir
  if (monthFilter) {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(`Analise do Mes de : ${monthNames[monthFilter - 1]}`, margin, cursorY);
    cursorY += 15;
  }


  // Subtítulo
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.text(subtitle, margin, cursorY, { align: 'left' });

  cursorY += 15; // Deixa espaço abaixo do subtítulo



  // Data e Gerado por
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  const currentDate = new Date().toLocaleDateString("pt-PT");
  doc.text(`Data da Operação: ${currentDate}`, margin, cursorY);
  cursorY += 5;
  // doc.text(`Gerado por: ${generatedBy}`, margin, cursorY);
  cursorY += 5; // Espaço antes de começar a tabela


  // Tabela com layout profissional
  if (tableContent) {
    doc.autoTable({
      head: tableContent.head,
      body: tableContent.body,
      columnStyles: tableContent.columnStyles,
      startY: cursorY + 5,
      margin: { left: margin, right: margin },
      styles: {
        font: 'times',
        fontSize: 7, // Fonte ainda menor
        cellPadding: 3, // Menor espaçamento entre células
        overflow: 'linebreak',
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.1,
      headStyles: {
        fillColor: [200, 200, 200], // Cinza claro
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

        const bottomMargin = 10; // margem inferior

        // Rodapé do usuário (primeiro, mais acima)
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Gerado por: ${generatedBy}`, margin, pageHeight - bottomMargin - 10);

        // Rodapé padrão (logo abaixo do "Gerado por")
        if (footerText) {
          doc.setFontSize(7);
          doc.setTextColor(100);
          doc.text(footerText, margin, pageHeight - bottomMargin);
        }

        // Número da página (alinhado à direita na linha da frase padrão)
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Página ${pageNumber}`, pageWidth - margin, pageHeight - bottomMargin, { align: 'right' });

        // Marca d'água em todas as páginas
        drawWatermark();
      }
    });
  }

  doc.save(filename || 'relatorio_confidencial_e_elegante.pdf');
};

export default templatePDF;
