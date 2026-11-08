import React, { useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const PdfGenerator = () => {
  const [nome, setNome] = useState("João");
  const [departamento, setDepartamento] = useState("Financeiro");
  const [codigoFornecedor, setCodigoFornecedor] = useState("12345");
  const [nomeFornecedor, setNomeFornecedor] = useState("Fornecedor XYZ");
  const [numeroRequisicao, setNumeroRequisicao] = useState("REQ-2024-001");
  const [justificacao, setJustificacao] = useState("Justificação exemplo");
  const [previewContent, setPreviewContent] = useState(null);

  const gerarRelatorio = (isPreview = false) => {
    // Definindo as variáveis de exemplo que podem ser passadas dinamicamente
    const nomeRequerente = "João Silva";
    const departamentoRequerente = "Financeiro";
    const codigoFornecedor = "12345";
    const nomeFornecedor = "Fornecedor XYZ";
    const numeroRequisicao = "RQ-2023-001";
    const orcamento = "R$ 1.000.000,00";
    const financeira = "R$ 800.000,00";
    const disponibilidadeInicial = "R$ 500.000,00";
    const saldoExistente = "R$ 300.000,00";
    const valorRequisicao = "R$ 100.000,00";
    const saldoFinal = "R$ 200.000,00";
    const justificacao = "Justificação financeira para a requisição.";
    const dataEncarregado = "01/11/2024";
    const nomeEncarregado = "Carlos Souza";
    const dataAdito = "02/11/2024";
    const nomeAdito = "Luciana Costa";
    
    const docDefinition = {
      content: [
        { text: "Relatório de Exemplo", fontSize: 20, alignment: "center", margin: [0, 0, 0, 10] },
        { text: "Tabela de Produtos", fontSize: 16, alignment: "center", margin: [0, 0, 0, 5] },
  
        // Linha de Classificação das Despesas
        {
          columns: [
            { text: "Classificação das Despesas: ", bold: true, margin: [0, 0, 10, 0] },
            { text: `Orçamentária: ${orcamento}`, margin: [0, 0, 10, 0] },
            { text: `Financeira: ${financeira}`, margin: [0, 0, 0, 0] },
          ],
          margin: [0, 0, 0, 10],
        },
  
        // Blocos de Dados do Requerente e Dados do Fornecedor
        {
          columns: [
            {
              stack: [
                { text: "Dados do Requerente", bold: true, margin: [0, 0, 0, 5] },
                { text: `Nome: ${nomeRequerente}` },
                { text: `Departamento: ${departamentoRequerente}` },
              ],
              width: "50%",
            },
            {
              stack: [
                { text: "Dados do Fornecedor", bold: true, margin: [0, 0, 0, 5] },
                { text: `Código: ${codigoFornecedor}` },
                { text: `Nome: ${nomeFornecedor}` },
                { text: `Número da Requisição: ${numeroRequisicao}` },
              ],
              width: "50%",
            },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 20],
        },
  
        // Tabela centralizada
        {
          style: "tableExample",
          table: {
            widths: ["auto", "*", "auto", "auto"],
            body: [
              [
                { text: "Quantidade", style: "tableHeader", alignment: "center" },
                { text: "Designação", style: "tableHeader", alignment: "center" },
                { text: "Preço Unitário", style: "tableHeader", alignment: "center" },
                { text: "Importância", style: "tableHeader", alignment: "center" },
              ],
              ["10", "Produto A", "R$ 20,00", "R$ 200,00"],
              ["5", "Produto B", "R$ 50,00", "R$ 250,00"],
              ["3", "Produto C", "R$ 100,00", "R$ 300,00"],
            ],
          },
          layout: "lightHorizontalLines",
        },
  
        // Retângulo de Disponibilidade e Justificação com bordas pretas
        {
          columns: [
            {
              stack: [
                { text: `Disponibilidade Inicial: ${disponibilidadeInicial}`, margin: [0, 5, 0, 5] },
                { text: `Saldo Existente: ${saldoExistente}`, margin: [0, 5, 0, 5] },
                { text: `Valor de Presente Requisição: ${valorRequisicao}`, margin: [0, 5, 0, 5] },
                { text: `Saldo Final: ${saldoFinal}`, margin: [0, 5, 0, 5] },
              ],
              width: "50%",
              style: "boxStyle", // Adicionando borda preta ao retângulo
            },
            {
              stack: [
                { text: `Justificação: ${justificacao}`, margin: [0, 5, 0, 5] },
              ],
              width: "50%",
              style: "boxStyle", // Adicionando borda preta ao retângulo
            },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 20],
        },
  
        // Montanha 1 (Encarregado)
        {
          columns: [
            {
              stack: [
                { text: `Data: ${dataEncarregado}`, margin: [0, 5, 0, 5] },
                { text: `Nome do Encarregado: ${nomeEncarregado}` },
              ],
              width: "50%",
              alignment: "left",
            },
  
            // Montanha 2 (Informação Financeira)
            {
              stack: [
                { text: "Informação", bold: true, fontSize: 14 },
                { text: "Tem cabimento e está em condições de ser autorizado, no entanto, VEX melhor decidirá", margin: [0, 5, 0, 5] },
                { text: `Data: ${dataAdito}`, margin: [0, 0, 0, 5] },
                { text: `Nome do Adito Financeiro: ${nomeAdito}` },
              ],
              width: "50%",
              alignment: "right",
            },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 20],
        },
      ],
      styles: {
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "black",
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        boxStyle: {
          border: [true, true, true, true], // Define borda preta
          padding: [10, 5, 10, 5],
        },
      },
    };
  
    if (isPreview) {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setPreviewContent(url);
      });
    } else {
      pdfMake.createPdf(docDefinition).open();
    }
  };

  return (
    <div className="container mt-4">
      <h2>Gerar Relatório em PDF</h2>

      <div className="form-group">
        <label>Nome do Requerente:</label>
        <input
          type="text"
          className="form-control"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Departamento:</label>
        <input
          type="text"
          className="form-control"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Código do Fornecedor:</label>
        <input
          type="text"
          className="form-control"
          value={codigoFornecedor}
          onChange={(e) => setCodigoFornecedor(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Nome do Fornecedor:</label>
        <input
          type="text"
          className="form-control"
          value={nomeFornecedor}
          onChange={(e) => setNomeFornecedor(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Número da Requisição:</label>
        <input
          type="text"
          className="form-control"
          value={numeroRequisicao}
          onChange={(e) => setNumeroRequisicao(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Justificação:</label>
        <textarea
          className="form-control"
          value={justificacao}
          onChange={(e) => setJustificacao(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" onClick={() => gerarRelatorio(true)}>
        Pré-visualizar PDF
      </button>
      <button className="btn btn-success" onClick={() => gerarRelatorio(false)}>
        Gerar PDF
      </button>

      {previewContent && (
        <div className="mt-4">
          <h4>Pré-visualização do Relatório:</h4>
          <iframe
            src={previewContent}
            width="100%"
            height="500px"
            frameBorder="0"
            title="Pré-visualização do Relatório"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default PdfGenerator;
