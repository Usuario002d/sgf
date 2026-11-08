import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

/**
 * Gera um documento PDF com os dados fornecidos.
 * @param {Object} data - Dados do relatório.
 * @param {boolean} isPreview - Define se o PDF será apenas pré-visualizado.
 * @param {Function} [callback] - Função callback para pré-visualização (opcional).
 */
export const generatePdf = (data, isPreview, callback) => {
  const {
    nomeRequerente = "",
    departamentoRequerente = "",
    codigoFornecedor = "",
    nomeFornecedor = "",
    numeroRequisicao = "",
    orcamento = "",
    requestNumber = "",
    financeira = "",
    disponibilidadeInicial = "",
    saldoExistente = "",
    valorRequisicao = "",
    saldoFinal = "",
    justification = "",
    dataEncarregado = "",
    financiamento = "",
    nomeEncarregado = "",
    dataAdito = "",
    nomeAdito = "",
    logoMzBase64 = "", // Imagem base64
    tabelaProdutos = [],
    orcamentoDescription = "",
    tabelaProdutos1,
    documento
  } = data;

  console.log("data", data)

  // Verifique se logoMzBase64 está vazio ou inválido, e forneça uma imagem padrão
  const logoImage = logoMzBase64 || 'data:image/png;base64,...'; // Insira sua imagem base64 padrão aqui se necessário

  const docDefinition = {
    content: [
      {
        image: logoImage,
        fit: [200, 80], // Largura x Altura máxima permitida
        alignment: "center",
        margin: [0, 0, 0, 10],
      },      
      { text: "Embaixada da República de Moçambique", fontSize: 14, alignment: "center", margin: [0, 0, 0, 0] },

      {
        text: [
          { text: "Requisição Interna Nº: " },
          { text: requestNumber, bold: true }
        ],
        fontSize: 10,
        alignment: "center",
        margin: [0, 5, 0, 20], // Ajusta a margem superior para melhor espaçamento
      },
      {
        columns: [
          {
            stack: [
              { text: "Visto", bold: true, margin: [0, 0, 0, 1], alignment: "center" },
              { text: "Julgo de autorizar", margin: [0, 0, 0, 5], alignment: "center" },
              { text: "Data: _______ / ________ / _______", margin: [0, 0, 0, 1], alignment: "center" },
              { text: "Adito Financeiro", margin: [0, 0, 0, 1], alignment: "center",bold:true },
              { text: "........................................................", margin: [0, 0, 0, 0], alignment: "center" },
            ],
            width: "50%",
            style: "boxStyle",
            alignment: "center",
            fontSize: 8 // <<< Aqui define para todos os itens do stack
          },
          {
            stack: [
              { text: "Autorizo", bold: true, margin: [0, 0, 0, 1], alignment: "center" },
              { text: "Aquisição e pagamento", margin: [0, 0, 0, 5], alignment: "center" },
              { text: "Data: _______ / ________ / _______", margin: [0, 0, 0, 1], alignment: "center" },
              { text: "A Chefe da Missão", margin: [0, 0, 0, 1], alignment: "center" },
              { text: "........................................................", margin: [0, 0, 0, 0], alignment: "center" },
            ],
            width: "50%",
            style: "boxStyle",
            alignment: "center",
            fontSize: 8 // <<< Aqui também
          },
        ],
        columnGap: 150,
        margin: [0, 0, 0, 40],
      },
      // Dados do Requerente e Fornecedor em Cards com bordas pretas
      {
        columns: [
          {
            stack: [
              { text: "Dados do Requerente", bold: true, margin: [0, 0, 0, 5] },
              {
                text: [
                  { text: "Nome: ", bold: true },
                  { text: nomeRequerente }
                ]
              },
              {
                text: [
                  { text: "Departamento: ", bold: true },
                  { text: departamentoRequerente }
                ]
              },
            ],
            width: "50%",
            fontSize: 8,
          },
          {
            stack: [
              { text: "Dados do Fornecedor", bold: true, margin: [0, 0, 0, 5] },
              {
                text: [
                  { text: "Código/Nome: ", bold: true },
                  { text: codigoFornecedor }
                ]
              },
              {
                text: [
                  { text: "Documento: ", bold: true },
                  { text: documento }
                ]
              },
            ],
            width: "50%",
            alignment: "right", // Alinha o stack à direita
            margin: [0, 0, 0, 0], // Ajuste de margem se necessário
            fontSize: 8,
          },
        ],
        columnGap: 10,
        margin: [0, 0, 0, 20],
        fontSize: 8,
      },
      {
        style: "tableExample",
        table: {
          widths: ["auto", "*", "auto", "auto", "auto"],
          body: [
            [
              { text: "Quantidade", style: "tableHeader", alignment: "center", fontSize: 8 },
              { text: "Descrição", style: "tableHeader", alignment: "center", fontSize: 8 },
              { text: "Preço", style: "tableHeader", alignment: "center", fontSize: 8 },
              { text: "Importância", style: "tableHeader", alignment: "center", fontSize: 8 },
              { text: "Classificação Orçamental", style: "tableHeader", alignment: "center", fontSize: 8 },
            ],
            ...tabelaProdutos1.map(linha =>
              linha.map(celula => ({
                text: celula.text || celula,
                alignment: "center",
                fontSize: 8,
                margin: [0, 0, 0, 0], // sem padding interno (pode ajustar margin para zero)
              }))
            ),
          ],
        },
        layout: {
          hLineWidth: function (i, node) {
            return 1; // todas as linhas horizontais com 1px de largura
          },
          vLineWidth: function (i, node) {
            return 1; // todas as linhas verticais com 1px de largura
          },
          hLineColor: function (i, node) {
            return "black"; // cor preta nas linhas horizontais
          },
          vLineColor: function (i, node) {
            return "black"; // cor preta nas linhas verticais
          },
          paddingLeft: function (i, node) { return 2; },   // sem padding à esquerda
          paddingRight: function (i, node) { return 2; },  // sem padding à direita
          paddingTop: function (i, node) { return 2; },    // sem padding acima
          paddingBottom: function (i, node) { return 0; }  // sem padding abaixo
        }
      },

      {
        columns: [
          {
            stack: [
              { text: `Importa a Presente Requisição em : ${valorRequisicao}`, margin: [0, 5, 0, 5], fontSize: 7 },
            ],
            width: "50%",
            style: "boxStyle",
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 0],
      },

      {
        columns: [
          {
            stack: [
              { text: `Pela verba do Sector _______ Capítulo _____ Artigo ______ Nr _____ cuja situação é a seguinte:`, margin: [0, 5, 0, 5], fontSize: 7 },
            ],
            width: "100%",
            style: "boxStyle",
          },
        ],
        columnGap: 10,
        margin: [0, 0, 0, 20],
      },

      ,
      {
        style: "tableExample",
        table: {
          widths: ["auto", "*", "auto", "auto", "auto"],
          body: [
            [
              { text: "Class.Orç", style: "tableHeader", alignment: "center", fontSize: 8 },
              { text: "Disponivel Inicial", style: "tableHeader", alignment: "center", fontSize: 8 },
              { text: "Saldo Existente", style: "tableHeader", alignment: "center", fontSize: 8 },
              { text: "Valor da PresenteRequisição ", style: "tableHeader", alignment: "center", fontSize: 8 },
              { text: "Saldo Final", style: "tableHeader", alignment: "center", fontSize: 8 },
            ],
            ...tabelaProdutos.map(linha =>
              linha.map(celula => ({
                text: celula.text || celula,
                alignment: "center",
                fontSize: 8,
                margin: [0, 0, 0, 0], // sem padding interno (pode ajustar margin para zero)
              }))
            ),
          ],
        },
        layout: {
          hLineWidth: function (i, node) {
            return 1; // todas as linhas horizontais com 1px de largura
          },
          vLineWidth: function (i, node) {
            return 1; // todas as linhas verticais com 1px de largura
          },
          hLineColor: function (i, node) {
            return "black"; // cor preta nas linhas horizontais
          },
          vLineColor: function (i, node) {
            return "black"; // cor preta nas linhas verticais
          },
          paddingLeft: function (i, node) { return 2; },   // sem padding à esquerda
          paddingRight: function (i, node) { return 2; },  // sem padding à direita
          paddingTop: function (i, node) { return 2; },    // sem padding acima
          paddingBottom: function (i, node) { return 0; }  // sem padding abaixo
        }
      },
      {
        columns: [
          {
            stack: [
              { text: `Justificativo _________________________________________________________________________________________________________________________________________________`, margin: [0, 5, 0, 5], fontSize: 7 },
            ],
            width: "100%",
            style: "boxStyle",
          },
        ],
        columnGap: 10,
        margin: [0, 0, 0, 20],
      },

      {
        columns: [
          {
            stack: [
              { text: "............ / ............ /202__", margin: [0, 0, 0, 1], alignment: "center" },
              { text: "Encarregado", margin: [0, 0, 0, 1], alignment: "center", bold:true},
              { text: "........................................................", margin: [0, 0, 0, 0], alignment: "center" },
            ],
            width: "50%",
            style: "boxStyle",
            alignment: "center",
            fontSize: 8 // <<< Aqui define para todos os itens do stack
          },
          {
            stack: [
              { text: "Informação", bold: true, margin: [0, 0, 0, 1], alignment: "center", bold: true },
              { text: "Tem cabimento e está em condições de ser", margin: [0, 0, 0, 5], alignment: "center" },
              { text: "autorizado. No entanto, V. Ex.ª melhor decidirá.", margin: [0, 0, 0, 5], alignment: "center" },
              { text: "............ / ............ /202__", margin: [0, 0, 0, 1], alignment: "center" },
              { text: "Adito Financeiro", margin: [0, 0, 0, 1], alignment: "center",bold:true },
              { text: "........................................................", margin: [0, 0, 0, 0], alignment: "center" },
            ],
            width: "50%",
            style: "boxStyle",
            alignment: "center",
            fontSize: 8 // <<< Aqui também
          },
        ],
        columnGap: 150,
        margin: [0, 0, 0, 40],
      }
    ],
    styles: {
      tableHeader: { bold: true, fontSize: 11, color: "black" },
      tableExample: { margin: [0, 5, 0, 15] },
      boxStyle: { border: [true, true, true, true], padding: [10, 5, 10, 5] },
      // Estilo do card
      cardStyleLeft: {
        border: [true, true, true, true],
        padding: [10, 5, 10, 5],
        borderColor: "black",
      },
      cardStyleRight: {
        border: [true, true, true, true],
        padding: [10, 5, 10, 5],
        borderColor: "black",
      },
    },
  };

  if (isPreview && callback) {
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob) => {
      const url = URL.createObjectURL(blob);
      callback(url);
    });
  } else {
    pdfMake.createPdf(docDefinition).open();
  }
};
