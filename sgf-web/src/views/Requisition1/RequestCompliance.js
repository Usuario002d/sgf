import React, { useState, useEffect } from 'react';
import './FormRequisition.css';
import { findAccountRequestWhitConformance } from 'services/accountService'; // Ajuste o caminho do serviço conforme necessário
import Swal from 'sweetalert2';
import { generatePdf } from '../pdf/util/pdfUtils'; // Ajuste o caminho conforme necessário
import 'bootstrap/dist/css/bootstrap.min.css';
import { toWords } from 'number-to-words';
import logoMz from '../../assets/img/logoMz.png';
import config from '../../config/apiConfig.js'


const RequestCompliance = () => {
  const [requests, setRequests] = useState([]); // Lista de requisições
  const [filter, setFilter] = useState('PENDING'); // Filtro atual: 'PENDING', 'APPROVED', ou 'REJECTED'
  const [previewUrl, setPreviewUrl] = useState(null); // URL do preview do PDF
  const [selectedRow, setSelectedRow] = useState(null); // Linha selecionada
  const [logoMzBase64, setLogoMzBase64] = useState('');

  useEffect(() => {
    // Carregar todas as requisições
    findAccountRequestWhitConformance()
      .then((data) => {
        setRequests(data);
        console.log("data", data);
      })
      .catch((error) => {
        console.error('Erro ao carregar requisições:', error);
      });
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = logoMz; // Usando a imagem importada
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      console.log("dataURL", dataURL)
      setLogoMzBase64(dataURL);
    };
    img.onerror = () => {
      console.error("Erro ao carregar a imagem.");
    };
  }, []);

  // Filtrar requisições com base no filtro atual
  const filteredRequests = requests.filter((request) => {
    if (filter === 'PENDING') return request.conformance === 'PENDING_CONFORMANCE';
    if (filter === 'APPROVED') return request.conformance === 'CONFORMED';
    if (filter === 'REJECTED') return request.conformance === 'WITHOUT_CONFORMANCE';
    return true;
  });

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
        const updatedRequest = await response.json();
        return updatedRequest;
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  };

  const [operationDate, setData] = useState('');



  const handlePreview = (request) => {

    console.log("request", request)

    const currentDate = new Date().toISOString().split('T')[0];

    const items = request.items;
    const nomeRequerente = request.requestorName;
    const departamento = request.requestorDepartment;
    const orcamento = request.currentAccountBudjectBalance;
    const financiamento = request.finalAccountBujectBalance;
    const bank = 111;


    setData(currentDate);

    // Validação dos campos obrigatórios
    if (!nomeRequerente || !departamento || !orcamento || !financiamento || !items || !bank || items.length === 0) {
      let missingFields = [];

      console.log("ORcamento", orcamento)

      if (!nomeRequerente) missingFields.push("Nome do Requerente");
      if (!departamento) missingFields.push("Departamento");
      if (!orcamento) missingFields.push("Orçamento");
      if (!financiamento) missingFields.push("Financiamento");
      if (!items || items.length === 0) missingFields.push("Requisições");
      if (!bank || bank.length === 0) missingFields.push("Banco");


      // Exibe um alerta se algum campo estiver vazio
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios não preenchidos',
        text: `Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`,
        confirmButtonText: 'Ok',
        confirmButtonColor: '#FF5733', // Cor personalizada do botão
      }).then(() => {
        setLoading(false); // Desativa o carregamento após a mensagem
      });

      return; // Impede o envio se os campos não forem preenchidos
    }
    console.log("Request", createRequisitonAccount)

    const tabelaProdutos = items.map((req, index) => [
      (index + 1).toString(),
      req.description,
      `${req.unitPrice} MZN`,
      `${(req.quantity * req.unitPrice).toFixed(2)} MZN`, // Calculando o valor total baseado em quantity e unitPrice
    ]);

    const createRequisitonAccount = {
      nomeRequerente: nomeRequerente,
      departamentoRequerente: departamento,
      operationDate: currentDate,
      justification: "Teste de uma requisicao interna",
      sectorBudject: "Sector A",
      chapterBudject: "20A",
      clauseBudject: "10",
      clauseNumberBudject: "a",
      provideCode: "111",
      bank: bank,
      accountPlanBudjectNumber: orcamento,
      codigoFornecedor: request.accountPlanFinancial.number,
      nomeFornecedor: request.accountPlanFinancial.description,
      disponibilidadeInicial: request.initialAvailabilityAccountBuject,
      saldoExistente: (request.initialAvailabilityAccountBuject) - (request.totalRequestedValue),
      logoMzBase64: logoMzBase64,
      valorRequisicao: request.totalRequestedValue,
      tabelaProdutos: tabelaProdutos, // Adicionando a tabela de produtos ao objeto
      nomeEncarregado: request.requestorName,
      orcamento: orcamento,
      financiamento: financiamento,
      supplierName: request.accountPlanFinancial.description,
      justpificacao: request.justification,
      requestNumber: request.requestNumber

    };

    const total = request.totalRequestedValue;

    generatePdf(

      createRequisitonAccount,
      true,
      setPreviewUrl
    );
  };







  const handleConformRequest = (request) => {
    Swal.fire({
      title: 'Você tem certeza?',
      text: 'Deseja confirmar a conformidade dessa requisição?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, confirmar!',
      cancelButtonText: 'Não, cancelar',
    }).then((result) => {
      if (result.isConfirmed) {

        const just = "Conforme";
        // Enviar para a API para atualizar o status
        updateRequestStatus(request.requestNumber, true, just).then((updatedRequest) => {
          // Atualizar a requisição no estado local após confirmação bem-sucedida
          const updatedRequests = requests.map((req) =>
            req.id === request.id ? { ...req, conformance: 'CONFORMED', justification: just } : req
          );

          console.log("requisicao", updatedRequests)
          setRequests(updatedRequests);

          // Exibir a mensagem de sucesso após a atualização
          Swal.fire('Confirmado!', 'A requisição foi dada conformidade.', 'success');
          console.log('Request updated', updatedRequest);
        }).catch((error) => {
          console.error('Error updating request', error);
          // Exibir mensagem de erro se a API falhar
          Swal.fire('Erro!', 'Houve um problema ao atualizar a requisição.', 'error');
        });
      }
    });
  };

  const handleRejectRequest = (request) => {
    Swal.fire({
      title: 'Justifique a rejeição',
      input: 'textarea',
      inputLabel: 'Motivo da rejeição',
      inputPlaceholder: 'Digite o motivo da rejeição...',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: (inputValue) => {
        if (!inputValue.trim()) {
          Swal.showValidationMessage('O motivo da rejeição é obrigatório!');
          return false;
        }
        return inputValue;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Enviar para a API para atualizar o status
        updateRequestStatus(request.requestNumber, false, result.value).then((updatedRequest) => {
          // Atualizar o estado da requisição após a atualização no back-end
          const updatedRequests = requests.map((req) =>
            req.id === request.id
              ? { ...req, conformance: 'REJECTED_CONFORMANCE', justification: result.value }
              : req
          );
          console.log("requisicao", updatedRequests)

          setRequests(updatedRequests);

          // Exibir a mensagem de sucesso após a atualização
          Swal.fire('Rejeitada!', 'A requisição foi rejeitada com sucesso.', 'success');
          console.log('Request updated', updatedRequest);
        }).catch((error) => {
          console.error('Error updating request', error);
          // Exibir mensagem de erro se a API falhar
          Swal.fire('Erro!', 'Houve um problema ao rejeitar a requisição.', 'error');
        });
      }
    });
  };

  const handleRowClick = (request) => {
    setSelectedRow((prev) => (prev === request.id ? null : request.id));
  };

  return (
    <div className="container mt-5">
      <header className="text-center mb-4">
        <h3 className="header text-center" style={{ fontWeight: "bold", backgroundColor: "#264f36", color: "white" }}>
          Conformidade das Requisições</h3>
      </header>

      {/* Botões de Filtro */}
      <div className="d-flex justify-content-center mb-4">
        <button
          className={`btn btn-success mx-2 ${filter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setFilter('PENDING')}
        >
          Pendentes
        </button>
        <button
          className={`btn btn-success mx-2 ${filter === 'APPROVED' ? 'active' : ''}`}
          onClick={() => setFilter('APPROVED')}
        >
          Aprovadas
        </button>
        <button
          className={`btn btn-success mx-2 ${filter === 'REJECTED' ? 'active' : ''}`}
          onClick={() => setFilter('REJECTED')}
        >
          Rejeitadas
        </button>
      </div>

      {/* Tabela de Requisições */}
      <div className="table-responsive" style={{ height: '400px', overflowY: 'scroll', backgroundColor: '#E6E6E6' }}>
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Número da Requisição</th>
              <th>Solicitante</th>
              <th>Departamento</th>
              <th>Data de Operação</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr
                key={request.id}
                className={selectedRow === request.id ? 'table-active' : ''}
                onClick={() => handleRowClick(request)}
              >
                <td>{request.id}</td>
                <td>{request.requestNumber}</td>
                <td>{request.requestorName}</td>
                <td>{request.requestorDepartment}</td>
                <td>{request.operationDate}</td>
                <td>{request.totalRequestedValue?.toFixed(2) || '0.00'} MZN</td>
                <td>
                  <button
                    onClick={() => handlePreview(request)}
                    className="btn btn-info btn-sm mx-1"
                  >
                    Visualizar PDF
                  </button>
                  {filter === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleConformRequest(request)}
                        className="btn btn-success btn-sm mx-1"
                      >
                        Dar Conformidade
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request)}
                        className="btn btn-danger btn-sm mx-1"
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                  {filter === 'REJECTED' && (
                    <span className="ml-2">Motivo: {request.justification || 'Não informado'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pré-visualização do PDF */}
      {previewUrl && (
        <div className="text-center mt-4">
          <iframe src={previewUrl} width="100%" height="500px" />
        </div>
      )}
    </div>
  );
};

export default RequestCompliance;
