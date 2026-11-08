import React, { useState, useEffect } from 'react';
import './FormRequisition.css';
import { findAccountRequestWhitConformance, findAccountPlanBudjectEntriesByYear } from 'services/accountService';
import Swal from 'sweetalert2';
import { generatePdf } from '../pdf/util/pdfUtils';
import { generatePdfForm2 } from '../pdf/util/pdfUtilsForm2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toWords } from 'number-to-words';
import logoMz from '../../assets/img/logoMz.png';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import styled from 'styled-components';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import config from '../../config/apiConfig.js'
import { BsFileEarmarkPdfFill, BsCheck2Circle, BsXCircleFill, BsFilter, BsDownload } from 'react-icons/bs';
import Spinner from '../../config/spinner/spinner';
import { FaSeedling, FaTimes } from 'react-icons/fa';
import templatePDF from '../BudgetChange/component/templatePDF'; // Caminho correto pro seu template


import {
  FaHandHoldingUsd,
  FaSearch,
  FaFileExcel,
  FaFilePdf,
  FaInfoCircle,
  FaServicestack
} from 'react-icons/fa';
import { MdOutlineFilterAlt, MdOutlineRefresh } from 'react-icons/md';

// Componentes estilizados
const PremiumContainer = styled.div`
  padding: 0.15rem 0;
`;

const HeaderCard = styled.div`
  background: linear-gradient(135deg, #0a2e38 0%, #1a4a5a 100%);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  color: white;
  
  &:before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    transform: rotate(30deg);
  }
`;

const ActionButton = styled.button`
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const StatusBadge = styled.span`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RequestSubmit = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [logoMzBase64, setLogoMzBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState([]);



  // Carregar requisições
  const loadRequests = () => {
    setLoading(true);
    findAccountRequestWhitConformance()
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao carregar requisições:', error);
        setLoading(false);
        Swal.fire('Erro', 'Não foi possível carregar as requisições', 'error');
      });
  };



  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await findAccountPlanBudjectEntriesByYear();

      console.log("Dados da resposta", response)
      setAccounts(response);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadRequests();

    // Carregar logo em base64
    const img = new Image();
    img.src = logoMz;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      setLogoMzBase64(canvas.toDataURL('image/png'));
    };
  }, []);

  // Filtrar e pesquisar requisições
  const filteredRequests = requests
    .filter((request) => {
      if (filter === 'PENDING') return request.conformance === 'PENDING_CONFORMANCE';
      if (filter === 'APPROVED') return request.conformance === 'CONFORMED';
      if (filter === 'REJECTED') return request.conformance === 'WITHOUT_CONFORMANCE';
      return true;
    })
    .filter((request) => {
      if (!searchTerm) return true;
      return (
        request.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestorDepartment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.totalRequestedValue?.toString().includes(searchTerm)
      )
    });


  // Atualizar status da requisição
  const updateRequestStatus = async (requestNumber, conformanceStatus, justification) => {
    try {
      const response = await fetch(`${config.BASE_URL}/sgf-api/internalrequest/updateInternalRequestStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestNumber,
          conformanceStatus,
          justification,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to update status');
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  };

  // Exportar para Excel
  const handleExportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredRequests.map(req => ({
        'Número': req.requestNumber,
        'Solicitante': req.requestorName,
        'Departamento': req.requestorDepartment,
        'Data': req.operationDate,
        'Valor ()': !isNaN(Number(req.totalRequestedValue))
          ? Number(req.totalRequestedValue).toFixed(2)
          : '0.00',
        'Status': req.conformance === 'PENDING_CONFORMANCE' ? 'Pendente' :
          req.conformance === 'CONFORMED' ? 'Aprovado' : 'Rejeitado',
        'Motivo': req.justification || 'N/A'
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Requisições');
    XLSX.writeFile(wb, `requisicoes_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Exportar para PDF
  const handleExportToPDF = () => {
    // 1. Título e subtítulo
    const title = "Relatório de Requisições";
    const subtitle = "Relatório de Requisições";
    const table = document.querySelector('#requestSubmit');
    const rows = Array.from(table.querySelectorAll('tr'));

    // 2. Cabeçalhos da tabela
    const headers = [
      ['#', 'Número', 'Solicitante', 'Departamento', 'Data', 'Valor']
    ];

    // 3. Dados da tabela principal
    const body = rows.slice(1).map(row =>
      Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
    );

    // 4. Dados do rodapé e metadados
    const footerText = "Documento gerado automaticamente";
    const logoImage = logoMz; // imagem base64 ou URL
    const savedUserData = JSON.parse(localStorage.getItem("userData"));
    const generatedBy = savedUserData.fullName.toString();
    const filename = "BalancetedeExecucaoOrçamental.pdf";

    // 5. Conteúdo da tabela no formato esperado pelo template
    const tableContent = {
      head: headers,
      body: body
    };

    // 6. Geração do PDF via template
    templatePDF({
      title,
      subtitle,
      tableContent,
      footerText,
      logoImage,
      generatedBy,
      filename
    });
  };
  // Visualizar requisição

  const handlePreview = (request) => {

    if (request.transactionType === "MULTIPLE_BENEFICIARIES") {
      console.log("requisicoes", request)

      handlePreviewV(request);
    } else {
      handlePreviewU(request);
    }

  }

  const handlePreviewU = (request) => {
    const currentDate = new Date().toISOString().split('T')[0];
    // const items = requisicoes;
    // setData(currentDate);
    console.log("Request", request)




    const tabelaProdutos = Array.isArray(request.items) ? request.items.map((req) => {
      const orcamentoNumero = req.accountPlanBudject?.number || "N/A";
      const orcamentoDescricao = req.accountPlanBudject?.description || "Sem descrição";
      const totalRequestedValue = parseFloat(req.totalAmount || 0).toFixed(2);
      const saldoInicial = parseFloat(req.saldoInicial || 0).toFixed(2);
      const saldoExistente = parseFloat(req.saldoExistente || 0).toFixed(2);

      const orcamentoNumeroData = accounts.filter(account =>
        account.accountPlan.writable === 'moviment' && account.accountPlan.number === orcamentoNumero
      );

      console.log("orcamentoNumeroData", orcamentoNumeroData)

      return [
        `${orcamentoNumero} - ${orcamentoDescricao}`,
        `${(orcamentoNumeroData[0].initialAllocation * 2.5).toFixed(2)}`,
        `${saldoInicial}`,
        `${totalRequestedValue}`,
        `${saldoExistente}`,
        // `${saldoExistente}`,
      ];
    }) : [];

    const tabelaProdutos1 = Array.isArray(request.items) ? request.items.map((req) => {
      const orcamentoNumero = req.accountPlanBudject?.number || "N/A";
      const descricao = req.description || "Sem descrição";
      const orcamentoDescricao = req.accountPlanBudject?.description || "Sem descrição";
      const totalRequestedValue = parseFloat(req.totalAmount || 0).toFixed(2);
      const saldoInicial = parseFloat(req.saldoInicial || 0).toFixed(2);
      const saldoExistente = parseFloat(req.saldoExistente || 0).toFixed(2);
      const quantidade = req.quantity;
      const unitPrice = req.unitPrice;


      const orcamentoNumeroData = accounts.filter(account =>
        account.accountPlan.writable === 'moviment' && account.accountPlan.number === orcamentoNumero
      );

      console.log("orcamentoNumeroData", orcamentoNumeroData)

      return [
        `${quantidade}`,
        `${descricao}`,
        `${(unitPrice || 0)}`,
        `${totalRequestedValue}`,
        `${orcamentoNumero} - ${orcamentoDescricao}`,
        // `${saldoExistente}`,
      ];
    }) : [];
    const createRequisitonAccount = {
      nomeRequerente: request.requestorName,
      departamentoRequerente: request.requestorDepartment,
      operationDate: currentDate,
      justification: request.justification,
      sectorBudject: request.sectorBudject,
      chapterBudject: "20A",
      clauseBudject: "10",
      clauseNumberBudject: "a",
      provideCode: "111",
      bank: "bank",
      accountPlanBudjectNumber: "request.accountPlanBudject",
      codigoFornecedor: `${request.accountPlanFinancial.number} - ${request.accountPlanFinancial.description}`,
      nomeFornecedor: request.accountPlanFinancial.description,
      disponibilidadeInicial: request.initialAvailabilityAccountBuject,
      saldoExistente: request.finalAccountBujectBalance,
      logoMzBase64: logoMzBase64,
      valorRequisicao: request.totalRequestedValue || 0,
      tabelaProdutos: tabelaProdutos,
      nomeEncarregado: request.requestorName,
      orcamento: "orcamento",
      financiamento: "",
      supplierName: "",
      justpificacao: "",
      requestNumber: request.requestNumber,
      tabelaProdutos1: tabelaProdutos1,
    };
    // const total = calcularTotal();
    generatePdf(createRequisitonAccount, true, setPreviewUrl);
    // setIsPreviewVisible(true);
  };

  const handlePreviewV = (request) => {

    const currentDate = new Date().toISOString().split('T')[0];

    const tabelaProdutos = Array.isArray(request.items) ? request.items.map((req) => {
      const orcamentoNumero = req.accountPlanBudject?.number || "N/A";
      const orcamentoDescricao = req.accountPlanBudject?.description || "Sem descrição";
      const totalRequestedValue = parseFloat(req.totalAmount || 0).toFixed(2);
      const saldoExistente = parseFloat(req.saldoExistente || 0).toFixed(2);
      const precoUnitario = parseFloat(req.unitPrice || 0).toFixed(2);
      const saldoInicial = parseFloat(req.saldoInicial || 0).toFixed(2);
      const quantidade = parseFloat(req.quantity || 0);
      const quantificacao = req.quantification || "";
      const descricao = req.description || "";
      const beneficiaryNameId = req.beneficiaryNameId || "";

      const beneficiaryFilter = accounts.filter(account =>
        account.accountPlan.writable === 'moviment' && account.accountPlan.id === beneficiaryNameId
      );

      const orcamentoNumeroData = accounts.filter(account =>
        account.accountPlan.writable === 'moviment' && account.accountPlan.number === orcamentoNumero
      );

      console.log("account Plan Number", beneficiaryFilter);

      // Verifica se existe pelo menos um item no array filtrado
      const beneficiary = beneficiaryFilter.length > 0
        ? `${beneficiaryFilter[0].accountPlan.number} - ${beneficiaryFilter[0].accountPlan.description}`
        : "";

      const saldoInicialRev = beneficiaryFilter.length > 0
        ? orcamentoNumeroData[0].initialAllocation
        : "";


      return [
        `${orcamentoNumero}`,
        `${(saldoInicialRev * 2.5).toFixed(2)}`,
        `${saldoInicial}`,
        `${totalRequestedValue}`,
        // `${beneficiary}`,
        `${saldoExistente}`,
      ];
    }) : [];


    const tabelaProdutos1 = Array.isArray(request.items) ? request.items.map((req) => {
      const orcamentoNumero = req.accountPlanBudject?.number || "N/A";
      const descricao = req.description || "Sem descrição";
      const orcamentoDescricao = req.accountPlanBudject?.description || "Sem descrição";
      const totalRequestedValue = parseFloat(req.totalAmount || 0).toFixed(2);
      const saldoInicial = parseFloat(req.saldoInicial || 0).toFixed(2);
      const saldoExistente = parseFloat(req.saldoExistente || 0).toFixed(2);
      const quantidade = req.quantity;
      const unitPrice = req.unitPrice;
      const beneficiaryNameId = req.beneficiaryNameId || "";
      const data = req.operationDate;
      const document = request.document;
      const documentNumber = request.documentNumber;

      const beneficiaryFilter = accounts.filter(account =>
        account.accountPlan.writable === 'moviment' && account.accountPlan.id === beneficiaryNameId
      );
      console.log("account Plan Number", beneficiaryFilter);

      // Verifica se existe pelo menos um item no array filtrado
      const beneficiary = beneficiaryFilter.length > 0
        ? `${beneficiaryFilter[0].accountPlan.number} - ${beneficiaryFilter[0].accountPlan.description}`
        : "";


      const orcamentoNumeroData = accounts.filter(account =>
        account.accountPlan.writable === 'moviment' && account.accountPlan.number === orcamentoNumero
      );

      console.log("orcamentoNumeroData", orcamentoNumeroData)

      return [
        `${beneficiary}`,
        `${data}`,
        `Factura`,
        `${documentNumber}`,
        `${quantidade}`,
        `${descricao}`,
        `${unitPrice}`,
        `${totalRequestedValue}`,
        `${orcamentoNumero}`,
      ];
    }) : [];

    const createRequisitonAccount = {
      nomeRequerente: request.requestorName,
      departamentoRequerente: request.requestorDepartment,
      operationDate: request.updatedAt,
      justification: "Teste de uma requisicao interna",
      sectorBudject: "Sector A",
      chapterBudject: "20A",
      clauseBudject: "10",
      clauseNumberBudject: "a",
      provideCode: "111",
      bank: "bank",
      accountPlanBudjectNumber: "",
      codigoFornecedor: "",
      nomeFornecedor: "",
      disponibilidadeInicial: "",
      saldoExistente: "",
      logoMzBase64: logoMzBase64,
      valorRequisicao: "calcularTotalv()",
      tabelaProdutos: tabelaProdutos,
      nomeEncarregado: "namePersonCharge",
      orcamento: "orcamento",
      financiamento: "financiamento",
      supplierName: "supplierName",
      justpificacao: "justification",
      requestNumber: request.requestNumber,
      tabelaProdutos1
    };
    // const total = calcularTotal();
    generatePdfForm2(createRequisitonAccount, true, setPreviewUrl);
    setPreviewUrl(true);
  };


  const handlePreviewss = (request) => {
    // setLoading(true);

    console.log("minha requisicao", request)

    const currentDate = new Date().toISOString().split('T')[0];
    const items = request.items || [];

    // Validação
    if (!request.requestorName || !request.requestorDepartment || !items.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Dados incompletos',
        text: 'Esta requisição não possui todos os dados necessários para visualização.',
        confirmButtonColor: '#1a4a5a',
      });
      setLoading(false);
      return;
    }

    const createRequisitonAccount = {
      nomeRequerente: request.requestorName,
      departamentoRequerente: request.requestorDepartment,
      operationDate: currentDate,
      justification: request.justification || "Requisição de fundos",
      accountPlanBudjectNumber: request.currentAccountBudjectBalance,
      codigoFornecedor: request.accountPlanFinancial?.number || '',
      nomeFornecedor: request.accountPlanFinancial?.description || '',
      disponibilidadeInicial: request.initialAvailabilityAccountBuject,
      saldoExistente: (request.initialAvailabilityAccountBuject) - (request.totalRequestedValue),
      logoMzBase64: logoMzBase64,
      valorRequisicao: request.totalRequestedValue,
      tabelaProdutos: items.map((req, index) => [
        (index + 1).toString(),
        req.description,
        `${req.unitPrice} `,
        `${(req.quantity * req.unitPrice).toFixed(2)} `,
      ]),
      nomeEncarregado: request.requestorName,
      orcamento: request.currentAccountBudjectBalance,
      financiamento: request.finalAccountBujectBalance,
      supplierName: request.accountPlanFinancial?.description || '',
      justpificacao: request.justification,
      requestNumber: request.requestNumber,
      bank: 111
    };

    generatePdf(createRequisitonAccount, true, (url) => {
      setPreviewUrl(url);
      setLoading(false);

      // Abrir em nova aba
      window.open(url, '_blank');
    });
  };

  // Aprovar requisição
  const handleConformRequest = (request) => {
    Swal.fire({
      title: 'Confirmar Conformidade',
      text: 'Deseja confirmar a conformidade desta requisição?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1a4a5a',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      focusConfirm: false,
      focusCancel: false
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        updateRequestStatus(request.requestNumber, true, "Conforme")
          .then(() => {
            loadRequests();
            Swal.fire({
              title: 'Sucesso!',
              text: 'Requisição confirmada com sucesso.',
              icon: 'success',
              confirmButtonColor: '#1a4a5a'
            });
          })
          .catch(() => {
            Swal.fire({
              title: 'Erro!',
              text: 'Não foi possível confirmar a requisição.',
              icon: 'error',
              confirmButtonColor: '#1a4a5a'
            });
          })
          .finally(() => setLoading(false));
      }
    });
  };

  // Rejeitar requisição
  const handleRejectRequest = (request) => {
    Swal.fire({
      title: 'Rejeitar Requisição',
      html: `
        <div class="text-left">
          <p>Por favor, informe o motivo da rejeição:</p>
          <textarea id="justification" class="form-control" rows="4" 
            placeholder="Descreva detalhadamente o motivo da rejeição..." 
            style="border-radius: 8px; border: 1px solid #ced4da;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar Rejeição',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      focusConfirm: false,
      preConfirm: () => {
        const justification = document.getElementById('justification').value;
        if (!justification.trim()) {
          Swal.showValidationMessage('O motivo da rejeição é obrigatório');
          return false;
        }
        return justification;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        updateRequestStatus(request.requestNumber, false, result.value)
          .then(() => {
            loadRequests();
            Swal.fire({
              title: 'Rejeitada!',
              text: 'Requisição rejeitada com sucesso.',
              icon: 'success',
              confirmButtonColor: '#1a4a5a'
            });
          })
          .catch(() => {
            Swal.fire({
              title: 'Erro!',
              text: 'Não foi possível rejeitar a requisição.',
              icon: 'error',
              confirmButtonColor: '#1a4a5a'
            });
          })
          .finally(() => setLoading(false));
      }
    });
  };


  // Visualizar detalhes da requisição
  const showRequestDetails = (request) => {
    const statusMap = {
      'PENDING_CONFORMANCE': { text: 'Pendente', color: '#ffc107' },
      'CONFORMED': { text: 'Aprovado', color: '#28a745' },
      'WITHOUT_CONFORMANCE': { text: 'Rejeitado', color: '#dc3545' }
    };

    const status = statusMap[request.conformance] || { text: 'Desconhecido', color: '#6c757d' };

    Swal.fire({
      title: `Requisição #${request.requestNumber}`,
      html: `
        <div class="text-left" style="font-size: 0.95rem;">
          <div class="d-flex mb-2">
            <div style="width: 130px; text-align: right;" class="font-weight-bold pe-2">Status:</div>
            <span class="badge" style="background-color: ${status.color}; color: white; padding: 5px 10px; border-radius: 20px;">
              ${status.text}
            </span>
          </div>
          
          <div class="d-flex mb-2">
            <div style="width: 130px; text-align: right;" class="font-weight-bold pe-2">Solicitante:</div>
            <div>${request.requestorName}</div>
          </div>
          <div class="d-flex mb-2">
            <div style="width: 130px; text-align: right;" class="font-weight-bold pe-2">Departamento:</div>
            <div>${request.requestorDepartment}</div>
          </div>
          <div class="d-flex mb-2">
            <div style="width: 130px; text-align: right;" class="font-weight-bold pe-2">Data:</div>
            <div>${request.operationDate}</div>
          </div>
          <div class="d-flex mb-2">
            <div style="width: 130px; text-align: right;" class="font-weight-bold pe-2">Valor:</div>
            <div>${Number(request.totalRequestedValue || 0).toFixed(2)}</div>
          </div>

            ${request.justification ? `
          <div class="d-flex mb-2">
            <div style="width: 130px; text-align: right;" class="font-weight-bold pe-2">Justificativa:</div>
            <div>${request.justification}</div>
          </div>
        ` : ''}
          
          ${request.items?.length ? `
            <div class="mt-3">
              <div class="font-weight-bold mb-2">Itens (${request.items.length})</div>
              <div style="max-height: 200px; overflow-y: auto;">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Descrição</th>
                      <th>Valor Unit.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${request.items.map((item, i) => `
                      <tr>
                        <td>${i + 1}</td>
                        <td>${item.description}</td>
                        <td>${item.unitPrice} </td>
                        <td>${(item.quantity * item.unitPrice).toFixed(2)} </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}
        </div>
      `,
      width: '700px',
      confirmButtonText: 'Fechar',
      confirmButtonColor: '#1a4a5a',
      showCloseButton: true
    });
  };

  return (
    <PremiumContainer>
      <Spinner isLoading={loading} />

      {/* Cabeçalho Compacto com Indicadores Rápidos na Mesma Linha */}
      <div className="sgf-page-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <h2 className="mb-0" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            Requisições de Fundos Submetidas
          </h2>
          <span
            onClick={() => setFilter('PENDING')}
            className="badge"
            style={{
              cursor: 'pointer',
              backgroundColor: filter === 'PENDING' ? '#fef3c7' : '#f8fafc',
              color: '#92400e',
              border: '1px solid #fde68a'
            }}
          >
            Pendentes: {requests.filter((r) => r.conformance === 'PENDING_CONFORMANCE').length}
          </span>
          <span
            onClick={() => setFilter('APPROVED')}
            className="badge"
            style={{
              cursor: 'pointer',
              backgroundColor: filter === 'APPROVED' ? '#dcfce7' : '#f8fafc',
              color: '#166534',
              border: '1px solid #86efac'
            }}
          >
            Aprovadas: {requests.filter((r) => r.conformance === 'CONFORMED').length}
          </span>
          <span
            onClick={() => setFilter('REJECTED')}
            className="badge"
            style={{
              cursor: 'pointer',
              backgroundColor: filter === 'REJECTED' ? '#ffe4e6' : '#f8fafc',
              color: '#be123c',
              border: '1px solid #fecdd3'
            }}
          >
            Rejeitadas: {requests.filter((r) => r.conformance === 'WITHOUT_CONFORMANCE').length}
          </span>
        </div>
        <button
          type="button"
          onClick={loadRequests}
          className="btn btn-secondary btn-sm"
        >
          <MdOutlineRefresh size={15} /> Atualizar
        </button>
      </div>

      {/* Tabela de Requisições com Barra de Filtro e Exportação na Mesma Linha */}
      <div className="card shadow-sm">
        <div className="card-header">
          <div className="d-flex align-items-center gap-2">
            <FaSeedling style={{ color: '#0f5132' }} />
            <span>Histórico e Estado das Requisições Submetidas ({filteredRequests.length})</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Pesquisar nº, solicitante ou depto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="form-select form-select-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="PENDING">Estado: Pendentes</option>
              <option value="APPROVED">Estado: Aprovadas</option>
              <option value="REJECTED">Estado: Rejeitadas</option>
              <option value="ALL">Estado: Todas</option>
            </select>

            <button
              type="button"
              onClick={handleExportToExcel}
              className="btn btn-sm btn-success"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              type="button"
              onClick={handleExportToPDF}
              className="btn btn-sm btn-danger"
            >
              <FaFilePdf /> PDF
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table
              id="requestSubmit"
              className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '16%' }}>Nº Requisição</th>
                  <th style={{ width: '20%' }}>Solicitante</th>
                  <th style={{ width: '16%' }}>Departamento</th>
                  <th style={{ width: '10%' }}>Data</th>
                  <th style={{ width: '13%' }} className="text-end">Valor (MZN)</th>
                  <th style={{ width: '10%' }} className="text-center">Estado</th>
                  <th style={{ width: '10%' }} className="text-center">Acções</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Nenhuma requisição encontrada para o filtro seleccionado.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const statusStyleMap = {
                      'PENDING_CONFORMANCE': {
                        text: 'Pendente',
                        bg: '#fef3c7',
                        color: '#92400e',
                        border: '#fde68a'
                      },
                      'CONFORMED': {
                        text: 'Aprovado',
                        bg: '#dcfce7',
                        color: '#166534',
                        border: '#86efac'
                      },
                      'WITHOUT_CONFORMANCE': {
                        text: 'Rejeitado',
                        bg: '#ffe4e6',
                        color: '#be123c',
                        border: '#fecdd3'
                      }
                    };

                    const status = statusStyleMap[request.conformance] || {
                      text: 'Desconhecido',
                      bg: '#f1f5f9',
                      color: '#475569',
                      border: '#cbd5e1'
                    };
                    return (
                      <tr
                        key={request.id}
                        className={selectedRow === request.id ? 'table-active' : ''}
                        onClick={() => setSelectedRow(request.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{request.id}</td>
                        <td>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              backgroundColor: '#eaf5ef',
                              color: '#0f5132',
                              padding: '2px 7px',
                              borderRadius: '5px'
                            }}
                          >
                            {request.requestNumber}
                          </span>
                        </td>
                        <td className="sgf-desc-cell" style={{ fontWeight: 600 }}>
                          {request.requestorName}
                        </td>
                        <td>{request.requestorDepartment}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{request.operationDate}</td>
                        <td className="text-end" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          {Number(request.totalRequestedValue || 0).toLocaleString('pt-PT', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                        <td className="text-center">
                          <span
                            className="badge"
                            style={{
                              backgroundColor: status.bg,
                              color: status.color,
                              border: `1px solid ${status.border}`
                            }}
                          >
                            {status.text}
                          </span>
                        </td>

                        <td className="text-center">
                          <div className="d-inline-flex align-items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                showRequestDetails(request);
                              }}
                              className="btn btn-sm btn-secondary"
                              title="Ver Detalhes"
                            >
                              <FaInfoCircle />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(request);
                              }}
                              className="btn btn-sm btn-info"
                              title="Visualizar PDF"
                            >
                              <BsFileEarmarkPdfFill />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal de Pré-visualização Premium */}
      {previewUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            width: '95vw',
            maxWidth: '1400px',
            height: '95vh',
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* Cabeçalho Premium */}
            <div style={{
              padding: '1.25rem 2rem',
              background: 'linear-gradient(145deg, #0a2e2a, #1d4b3e)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaFilePdf style={{ fontSize: '1.5rem', color: '#a1e6b3' }} />
                <h3 style={{
                  margin: 0,
                  fontWeight: '600',
                  fontSize: '1.5rem',
                  letterSpacing: '-0.5px'
                }}>
                  VISUALIZAÇÃO DO DOCUMENTO
                </h3>
              </div>

              <button
                onClick={() => setPreviewUrl(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'rotate(90deg)'
                  }
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Corpo do Modal Ampliado */}
            <div style={{
              flex: 1,
              position: 'relative',
              background: '#f8f9fa'
            }}>
              <iframe
                src={previewUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'white'
                }}
                title="Pré-visualização do Documento"
              />
            </div>
          </div>
        </div>
      )}
      {/* Rodapé Informativo */}
      <div className="mt-4 text-center text-muted small">
        <p>
          Sistema de Gestão Financeira | {new Date().getFullYear()} | Total de requisições: {requests.length}
        </p>
      </div>
    </PremiumContainer>
  );
};

export default RequestSubmit;
