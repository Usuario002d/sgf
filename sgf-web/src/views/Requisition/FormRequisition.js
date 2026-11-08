import React, { useEffect, useState } from 'react';
import './FormRequisition.css';
import { findAccountPlanBudjectEntriesByYear, getRegisteredAccounts, fetchAllAccountingJournalAll, findAccountRequestWhitConformance, findConformInitialAllocation, fetchAllAccountingJournal40, findAccountPlanAccountAssociateByYear } from 'services/accountService';
import { generatePdf } from '../pdf/util/pdfUtils';  // Ajuste o caminho conforme necessário
import { generatePdfForm2 } from '../pdf/util/pdfUtilsForm2';  // Ajuste o caminho conforme necessário
import Swal from 'sweetalert2';
import { requisitionCreate } from 'services/accountService';
import logoMz from '../../assets/img/logoMz.png';
import Spinner from '../../config/spinner/spinner';
import { FaHandHoldingUsd, FaFileAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import PremiumFormDisplay from './PremiumFormDisplay.js';
import PremiumFormDisplay2 from './PremiumFormDisplay2.js';
import { cleanData } from 'jquery';


const FormRequisition = () => {
  const [quantity, setQuantidade] = useState('');
  const [description, setDesignacao] = useState('');
  const [justification, setJustification] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [unitPrice, setPrecounit] = useState('');
  const [operationDate, setData] = useState('');

  const [operationDateR, setOperationDateR] = useState('');
  const [numberF, setNumberF] = useState('');

  const [isConformed, setIsConformed] = useState(false);

  const [hora, setHora] = useState('');
  const [documents, setDocuments] = useState([]);
  const [quantification, setUnidades] = useState('KG');
  const [requisicoes, setRequisicoes] = useState([]);
  const [requisicoesv, setRequisicoesV] = useState([]);
  const [orcamento, setOrcamento] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [financiamento, setFinanciamento] = useState('');
  const [financiamentoView, setFinanciamentoView] = useState('');
  const [orcamentoView, setOrcamentoView] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [supplierName, setSupplierName] = useState(null);
  const [codFinancial, setCodFinancial] = useState(null);
  const [nomeRequerente, setNomeRequerente] = useState(null);
  const [nomeAditoFinanceiro, setNomeAditoFinanceiro] = useState(null);
  const [numeroRequisicao, setNumeroRequisicao] = useState("");
  const [initialAllocation, setInitialAllocation] = useState("");
  const [finallAllocation, setfinalAllocation] = useState("");
  const [saldoDisponivel, setSaldoDisponivel] = useState("");
  const [bank, setBank] = useState("");
  const [namePersonCharge, setNamePersonCharge] = useState("Carlos Fernando");
  const [contasAssociadas, setContasAssociadas] = useState([]);
  const [Accountts1, setAccounts1] = useState([]);
  const [newRequestNumber, setNewRequestNumber] = useState('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [visibleForm1, setVisibleForm1] = useState(true);
  const [visibleForm2, setVisibleForm2] = useState(false);



  //NOVAS VARIAVEIS
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [accounts, setAccounts] = useState([]);
  const [accountsSelect, setAccountsSelect] = useState([]);
  // const [formData, setFormData] = useState({
  //   value: ""
  // });


  const [formData, setFormData] = useState(null)
  const [selectedForm, setSelectedForm] = useState("form1");

  const handleFormChange = (e) => {
    setSelectedForm(e.target.value);

    setQuantidade('');
    setDesignacao('');
    setJustification('');
    setBeneficiaryName('');
    setPrecounit('');
    setData('');
    setOperationDateR('');
    setNumberF('');
    setRequisicoesV([]);
    setDepartamento('');
    setSupplierName(null);
    setCodFinancial(null);
    setNomeRequerente(null);
    setFormOpen({
      documentNumber: "",
      documentDescription: "",
      value: "",
    });
    console.log("Formulario trocado e campos limpos:", e.target.value);
  };
  const findAccountPlanConformance = async () => {
    try {
      setLoading(true);
      const response = await findConformInitialAllocation();
      setIsConformed(response);
    } catch (error) {
      console.error("Erro ao buscar conformidade:", error);
    } finally {
      setLoading(false);
    }
  };
  const [formOpen, setFormOpen] = useState({
    documentNumber: "",
    documentDescription: "",
    value: "",
  });

  const [logoMzBase64, setLogoMzBase64] = useState('');

  const loadAccounts1 = async () => {
    try {
      setLoading(true);
      const response = await getRegisteredAccounts();
      setAccounts1(response);
      console.log("Contas RecebidasKJSKAJSDKJBSAKJBDKJA:", response);

    } catch (error) {
      console.error("Erro ao carregar as contas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeBank = (e) => {
    const selectedNumber = e.target.value; // Use o parâmetro correto (e)

    setBank(selectedNumber);
  }


  const handleChangeBeneficiaryName = (e) => {
    const selectedValue = e.target.value;
    setBeneficiaryName(selectedValue);
  };

  useEffect(() => {
    const savedUserData = JSON.parse(localStorage.getItem("userData"));

    if (savedUserData && savedUserData.fullName) {
      const userFullName = savedUserData.fullName.toString();
      setNamePersonCharge(userFullName);
      console.log("savedUserData", userFullName);
    } else {
      console.log("Nenhum dado encontrado.");
    }
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = logoMz;
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

  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase(); // String randômica
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Número aleatório de 4 dígitos
    const currentDate = new Date().toISOString().split("T")[0]; // Data atual no formato YYYY-MM-DD
    const requisicao = `${randomString}-${randomNumber}-${currentDate}`;
    setNumeroRequisicao(requisicao);
  }, []);
  const loadDiariesWithDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetchAllAccountingJournalAll();
      setDiaries(response);

      const validNumbers = ['101', '102', '509', '510'];
      const filteredDocuments = response.flatMap(journal =>
        (journal.documents || []).filter(doc =>
          validNumbers.includes(doc.documentNumber)
        )
      );
      console.log("Diários e Documentos Recebidos:", filteredDocuments);

      setDocuments(filteredDocuments);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isSaldoValido = () => {
    let saldoAnterior = 0;
    for (let i = 0; i < requisicoes.length; i++) {
      let requisicao = requisicoes[i];
      let saldoExistente = i === 0 ? requisicao.availableAllocation || 0 : saldoAnterior;
      const saldoFinal = saldoExistente - (requisicao.importancia || 0);
      if (saldoFinal < 0) {
        return false; // saldo negativo detectado
      }
      saldoAnterior = saldoFinal;
    }
    return true;
  };


  const isSaldoValidoV = () => {
    let saldoAnterior = 0;
    for (let i = 0; i < requisicoesv.length; i++) {
      let requisicao = requisicoesv[i];
      let saldoExistente = i === 0 ? requisicao.availableAllocation || 0 : saldoAnterior;
      const saldoFinal = saldoExistente - (requisicao.importancia || 0);
      if (saldoFinal < 0) {
        return false; // saldo negativo detectado
      }
      saldoAnterior = saldoFinal;
    }
    return true;
  };

  const generateNextRequestNumber = (requests) => {
    // Verificar a última requisição
    if (requests.length > 0) {
      const lastRequest = requests[requests.length - 1]; // Pega a última requisição
      const lastRequestNumber = lastRequest.requestNumber; // Formato: 1-112024
      console.log("setNewRequestNumber", lastRequest, lastRequestNumber)

      // Extrair a parte da sequência e mês/ano
      const [sequence, monthYear] = lastRequestNumber.split('-');
      const [month, year] = monthYear.match(/(\d{2})(\d{4})/).slice(1);

      // Obter o mês e ano atual
      const currentDate = new Date();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // Mês com dois dígitos
      const currentYear = currentDate.getFullYear().toString();

      // Verificar se o mês e ano atual são os mesmos da última requisição
      let newSequence = parseInt(sequence) + 1; // Incrementar a sequência

      // Formar o novo número de requisição
      const newRequestNumber = `${newSequence}-${currentMonth}${currentYear}`;
      console.log("newSequence", newRequestNumber)

      setNewRequestNumber(newRequestNumber); // Atualizar o estado com o novo número
    } else {
      // Se não houver requisições, começar do número 1 do mês/ano atual
      const currentDate = new Date();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      const currentYear = currentDate.getFullYear().toString();
      setNewRequestNumber(`1-${currentMonth}${currentYear}`);
    }
  };

  useEffect(() => {
    loadAccounts1();
    findAccountRequestWhitConformance()
      .then((data) => {
        generateNextRequestNumber(data);
        console.log("requests", data);
      })
      .catch((error) => {
        console.error('Erro ao carregar requisições:', error);
      });
  }, []);

  const handlePreview = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const items = requisicoes;
    setData(currentDate);
    console.log("Request", requisicoes)


    const tabelaProdutos1 = requisicoes.map((req, index) => [
      `${req.quantity || ''}`,
      `${req.description || ''}`,
      `${parseFloat(req.unitPrice || 0).toFixed(2)}`,
      `${parseFloat(req.importancia || 0).toFixed(2)}`,
      `${req.orcamento || ''}`
    ]);



    const tabelaProdutos = requisicoes.map((req, index) => [
      req.orcamento,
      `${req.finalAllocation} MZN`,
      `${req.availableAllocation.toFixed(2)} MZN`,
      `${req.importancia.toFixed(2)} MZN`,
      `${req.saldoExistente.toFixed(2)} MZN`,
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
      codigoFornecedor: codFinancial,
      nomeFornecedor: supplierName,
      disponibilidadeInicial: initialAllocation,
      saldoExistente: finallAllocation,
      logoMzBase64: logoMzBase64,
      valorRequisicao: calcularTotal(),
      tabelaProdutos: tabelaProdutos,
      nomeEncarregado: namePersonCharge,
      orcamento: orcamento,
      financiamento: financiamento,
      supplierName: supplierName,
      justpificacao: justification,
      requestNumber: newRequestNumber,
      tabelaProdutos1: tabelaProdutos1,
      documento: formOpen.documentNumber

    };
    const total = calcularTotal();
    generatePdf(createRequisitonAccount, true, setPreviewUrl);
    setIsPreviewVisible(true);
  };

  const handlePreviewV = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const items = requisicoes;
    setData(currentDate);
    console.log("requisicoesv", requisicoesv)


    const tabelaProdutos1 = requisicoesv.map((req) => {
      const beneficiario = accounts.find(account => account.accountPlan.number === req.beneficiaryName);

      const nomeDoBeneficiario = beneficiario ? beneficiario.accountPlan.description : "Desconhecido";
      const dataAtual = new Date();
      const dia = String(dataAtual.getDate()).padStart(2, '0');
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
      const ano = dataAtual.getFullYear();

      const dataFormatada = `${dia}/${mes}/${ano}`;
      return [
        `${req.beneficiaryName} - ${nomeDoBeneficiario}`,
        `${dataFormatada}`,
        `Factura`,
        `${req.documentNumber} `,
        `${req.quantity}`,
        `${req.description}`,
        `${req.unitPrice || '0.00'}`,
        `${req.importancia || '0.00'} `,
        req.orcamento,
      ];
    });


    const tabelaProdutos = requisicoesv.map((req) => {
      const beneficiario = accounts.find(account => account.accountPlan.number === req.beneficiaryName);

      const nomeDoBeneficiario = beneficiario ? beneficiario.accountPlan.description : "Desconhecido";

      return [
        req.orcamento,
        `${req.finalAllocation} `,
        `${req.availableAllocation?.toFixed(2) || '0.00'}`,
        `${req.importancia?.toFixed(2) || '0.00'} `,
        `${req.saldoExistente?.toFixed(2) || '0.00'}`,
      ];
    });




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
      codigoFornecedor: codFinancial,
      nomeFornecedor: supplierName,
      disponibilidadeInicial: initialAllocation,
      saldoExistente: finallAllocation,
      logoMzBase64: logoMzBase64,
      valorRequisicao: calcularTotalv(),
      tabelaProdutos: tabelaProdutos,
      nomeEncarregado: namePersonCharge,
      orcamento: orcamento,
      financiamento: financiamento,
      supplierName: supplierName,
      justpificacao: justification,
      requestNumber: newRequestNumber,
      tabelaProdutos1: tabelaProdutos1,
    };
    const total = calcularTotal();
    generatePdfForm2(createRequisitonAccount, true, setPreviewUrl);
    setIsPreviewVisible(true);
  };

  const handleAdicionarRequisicao = (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("sdasdasd")

    const dataAtual = new Date();
    const dataOperacao = new Date(operationDateR);

    if (dataOperacao > dataAtual) {
      console.warn("Data de operação no futuro:", operationDateR);

      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'A data da operação não pode ser maior que a data atual.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#FF5733',
      });
      setLoading(false)
      return;
    }

    // Validação de campos obrigatórios
    if (!nomeRequerente || !departamento || !formOpen.documentNumber || !numberF || !operationDateR || !codFinancial) {
      let missingFields = [];

      if (!nomeRequerente) missingFields.push("Nome do Requerente");
      if (!departamento) missingFields.push("Departamento");
      if (!formOpen.documentNumber) missingFields.push("Documento");
      if (!numberF) missingFields.push("Número do Documento");
      if (!operationDateR) missingFields.push("Data da Operação");
      if (!codFinancial) missingFields.push("Código do Beneficiário");

      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios não preenchidos',
        text: `Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`,
        confirmButtonText: 'Ok',
        confirmButtonColor: '#FF5733',
      }).then(() => {
        setLoading(false);
      });
      setLoading(false); // Desativa o carregamento após a mensagem

      return;
    }

    // Cálculo de importância
    const importancia = (parseFloat(quantity) * parseFloat(unitPrice)) || 0;
    const operationDate = new Date().toISOString().split('T')[0];

    // Buscar dados da conta
    const accountData = accounts.find(account => account.accountPlan.number === orcamento);

    let finalAllocationS = 0;
    let availableAllocation = 0;

    if (accountData) {
      const dotacaoFinal = accountData.finalAllocation * 2.5;
      const availableAllocation2 = accountData.availableAllocation * 2.5;

      finalAllocationS = parseFloat(dotacaoFinal).toFixed(2);
      availableAllocation = availableAllocation2;

      setInitialAllocation(finalAllocationS);
      setfinalAllocation(finalAllocationS);
    }

    // Criar base da nova requisição (sem saldo ainda)
    const novaRequisicaoBase = {
      quantity,
      description,
      unitPrice,
      importancia,
      operationDate,
      orcamento,
      financiamentoView,
      quantification,
      finalAllocation: finalAllocationS,
      availableAllocation: parseFloat(availableAllocation.toFixed(2)),
      totalPorOrcamento: totaisPorConta[orcamento] || 0,
      operationDateR,
      document: formOpen.documentNumber,
      documentNumber: numberF
    };

    // Atualização de saldos
    setRequisicoes((prevRequisicoes) => {
      const novasRequisicoes = [...prevRequisicoes, novaRequisicaoBase];

      const saldosPorOrcamento = {};

      const requisicoesComSaldoAtualizado = novasRequisicoes.map((req, index) => {
        const orcamentoAtual = req.orcamento;
        const importanciaAtual = parseFloat(req.importancia) || 0;

        let saldoAnterior;

        if (!(orcamentoAtual in saldosPorOrcamento)) {
          // Primeira requisição para este orçamento
          saldoAnterior = req.availableAllocation || 0;
        } else {
          // Requisições subsequentes
          saldoAnterior = saldosPorOrcamento[orcamentoAtual];
        }

        const saldoFinal = saldoAnterior - importanciaAtual;

        // Atualiza o saldo registrado para este orçamento
        saldosPorOrcamento[orcamentoAtual] = saldoFinal;

        return {
          ...req,
          saldoExistente: parseFloat(saldoFinal.toFixed(2))
        };
      });

      console.log("Última Requisição Adicionada:", requisicoesComSaldoAtualizado[requisicoesComSaldoAtualizado.length - 1]);

      return requisicoesComSaldoAtualizado;
    });

    // Limpar os campos após adicionar
    limparCampos();
    setLoading(false);
  };


  const limparCampos = () => {
    setQuantidade('');
    setDesignacao('');
    setPrecounit('');
    setData('');
    setHora('');
    setUnidades('KG');
    setOrcamento('');
    setFinanciamento('');
    setFinanciamentoView('');
    // setFormData((prev) => ({
    //   ...prev,
    //   orcamento: "",
    // }));

    setFormData('');
    setBeneficiaryName('');
  };

  const handleAdicionarRequisicaoV = (e) => {
    e.preventDefault();

    if (!nomeRequerente || !departamento || !formOpen.documentNumber || !numberF || !operationDateR) {
      let missingFields = [];
      if (!nomeRequerente) missingFields.push("Nome do Requerente");
      if (!departamento) missingFields.push("Departamento");
      if (!formOpen.documentNumber) missingFields.push("documento");
      if (!numberF) missingFields.push("Numero do documento");
      if (!operationDateR) missingFields.push("Data Da Operacao");

      console.warn("Campos obrigatórios ausentes:", missingFields);

      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios não preenchidos',
        text: `Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`,
        confirmButtonText: 'Ok',
        confirmButtonColor: '#FF5733',
      }).then(() => {
        setLoading(false);
      });
      setLoading(false); // Desativa o carregamento após a mensagem

      return;
    }

    const dataAtual = new Date();
    const dataOperacao = new Date(operationDateR);

    if (dataOperacao > dataAtual) {
      console.warn("Data de operação no futuro:", operationDateR);

      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'A data da operação não pode ser maior que a data atual.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#FF5733',
      });
      return;
    }

    const beneficiarioExiste = requisicoesv.some(
      (requisicao) => requisicao.beneficiaryName === beneficiaryName
    );

    // if (beneficiarioExiste) {
    //   console.warn("Beneficiário já existente:", beneficiaryName);

    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Erro',
    //     text: 'Já existe um beneficiário com esse nome. Por favor, insira um nome único.',
    //     confirmButtonText: 'Ok',
    //     confirmButtonColor: '#FF5733',
    //   });
    //   return;
    // }

    const importancia = (parseFloat(quantity) * parseFloat(unitPrice)) || 0;
    const operationDate = new Date().toISOString().split('T')[0];

    const accountData = accounts.find(
      (account) => account.accountPlan.number === orcamento
    );

    let finalAllocationS = 0;
    let availableAllocation = 0;

    if (accountData) {
      const dotacaoFinal = accountData.finalAllocation * 2.5;
      finalAllocationS = parseFloat(dotacaoFinal).toFixed(2);
      const availableAllocation2 = accountData.availableAllocation * 2.5;
      availableAllocation = availableAllocation2;

      setInitialAllocation(finalAllocationS);
      setfinalAllocation(finalAllocationS);
    }

    const novaRequisicao = {
      quantity,
      description,
      unitPrice,
      importancia,
      operationDate,
      orcamento,
      financiamentoView: financiamentoView,
      quantification,
      finalAllocation: finalAllocationS,
      availableAllocation: parseFloat(availableAllocation.toFixed(2)),
      beneficiaryName,
      operationDateR,
      document: formOpen.documentNumber,
      documentNumber: numberF,
    };

    // console.log("Nova requisição criada:", novaRequisicao);

    // setRequisicoesV((prevRequisicoes) => {
    //   const novasRequisicoes = [...prevRequisicoes, novaRequisicao];

    //   const requisicoesOrdenadas = [...novasRequisicoes].sort((a, b) => {
    //     return String(a.orcamento).localeCompare(String(b.orcamento));
    //   });

    //   const saldosPorOrcamento = {};

    //   const requisicoesComSaldos = requisicoesOrdenadas.map(requisicao => {
    //     const orcamento = requisicao.orcamento;

    //     // Determina o saldo existente
    //     let saldoExistente;
    //     if (!(orcamento in saldosPorOrcamento)) {
    //       saldoExistente = requisicao.availableAllocation || 0;
    //     } else {
    //       saldoExistente = saldosPorOrcamento[orcamento];
    //     }

    //     // Calcula o novo saldo
    //     const saldoFinal = saldoExistente - (requisicao.importancia || 0);
    //     saldosPorOrcamento[orcamento] = saldoFinal;

    //     // Retorna a requisição com o saldo atualizado
    //     return {
    //       ...requisicao,
    //       saldoExistente: parseFloat(saldoFinal.toFixed(2))
    //     };
    //   });

    //   const resultadoFinal = novasRequisicoes.map(req => {
    //     const reqComSaldo = requisicoesComSaldos.find(r =>
    //       r.documentNumber === req.documentNumber &&
    //       r.beneficiaryName === req.beneficiaryName &&
    //       r.operationDate === req.operationDate
    //     );
    //     return reqComSaldo || req;
    //   });

    //   console.log("Lista final de requisições com saldo:", resultadoFinal);

    //   return resultadoFinal;
    // });

    console.log("Nova requisição criada:", novaRequisicao);

    setRequisicoesV((prevRequisicoes) => {
      const novasRequisicoes = [...prevRequisicoes, novaRequisicao];

      const saldosPorOrcamento = {};

      const requisicoesComSaldos = novasRequisicoes.map(requisicao => {
        const orcamento = requisicao.orcamento;

        // Determina o saldo existente
        let saldoExistente;
        if (!(orcamento in saldosPorOrcamento)) {
          saldoExistente = requisicao.availableAllocation || 0;
        } else {
          saldoExistente = saldosPorOrcamento[orcamento];
        }

        // Calcula o novo saldo
        const saldoFinal = saldoExistente - (requisicao.importancia || 0);
        saldosPorOrcamento[orcamento] = saldoFinal;

        // Retorna a requisição com o saldo atualizado
        return {
          ...requisicao,
          saldoExistente: parseFloat(saldoFinal.toFixed(2))
        };
      });

      console.log("Lista final de requisições com saldo:", requisicoesComSaldos);

      return requisicoesComSaldos;
    });


    limparCampos();
  };

  const handleChangeCodFinancial = (e) => {
    const selectedValue = e.target.value;
    setCodFinancial(selectedValue);

    const selectedAccount = accounts.find(
      (account) => account.accountPlan.number === selectedValue
    );
    setCodFinancial(selectedAccount.accountPlan.number);
    setSupplierName(selectedAccount.accountPlan.description);
  };
  const handleChange = (e) => {
    const selectedNumber = e.target.value;
    console.log("Select", selectedNumber);

    setOrcamento(selectedNumber);

    setFormData(e.target.value)

    const filteredAccounts = contasAssociadas.filter(item =>
      item.budgetAssociations.some(association => association.budgetAccount.number === selectedNumber)
    );

    let financiamentoView = ""; // Inicializa a variável

    if (filteredAccounts.length > 0) {
      console.log("number", filteredAccounts[0].financialAccount.number);
      console.log("description", filteredAccounts[0].financialAccount.description);

      financiamentoView = `${filteredAccounts[0].financialAccount.number} - ${filteredAccounts[0].financialAccount.description}`;

      setFinanciamento(filteredAccounts[0].financialAccount.number);
    } else {
      financiamentoView = "Não Encontrado";
      setFinanciamento(""); // Ou outro valor padrão se necessário
      setOrcamento(selectedNumber);

      Swal.fire({
        icon: 'warning',
        title: 'Falha na Seleção da Conta',
        text: 'Esta conta não possui as condições necessárias para a realização de uma requisição. Por favor, contacte o administrador.',
        confirmButtonText: 'Ok',
        allowOutsideClick: false, // Impede que o alerta seja fechado clicando fora
      }).then((result) => {
        if (result.isConfirmed) {
          setFormData(null)
        }
      });

    }
    setFinanciamentoView(financiamentoView);

    const accountData = accounts.find(
      (account) => account.accountPlan.number === selectedNumber
    );

    if (accountData) {
      // Função para formatar números
      // Formate os valores encontrados
      const dotacaoFinal = (accountData.finalAllocation * 2.5).toFixed(2);
      const availableAllocation = (accountData.availableAllocation || 0) || 0;

      // Calcular 5% de availableAllocation
      const finalAllocationS = Math.floor((dotacaoFinal) * 100) / 100;

      setInitialAllocation(finalAllocationS);
      setfinalAllocation(availableAllocation);

    } else {
      console.error("Conta não encontrada!");
    }
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(value);
  };

  const handleChangeDepartamento = (event) => {
    setDepartamento(event.target.value);
    console.log("Selecionado", departamento)

  };
  const handleChangeFinanciamento = (e) => {
    console.log("Selecionado")
    setFinanciamento(e.target.value)
  };



  const handleChangeNomeRequerente = (e) => {
    console.log("Selecionado")
    setNomeRequerente(e.target.value)
  };


  const handleChangeNomeAditoFinanceiro = (e) => {
    console.log("Selecionado")
    setNomeAditoFinanceiro(e.target.value)
  };

  //Para Formulario 1
  const handleRemoverRequisicao = (index) => {
    // Remover o item da lista de requisições usando o índice
    console.log("Selecionado")
    setRequisicoesV(requisicoesv.filter((_, i) => i !== index));
    setRequisicoes(requisicoes.filter((_, i) => i !== index));
  };

  const handleEditarRequisicao = (index) => {
    const requisicao = requisicoes[index]; // Dados da requisição atual

    Swal.fire({
      title: 'Editar Requisição',
      html: `
        <div class="swal-row">
          <div>
            <label class="form-label color-black font-bold">Quantidade</label>
            <input id="swal-quantity" type="number" class="form-control" value="${requisicao.quantity}" />
          </div>
          <div>
            <label class="form-label color-black font-bold">Preço Unitário</label>
            <input id="swal-unitPrice" type="number" class="form-control" value="${requisicao.unitPrice}" />
          </div>
        </div>
          <div>
            <label class="form-label color-black font-bold">Descrição</label>
            <input id="swal-description" type="text" class="form-control" value="${requisicao.description}" />
          </div>
          <div>
            <label class="form-label color-black font-bold">Classificação Orçamental</label>
            <select id="swal-orcamento" class="form-select">
              <option value="">Selecione</option>
              ${accounts
          .filter(account => account.accountPlan.type === "budject" && account.accountPlan.writable === "moviment")
          .map(account => `
                  <option value="${account.accountPlan.number}" ${account.accountPlan.number === requisicao.orcamento ? "selected" : ""}>
                    ${account.accountPlan.number} - ${account.accountPlan.description}
                  </option>`)
          .join('')}
            </select>
          </div>
          <div style="display: none;">
            <label class="form-label color-black font-bold">Conta Financeira</label>
            <input id="swal-financiamento" type="text" class="form-control" readonly value="${requisicao.financiamentoView}" />
          </div>
        `,
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const orcamentoSelect = document.getElementById('swal-orcamento');
        const financiamentoInput = document.getElementById('swal-financiamento');

        orcamentoSelect.addEventListener('change', (e) => {
          const selectedOrcamento = e.target.value;
          const filteredAccounts = contasAssociadas.filter(item =>
            item.budgetAssociations.some(assoc => assoc.budgetAccount.number === selectedOrcamento)
          );

          financiamentoInput.value = filteredAccounts.length > 0
            ? `${filteredAccounts[0].financialAccount.number} - ${filteredAccounts[0].financialAccount.description}`
            : "Não Encontrado";

          if (filteredAccounts.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Conta Orçamentária Sem Conta Financeira Associada',
              text: 'Esta conta orçamentária não possui uma conta financeira associada.',
              confirmButtonText: 'Ok',
              allowOutsideClick: false,
            });
          }
        });
      },
      preConfirm: () => {
        const quantity = document.getElementById('swal-quantity').value;
        const unitPrice = document.getElementById('swal-unitPrice').value;
        const description = document.getElementById('swal-description').value;
        const orcamento = document.getElementById('swal-orcamento').value;
        const financiamentoView = document.getElementById('swal-financiamento').value;

        if (!quantity || !unitPrice || !description || !orcamento || financiamentoView === "Não Encontrado") {
          Swal.showValidationMessage('Preencha todos os campos corretamente!');
          return false;
        }

        return {
          quantity,
          unitPrice,
          description,
          orcamento,
          financiamentoView,
          importancia: quantity * unitPrice,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = result.value;
        const updatedRequisicoes = requisicoes.map((req, idx) =>
          idx === index ? { ...req, ...updatedData } : req
        );
        setRequisicoes(updatedRequisicoes);
        Swal.fire('Sucesso', 'Requisição atualizada com sucesso!', 'success');
      }
    });
  };




  const handleEditarRequisicaoFom2 = (requisicao, index) => {
    Swal.fire({
      title: 'Editar Requisição',
      html: `
      <div class="swal-row">
        <div>
        <label class="form-label color-black font-bold">Quantidade</label>
        <input id="swal-quantity" type="number" class="form-control border-black" value="${requisicao.quantity}" />
        </div>
        <div>
          <label class="form-label color-black font-bold">Preço Unitário</label>
          <input id="swal-unitPrice" type="number" class="form-control border-black" value="${requisicao.unitPrice}" />
        </div>
        </div>
        <div>
          <label class="form-label color-black font-bold">Descrição</label>
          <input id="swal-description" type="text" class="form-control border-black" value="${requisicao.description}" />
        </div>
      <div>
        <label class="form-label color-black font-bold">Classificação Orçamental</label>
        <select id="swal-orcamento" class="form-select border-black">
          <option value="">Selecione</option>
          ${accounts
          .filter(
            (account) =>
              account.accountPlan.type === "budject" &&
              account.accountPlan.writable === "moviment"
          )
          .map(
            (account) => `
                <option value="${account.accountPlan.number}" ${account.accountPlan.number === requisicao.orcamento ? "selected" : ""
              }>
                  ${account.accountPlan.number} - ${account.accountPlan.description}
                </option>`
          )
          .join('')}
        </select>
      </div>
          <div style="display: none;">
        <label class="form-label color-black font-bold">Conta Financeira</label>
        <input id="swal-financiamento" type="text" class="form-control border-black" value="${requisicao.financiamentoView}" />
      </div>

       <div>
        <label class="form-label color-black font-bold">Beneficiario</label>
        <select id="swal-beneficiary" class="form-select border-black">
          <option value="">Selecione o Beneficiario</option>
          ${accounts
          .filter(
            (account) =>
              account.accountPlan.type === "financial" &&
              account.accountPlan.writable === "moviment"
          )
          .map(
            (account) => `
                <option value="${account.accountPlan.number}" ${account.accountPlan.number === requisicao.beneficiaryName ? "selected" : ""
              }>
                  ${account.accountPlan.number} - ${account.accountPlan.description}
                </option>`
          )
          .join('')}
        </select>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        // Captura os valores dos campos
        const quantity = document.getElementById('swal-quantity').value;
        const unitPrice = document.getElementById('swal-unitPrice').value;
        const description = document.getElementById('swal-description').value;
        const orcamento = document.getElementById('swal-orcamento').value;
        const financiamentoView = document.getElementById('swal-financiamento').value;
        const beneficiary = document.getElementById('swal-beneficiary').value;

        if (!quantity || !unitPrice || !description || !orcamento || !financiamentoView || !beneficiary) {
          Swal.showValidationMessage('Por favor, preencha todos os campos!');
          return false;
        }

        const importancia = quantity * unitPrice;

        return {
          quantity,
          unitPrice,
          description,
          orcamento,
          financiamentoView,
          importancia,
          beneficiary
        };

      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = result.value;

        // Atualiza o estado da requisição
        const updatedRequisicoes = requisicoesv.map((req, idx) =>
          idx === index ? { ...req, ...updatedData } : req
        );

        setRequisicoesV(updatedRequisicoes);

        Swal.fire('Sucesso', 'Requisição atualizada com sucesso!', 'success');
      }
    });
  };

  //MINHAS CHAMADAS

  const loadAccountAssociate = async () => {
    try {
      setLoading(true);

      // Chama a função para buscar as contas com associações
      const response = await findAccountPlanAccountAssociateByYear();

      const filteredAccounts = response.filter(item => item.budgetAssociations && item.budgetAssociations.length > 0 // "moviment" não estava no seu exemplo, usei "controll"
      );

      console.log("Contas Associadas com Orçamento:", filteredAccounts);
      setContasAssociadas(filteredAccounts)
    } catch (error) {
      console.error("Erro nas contas associadas:", error);
    } finally {
      setLoading(false);
    }
  };


  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await findAccountPlanBudjectEntriesByYear();
      console.log("Contas recebidas:", response);
      setAccounts(response);


      const filteredAccounts = response.filter(account =>

      (
        account.accountPlan.number.startsWith('421') ||
        account.accountPlan.number.startsWith('43') ||
        account.accountPlan.number.startsWith('46')
      )
      );

      setAccountsSelect(filteredAccounts);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadAccountAssociate();
    loadDiariesWithDocuments();
    findAccountPlanConformance();
  }, []);
  const calcularTotal = () => {
    const total = requisicoes.reduce((acc, req) => acc + parseFloat(req.importancia || 0), 0);
    return `${total.toFixed(2)} MZN`;
  };

  const calcularTotalv = () => {
    const total = requisicoesv.reduce((acc, req) => acc + parseFloat(req.importancia || 0), 0);
    return `${total.toFixed(2)} MZN`;
  };


  const handleNumberF = (e) => {
    const selectedNumber = e.target.value;
    setNumberF(selectedNumber)
    console.log("selecionado", selectedNumber)
  }

  const handleDocumentSelection = (e) => {
    const selectedDocumentNumber = e.target.value;

    // Encontrar o documento selecionado
    const selectedDocument = documents.find(
      (doc) => doc.documentNumber === selectedDocumentNumber
    );

    if (selectedDocument) {
      setFormOpen({
        documentNumber: selectedDocument.documentNumber,
        documentDescription: selectedDocument.description,
      });
    } else {
      setFormOpen({ documentNumber: "", documentDescription: "" });
    }
  };
  const totaisPorConta = requisicoes.reduce((totais, requisicao) => {
    const conta = requisicao.orcamento;
    if (!totais[conta]) {
      totais[conta] = 0;
    }
    totais[conta] += requisicao.importancia;
    return totais;
  }, {});

  // Formatar os totais para envio ao backend
  const totaisFormatados = Object.entries(totaisPorConta).map(([conta, total]) => ({
    contaOrcamental: conta,
    total: total.toFixed(2),
  }));


  const hasNegativeBalanceItems = (items) => {
    if (!items || items.length === 0) {
      return false;
    }
    console.log("itemsNegative", items)
    return items.some(item => {
      return item.saldoExistente !== undefined && item.saldoExistente < 0;
    });
  };

  const handleSubmeterRequisicoes = async () => {

    const dataAtual = new Date();
    const dataOperacao = new Date(operationDateR);

    if (dataOperacao > dataAtual) {
      console.warn("Data de operação no futuro:", operationDateR);

      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'A data da operação não pode ser maior que a data atual.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#FF5733',
      });
      setLoading(false)
      return;
    }

    if (!isConformed) {
      Swal.fire({
        icon: 'error',
        title: 'Operação não permitida',
        text: 'Não é possível submeter requisições antes da aprovação do orçamento inicial.',
      });
      return;
    }

    const confirmResult = await Swal.fire({
      icon: 'question',
      title: 'Confirmar Envio',
      text: 'Deseja realmente submeter esta requisição?',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
    });

    // Se o usuário cancelar, interrompe a execução
    if (!confirmResult.isConfirmed) {
      return;
    }
    setLoading(true); // Define o estado de carregamento
    const currentDate = new Date().toISOString().split('T')[0];

    const items = requisicoes;

    // setData(currentDate);

    const saldo = finallAllocation - calcularTotal();

    // Validação dos campos obrigatórios
    if (!nomeRequerente || !codFinancial || !departamento || !items || items.length === 0) {
      let missingFields = [];

      console.log("Orçamento", orcamento);

      if (!nomeRequerente) missingFields.push("Nome do Requerente");
      if (!codFinancial) missingFields.push("Dados do Fornecedor");
      if (!departamento) missingFields.push("Departamento");
      // if (!orcamento) missingFields.push("Orçamento");
      // if (!financiamento) missingFields.push("Financiamento");
      if (!items || items.length === 0) missingFields.push("Requisições");
      // if (!bank || bank.length === 0) missingFields.push("Banco");


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
      setLoading(false); // Desativa o carregamento após a mensagem

      return; // Impede o envio se os campos não forem preenchidos
    }
    if (!items || items.length === 0) {
      missingFields.push("Requisições");
    } else if (hasNegativeBalanceItems(items)) {
      // Exibe um alerta caso o saldo seja negativo
      Swal.fire({
        icon: 'error',
        title: 'Saldo Insuficiente',
        text: 'O saldo não pode ser negativo. Verifique os valores e tente novamente.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#FF5733', // Cor personalizada do botão
      }).then(() => {
        setLoading(false); // Desativa o carregamento após a mensagem
      });

      setLoading(false)
      return; // Impede o envio se o saldo for negativo
    }

    const createRequisitonAccount = {
      requestorName: nomeRequerente,
      requestorDepartment: departamento,
      operationDate: operationDateR,
      justification: "Teste de uma requisicao interna",
      sectorBudject: "Sector A",
      chapterBudject: "20A",
      clauseBudject: "10",
      clauseNumberBudject: "a",
      provideCode: "111",
      bank: bank,
      logoMzBase64: logoMzBase64,
      accountPlanBudjectNumber: orcamento,
      accountPlanFinancialNumber: codFinancial,
      items,
      totaisPorContaOrcamental: totaisFormatados, // Adicionando os totais ao payload
      document: formOpen.documentNumber,
      documentNumber: numberF,
      transactionType: 'UNIQUE_BENEFICIARY'
    };

    console.log("createRequisitonAccount", createRequisitonAccount)

    // return;
    // return;
    try {
      // Registra a requisição
      await requisitionCreate({
        ...createRequisitonAccount,
      });
      // Exibe o pop-up de sucesso
      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Requisição feita com sucesso!',
      })


      loadAccounts();
      loadAccountAssociate();
      loadDiariesWithDocuments();
      findAccountPlanConformance();
      loadAccounts1();
      findAccountRequestWhitConformance()

      setLoading(false); // Desativa o carregamento após o erro
      limparCampos();

      return true;

    } catch (error) {
      console.error(error);

      // Exibe o pop-up de erro
      Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: error,
      })

      setLoading(false); // Desativa o carregamento após o erro

      return false;
    }
  };


  const handleSubmeterRequisicoesV = async () => {
    const dataAtual = new Date();
    const dataOperacao = new Date(operationDateR);

    if (dataOperacao > dataAtual) {
      console.warn("Data de operação no futuro:", operationDateR);

      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'A data da operação não pode ser maior que a data atual.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#FF5733',
      });
      setLoading(false)
      return;
    }
    if (!isConformed) {
      Swal.fire({
        icon: 'error',
        title: 'Operação não permitida',
        text: 'Não é possível submeter requisições antes da aprovação do orçamento inicial.',
      });
      return;
    }

    const confirmResult = await Swal.fire({
      icon: 'question',
      title: 'Confirmar Envio',
      text: 'Deseja realmente submeter esta requisição?',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
    });

    // Se o usuário cancelar, interrompe a execução
    if (!confirmResult.isConfirmed) {
      return;
    }
    setLoading(true); // Define o estado de carregamento
    const currentDate = new Date().toISOString().split('T')[0];

    const items = requisicoesv;

    setData(currentDate);

    const saldo = finallAllocation - calcularTotal();

    // Validação dos campos obrigatórios
    if (!nomeRequerente || !departamento || !formOpen.documentNumber || !numberF || !items || items.length === 0) {
      let missingFields = [];

      if (!nomeRequerente) missingFields.push("Nome do Requerente");
      if (!departamento) missingFields.push("Departamento");
      if (!formOpen.documentNumber) missingFields.push("documento");
      if (!numberF) missingFields.push("Numero do documento");
      if (!items || items.length === 0) missingFields.push("Requisições");

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
      setLoading(false); // Desativa o carregamento após a mensagem

      return; // Impede o envio se os campos não forem preenchidos
    }

    if (!items || items.length === 0) {
      missingFields.push("Requisições");
    } else if (hasNegativeBalanceItems(items)) {
      // Exibe um alerta caso o saldo seja negativo
      Swal.fire({
        icon: 'error',
        title: 'Saldo Insuficiente',
        text: 'O saldo não pode ser negativo. Verifique os valores e tente novamente.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#FF5733', // Cor personalizada do botão
      }).then(() => {
        setLoading(false); // Desativa o carregamento após a mensagem
      });

      setLoading(false)
      return; // Impede o envio se o saldo for negativo
    }

    console.log("saldo Negativo", saldo);

    const createRequisitonAccount = {
      requestorName: nomeRequerente,
      requestorDepartment: departamento,
      operationDate: currentDate,
      justification: "Teste de uma requisicao interna",
      sectorBudject: "Sector A",
      chapterBudject: "20A",
      clauseBudject: "10",
      clauseNumberBudject: "a",
      provideCode: "111",
      bank: bank,
      logoMzBase64: logoMzBase64,
      accountPlanBudjectNumber: orcamento,
      accountPlanFinancialNumber: codFinancial,
      items,
      totaisPorContaOrcamental: totaisFormatados, // Adicionando os totais ao payload
      document: formOpen.documentNumber,
      documentNumber: numberF,
      transactionType: 'MULTIPLE_BENEFICIARIES'
    };

    console.log("createRequisitonAccount", createRequisitonAccount)

    try {
      // Registra a requisição
      await requisitionCreate({
        ...createRequisitonAccount,
      });
      // Exibe o pop-up de sucesso
      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Requisição feita com sucesso!',
      })


      loadAccounts();
      loadAccountAssociate();
      loadDiariesWithDocuments();
      findAccountPlanConformance();
      loadAccounts1();
      findAccountRequestWhitConformance()

      setLoading(false); // Desativa o carregamento após o erro
      limparCampos();

      return true;
    } catch (error) {
      console.error(error);
      setLoading(false); // Desativa o carregamento após o erro

      // Exibe o pop-up de erro
      Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: error,
        confirmButtonText: 'Ok',
        confirmButtonColor: '#dc3545', // Cor personalizada para erro
      }).then(() => {
        setLoading(false); // Desativa o carregamento após o erro
      });
    }
  };

  return (
    <div className="container-fluid py-1">
      {/* Cabeçalho Compacto de Requisições de Fundos com Seletor Integrado na Mesma Linha */}
      <div className="sgf-page-header d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <h2 className="mb-0" style={{ fontSize: "1.1rem", fontWeight: 800 }}>
            Emissão de Requisição de Fundos
          </h2>
          <span
            className="badge"
            style={{
              backgroundColor: "#eaf5ef",
              color: "#0f5132",
              border: "1px solid #a7d7be",
              fontFamily: "monospace",
            }}
          >
            Nº: {newRequestNumber || numeroRequisicao}
          </span>
          <span
            className="badge"
            style={{
              backgroundColor: isConformed ? "#dcfce7" : "#fef3c7",
              color: isConformed ? "#166534" : "#92400e",
              border: isConformed ? "1px solid #86efac" : "1px solid #fde68a",
            }}
          >
            {isConformed ? "Orçamento Conforme" : "Aguarda Conformidade Inicial"}
          </span>
        </div>

        {/* Seletor de Modelo na Mesma Linha */}
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className={`btn btn-sm ${
              visibleForm1 ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => {
              setVisibleForm2(false);
              setVisibleForm1(true);
            }}
          >
            <FaFileAlt /> Modelo 1: Beneficiário Único
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              visibleForm2 ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => {
              setVisibleForm1(false);
              setVisibleForm2(true);
            }}
          >
            <FaFileInvoiceDollar /> Modelo 2: Múltiplos Beneficiários
          </button>
        </div>
      </div>

      <Spinner isLoading={loading} />
      <>
        <PremiumFormDisplay
          selectedForm={selectedForm}
          nomeRequerente={nomeRequerente}
          setNomeRequerente={setNomeRequerente}
          departamento={departamento}
          setDepartamento={setDepartamento}
          codFinancial={codFinancial}
          setCodFinancial={setCodFinancial}
          supplierName={supplierName}
          operationDateR={operationDateR}
          setOperationDateR={setOperationDateR}
          numberF={numberF}
          setNumberF={setNumberF}
          quantity={quantity}
          unitPrice={unitPrice}
          description={description}
          setOrcamento={setOrcamento}
          financiamentoView={financiamentoView}
          setFinanciamentoView={setFinanciamentoView}
          namePersonCharge={namePersonCharge}
          nomeAditoFinanceiro={nomeAditoFinanceiro}
          setNomeAditoFinanceiro={setNomeAditoFinanceiro}
          requisicoes={requisicoes}
          editIndex={editIndex}
          previewUrl={previewUrl}
          accountsCode={accountsSelect}
          accounts={accounts}
          documents={documents}
          formOpen={formOpen}
          formData={formData}
          setQuantidade={setQuantidade}
          setSupplierName={setSupplierName}
          setRequisicoes={setRequisicoes}
          setFormData={setFormData}
          setDocuments={setDocuments}
          loadDiariesWithDocuments={loadDiariesWithDocuments}
          setPrecounit={setPrecounit}
          setDesignacao={setDesignacao}
          handleChangeNomeRequerente={handleChangeNomeRequerente}
          handleChangeDepartamento={handleChangeDepartamento}
          handleChangeCodFinancial={handleChangeCodFinancial}
          handleDocumentSelection={handleDocumentSelection}
          handleChange={handleChange}
          handleChangeFinanciamento={handleChangeFinanciamento}
          handleChangeNomeAditoFinanceiro={handleChangeNomeAditoFinanceiro}
          handleAdicionarRequisicao={handleAdicionarRequisicao}
          handleEditarRequisicao={handleEditarRequisicao}
          handleRemoverRequisicao={handleRemoverRequisicao}
          handleSubmeterRequisicoes={handleSubmeterRequisicoes}
          handlePreview={handlePreview}
          isOpen={visibleForm1}
          onClose={() => setVisibleForm1(false)}
          setPreviewUrl={setPreviewUrl}
          newRequestNumber={newRequestNumber}
        />
      </>

      <PremiumFormDisplay2
        selectedForm={selectedForm}
        nomeRequerente={nomeRequerente}
        setNomeRequerente={setNomeRequerente}
        departamento={departamento}
        setDepartamento={setDepartamento}
        codFinancial={codFinancial}
        setCodFinancial={setCodFinancial}
        supplierName={supplierName}
        operationDateR={operationDateR}
        setOperationDateR={setOperationDateR}
        numberF={numberF}
        setNumberF={setNumberF}
        quantity={quantity}
        unitPrice={unitPrice}
        description={description}
        setOrcamento={setOrcamento}
        financiamentoView={financiamentoView}
        setFinanciamentoView={setFinanciamentoView}
        namePersonCharge={namePersonCharge}
        nomeAditoFinanceiro={nomeAditoFinanceiro}
        setNomeAditoFinanceiro={setNomeAditoFinanceiro}
        requisicoes={requisicoes}
        editIndex={editIndex}
        previewUrl={previewUrl}
        accountsCode={accountsSelect}
        accounts={accounts}
        documents={documents}
        formOpen={formOpen}
        formData={formData}

        setSupplierName={setSupplierName}
        setRequisicoes={setRequisicoesV}
        setFormData={setFormData}
        setDocuments={setDocuments}

        setQuantidade={setQuantidade}
        setPrecounit={setPrecounit}
        setDesignacao={setDesignacao}
        handleChangeNomeRequerente={handleChangeNomeRequerente}
        handleChangeDepartamento={handleChangeDepartamento}
        handleChangeCodFinancial={handleChangeCodFinancial}
        handleDocumentSelection={handleDocumentSelection}
        handleChange={handleChange}
        handleChangeFinanciamento={handleChangeFinanciamento}
        handleChangeNomeAditoFinanceiro={handleChangeNomeAditoFinanceiro}
        handleAdicionarRequisicao={handleAdicionarRequisicaoV}
        handleEditarRequisicao={handleEditarRequisicaoFom2}
        handleRemoverRequisicao={handleRemoverRequisicao}
        handleSubmeterRequisicoes={handleSubmeterRequisicoesV}
        handlePreview={handlePreviewV}
        isOpen={visibleForm2}
        onClose={() => setVisibleForm2(false)}
        beneficiaryName={beneficiaryName}
        requisicoesV={requisicoesv}
        handleChangeBeneficiaryName={handleChangeBeneficiaryName}
        availableAllocation={null}
        setPreviewUrl={setPreviewUrl}
        newRequestNumber={newRequestNumber}

      />
    </div>
  );
};

export default FormRequisition;
