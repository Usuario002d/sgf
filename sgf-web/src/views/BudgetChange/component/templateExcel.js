import * as XLSX from 'xlsx';

/**
 * Gera um Excel com layout sofisticado similar ao PDF, com logo, título, subtítulo e tabela.
 */
const templateExcel = ({
  title,
  subtitle,
  tableContent,
  footerText,
  logoImage,
  generatedBy,
  filename
}) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([[]]); // Planilha vazia para adicionar dados

  // Ajuste do estilo geral
  const cellStyle = {
    alignment: { horizontal: 'center', vertical: 'center' },
    font: { bold: true, size: 12 },
    fill: { fgColor: { rgb: 'FFEECC' } }, // Cor do fundo (simulando o "card")
  };

  // Adicionar o logo (como imagem embutida)
  if (logoImage) {
    // Adicionar a imagem do logo na planilha (embutido, se necessário)
    const img = new Image();
    img.src = logoImage;
    img.onload = function () {
      const imgData = img.src.split(',')[1]; // Converte a imagem para base64
      const logoRef = XLSX.utils.create_img({ data: imgData, type: 'png' });
      ws['!images'] = [{ name: 'logo.png', image: logoRef }];
    };
  }

  // Adiciona título
  ws['A1'] = { v: title, s: { ...cellStyle, font: { ...cellStyle.font, size: 16 } } };
  ws['A1'].s.alignment.horizontal = 'center'; // Centraliza título

  // Adiciona subtítulo
  ws['A2'] = { v: subtitle, s: { ...cellStyle, font: { ...cellStyle.font, size: 12, italic: true } } };
  ws['A2'].s.alignment.horizontal = 'center'; // Centraliza subtítulo

  // Adiciona o card de confidencialidade
  const confidentialText = 
    "Este documento é confidencial. Seu conteúdo é reservado e de uso exclusivo das partes autorizadas. A reprodução,\n" + 
    "distribuição ou divulgação sem autorização é estritamente proibida sob penalidade legal.";

  ws['A3'] = { v: confidentialText, s: { ...cellStyle, font: { ...cellStyle.font, size: 8, italic: true } } };
  ws['A3'].s.alignment.horizontal = 'center'; // Centraliza o texto do card

  // Adiciona "Data da Operação" e "Gerado por"
  ws['A4'] = `Data da Operação: ${new Date().toLocaleDateString('pt-PT')}`;
  ws['A5'] = `Gerado por: ${generatedBy}`;

  // Adiciona a tabela
  if (tableContent && tableContent.head && tableContent.body) {
    const tableHeaders = tableContent.head;
    const tableRows = tableContent.body;

    // Define o cabeçalho da tabela
    tableHeaders.forEach((header, index) => {
      ws[XLSX.utils.encode_cell({ r: 6, c: index })] = { v: header, s: cellStyle };
    });

    // Adiciona o conteúdo da tabela
    tableRows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: 7 + rowIndex, c: colIndex });
        ws[cellRef] = { v: cell, s: { ...cellStyle, font: { ...cellStyle.font, size: 8 } } };
      });
    });
  }

  // Adiciona rodapé
  ws['A' + (7 + tableContent.body.length)] = { v: footerText, s: { alignment: { horizontal: 'center' }, font: { size: 8 } } };

  // Salva o arquivo Excel
  XLSX.utils.book_append_sheet(wb, ws, "Planilha de Dados");
  XLSX.writeFile(wb, filename || 'relatorio_confidencial.xlsx');
};

export default templateExcel;
