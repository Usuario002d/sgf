import React, { useEffect, useState } from 'react';
import './FormRequisition.css';
// import { findAccountPlanBudjectEntriesByYear, setCreateAccountPlanBudjectEntry } from '../services/accountService';
import { toWords } from 'number-to-words';
import PopupNotification from 'config/Pop-up/PopupNotification';
import { findAccountPlanBudjectEntriesByYear, findAccountPlanAccountAssociateByYear } from 'services/accountService';
import { generatePdf } from '../pdf/util/pdfUtils';  // Ajuste o caminho conforme necessário
import Swal from 'sweetalert2';
import { requisitionCreate } from 'services/accountService';
import logoMz from '../../assets/img/logoMz.png';
import { textAlign } from '@mui/system';


const FormRequisition2 = () => {
  const [quantity, setQuantidade] = useState('');
  const [description, setDesignacao] = useState('');
  const [justification, setJustification] = useState('');

  const [unitPrice, setPrecounit] = useState('');
  const [operationDate, setData] = useState('');
  const [hora, setHora] = useState('');
  const [quantification, setUnidades] = useState('KG');
  const [requisicoes, setRequisicoes] = useState([]);
  const [orcamento, setOrcamento] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [financiamento, setFinanciamento] = useState('');
  const [financiamentoView, setFinanciamentoView] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [supplierName, setSupplierName] = useState(null);
  const [codFinancial, setCodFinancial] = useState(null);
  const [nomeRequerente, setNomeRequerente] = useState(null);
  const [nomeAditoFinanceiro, setNomeAditoFinanceiro] = useState(null);
  const [numeroRequisicao, setNumeroRequisicao] = useState("");
  const [initialAllocation, setInitialAllocation] = useState("");
  const [finallAllocation, setfinalAllocation] = useState("");
  const [bank, setBank] = useState("");
  const [namePersonCharge, setNamePersonCharge] = useState("Carlos Fernando");
  const [contasAssociadas, setContasAssociadas] = useState([]);



  //NOVAS VARIAVEIS
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    value: ""
  });




  const [logoMzBase64, setLogoMzBase64] = useState('');

  useEffect(() => {
    const savedUserData = JSON.parse(localStorage.getItem("userData"));

    if (savedUserData && savedUserData.fullName) {
      const userFullName = savedUserData.fullName.toString();
      setNamePersonCharge(userFullName);
      console.log("savedUserData", userFullName);
    } else {
      console.log("Nenhum dado encontrado.");
    }
  }, []);  // A dependência vazia [] garante que o efeito será executado apenas uma vez, na montagem.

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


  // DADOS PARA PODER GERAR O PDF

  const [previewUrl, setPreviewUrl] = useState(null);


  useEffect(() => {
    // Gerar valor randômico com número aleatório e data atual
    const randomString = Math.random().toString(36).substring(2, 6).toUpperCase(); // String randômica
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Número aleatório de 4 dígitos
    const currentDate = new Date().toISOString().split("T")[0]; // Data atual no formato YYYY-MM-DD
    const requisicao = `${randomString}-${randomNumber}-${currentDate}`;
    setNumeroRequisicao(requisicao);
  }, []);


  const handlePreview = () => {

    const currentDate = new Date().toISOString().split('T')[0];

    const items = requisicoes;

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

      return;
    }
    console.log("Request", createRequisitonAccount)
    const tabelaProdutos = requisicoes.map((req, index) => [
      (index + 1).toString(),
      req.description,
      `${req.unitPrice} MZN`,
      `${req.importancia.toFixed(2)} MZN`,
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
      tabelaProdutos: tabelaProdutos, // Adicionando a tabela de produtos ao objeto
      nomeEncarregado: namePersonCharge,
      orcamento: orcamento,
      financiamento: financiamento,
      supplierName: supplierName,
      justpificacao: justification
    };

    const total = calcularTotal();

    generatePdf(

      createRequisitonAccount,
      true,
      setPreviewUrl
    );
  };


  const handleImprimirPDF = () => {
    // Chama a função para gerar e imprimir o PDF
    const requisicaoData = {
      requisicoes,
      orcamento,
      financiamento,
      // Adicione outros campos do formulário conforme necessário
    };

    // PdfGenerator.generatePDF(requisicaoData);
  };

  const handleAdicionarRequisicao = (e) => {
    e.preventDefault();
    const importancia = (parseFloat(quantity) * parseFloat(unitPrice)) || 0;

    const operationDate = new Date().toISOString().split('T')[0];
    const hora = new Date().toLocaleTimeString(); // Preenche o campo hora com o horário atual

    const novaRequisicao = {
      quantity,
      description,
      unitPrice,
      importancia,
      operationDate,
      // hora,
      quantification,
    };

    if (editIndex !== null) {
      const novasRequisicoes = [...requisicoes];
      novasRequisicoes[editIndex] = novaRequisicao;
      setRequisicoes(novasRequisicoes);
      setEditIndex(null);
    } else {
      setRequisicoes([...requisicoes, novaRequisicao]);
    }
    limparCampos();
  };

  const limparCampos = () => {
    setQuantidade('');
    setDesignacao('');
    setPrecounit('');
    setData('');
    setHora('');
    setUnidades('KG');
  };

  // EVENTOS DE MUDACAS #################################


  const handleChangeBank = (e) => {
    const selectedNumber = e.target.value; // Use o parâmetro correto (e)

    setBank(selectedNumber);
  }


  const handleChangeCodFinancial = (e) => {
    const selectedValue = e.target.value;
    setCodFinancial(selectedValue);

    // Encontre a conta correspondente
    const selectedAccount = accounts.find(
      (account) => account.accountPlan.number === selectedValue
    );
    setCodFinancial(selectedAccount.accountPlan.number);
    setSupplierName(selectedAccount.accountPlan.description);
  };
  const handleChange = (e) => {
    const selectedNumber = e.target.value; // Obtém o valor selecionado do seletor

    console.log("Select", selectedNumber);

    // Atualiza o estado com o número do orçamento selecionado
    setOrcamento(selectedNumber);

    // Filtra as contas associadas verificando se algum item dentro de budgetAssociations tem o número correspondente
    const filteredAccounts = contasAssociadas.filter(item =>
      item.budgetAssociations.some(association => association.budgetAccount.number === selectedNumber)
    );

    let financiamentoView = ""; // Inicializa a variável

    // Verifica se há contas filtradas
    if (filteredAccounts.length > 0) {
      console.log("number", filteredAccounts[0].financialAccount.number);
      console.log("description", filteredAccounts[0].financialAccount.description);

      financiamentoView = `${filteredAccounts[0].financialAccount.number} - ${filteredAccounts[0].financialAccount.description}`;

      setFinanciamento(filteredAccounts[0].financialAccount.number);
    } else {
      financiamentoView = "Não Encontrado";
      setFinanciamento(""); // Ou outro valor padrão se necessário

      // Exibe o alerta com SweetAlert2
      Swal.fire({
        icon: 'warning',
        title: 'Conta Orçamentária Sem Conta Financeira Associada',
        text: 'Esta conta orçamentária não possui uma conta financeira associada. Por favor, associe uma conta.',
        confirmButtonText: 'Ok',
        allowOutsideClick: false, // Para que o usuário não consiga fechar o alerta fora da caixa
      });
    }

    setFinanciamentoView(financiamentoView);

    // Encontre os dados da conta correspondente
    const accountData = accounts.find(
      (account) => account.accountPlan.number === selectedNumber
    );

    if (accountData) {
      // Função para formatar números
      // Formate os valores encontrados
      const dotacaoFinal = (accountData.finalAllocation * 2.5).toFixed(2);
      const dotacaoInicial = accountData.initialAllocation;
      const availableAllocation = (accountData.availableAllocation).toFixed(2);

      // Calcular 5% de availableAllocation
      const availableAllocationPercent = Math.round((dotacaoFinal * 0.05) * 100) / 100;

      const finalAllocationS = Math.floor((dotacaoFinal - availableAllocationPercent) * 100) / 100;

      console.log("Valor em metical", dotacaoFinal)
      console.log("Cinco Porcentos", availableAllocationPercent)
      console.log("Total", finalAllocationS)


      // Atualize os estados
      setInitialAllocation(finalAllocationS);
      setfinalAllocation(finalAllocationS);

      //   setfinalAllocation(
      //     Math.round(
      //         (availableAllocation - (availableAllocation * 0.05)) * 100
      //     ) / 100
      // );

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


  const handleRemoverRequisicao = (index) => {
    const novasRequisicoes = requisicoes.filter((_, i) => i !== index);
    setRequisicoes(novasRequisicoes);
  };

  const handleEditarRequisicao = (index) => {
    const requisicao = requisicoes[index];
    setQuantidade(requisicao.quantity);
    setDesignacao(requisicao.description);
    setPrecounit(requisicao.unitPrice);
    setData(requisicao.operationDate);
    setHora(requisicao.hora);
    setUnidades(requisicao.quantification);
    setEditIndex(index);
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadAccountAssociate();
  }, []);

  const calcularTotal = () => {
    return requisicoes.reduce((acc, req) => acc + parseFloat(req.importancia), 0);
  };

  const handleSubmeterRequisicoes = async () => {
    setLoading(true); // Define o estado de carregamento
    const currentDate = new Date().toISOString().split('T')[0];

    const items = requisicoes;

    setData(currentDate);

    const saldo = finallAllocation - calcularTotal();

    // Validação dos campos obrigatórios
    if (!nomeRequerente || !codFinancial || !departamento || !orcamento || !financiamento || !items || !bank || items.length === 0) {
      let missingFields = [];

      console.log("Orçamento", orcamento);

      if (!nomeRequerente) missingFields.push("Nome do Requerente");
      if (!codFinancial) missingFields.push("Dados do Fornecedor");
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

    // Verifica se o saldo é negativo
    if (saldo < 0) {
      // Exibe um alerta caso o saldo seja negativo
      Swal.fire({
        icon: 'error',
        title: 'Saldo Negativo',
        text: 'O saldo não pode ser negativo. Verifique os valores e tente novamente.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#FF5733', // Cor personalizada do botão
      }).then(() => {
        setLoading(false); // Desativa o carregamento após a mensagem
      });

      return; // Impede o envio se o saldo for negativo
    }

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
      items
    };

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
        confirmButtonText: 'Ok',
        confirmButtonColor: '#28a745', // Cor personalizada para sucesso
      }).then(() => {
        setLoading(false); // Desativa o carregamento após o sucesso
        window.location.reload(); // Recarrega a página após 2 segundos
      });

    } catch (error) {
      console.error(error);

      // Exibe o pop-up de erro
      Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Erro ao registar a requisição! Tente novamente.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#dc3545', // Cor personalizada para erro
      }).then(() => {
        setLoading(false); // Desativa o carregamento após o erro
      });
    }
  };

  return (
    <div className="container">
      <header className="text-center mb-4">
        <h3 className="header text-center" style={{ fontWeight: "bold", backgroundColor: "#264f36", color: "white" }}>
          Requisições Fundos</h3>

      </header>
      <div style={{ textAlign: 'center' }}>
        <label className="form-label text"><strong>Requisição Interna nº :</strong></label>
      </div>

      {/* Caixas para Dados do Requerente e Fornecedor */}
      <div className="row mb-1">
        <div className="col-md-6">
          <div className="box-container p-3 mb-4 border-black">
            <h5>Dados do Requerente</h5>
            <div className="mb-3">
              <input
                type="text"
                onChange={handleChangeNomeRequerente}
                value={nomeRequerente}
                className="form-control border-black placeholder-gray"
                placeholder="Nome do Requerente"
              />
            </div>

          </div>
        </div>

        <div className="col-md-6">

          <div className="box-container p-3 mb-4 border-black">

            <div className="row mb-3 align-items-center">
              <div className="mb-3">
                <label className="form-label text">Departamento</label>
                <select
                  className="form-control text border-black"
                  value={departamento} // O valor do estado é passado para o select
                  onChange={handleChangeDepartamento} // O manipulador de mudança é definido
                >
                  <option value="">Selecione um Departamento</option>
                  <option value="financeiro">Departamento Financeiro</option>
                  <option value="recursos_humanos">Recursos Humanos</option>
                  <option value="tecnologia">Departamento de Tecnologia</option>
                  <option value="marketing">Departamento de Marketing</option>
                  <option value="vendas">Departamento de Vendas</option>
                  <option value="juridico">Departamento Jurídico</option>
                  <option value="logistica">Departamento de Logística</option>
                  <option value="compras">Departamento de Compras</option>
                  <option value="comunicacao">Departamento de Comunicação</option>
                  <option value="administrativo">Departamento Administrativo</option>
                  <option value="atendimento_cliente">Atendimento ao Cliente</option>
                  <option value="pesquisa_desenvolvimento">Pesquisa e Desenvolvimento</option>
                  <option value="gestao_riscos">Gestão de Riscos</option>
                  <option value="saude_segurança">Saúde e Segurança</option>
                </select>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Caixa para Formulário de Requisição */}
      <div className="box-container p-3  border-black">
        <h5>Detalhes da Requisição</h5>
        <form onSubmit={handleAdicionarRequisicao} className="mb-1">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label text">Quantidade</label>
              <input
                placeholder="Quantidade"
                type="number"
                value={quantity}
                onChange={(e) => setQuantidade(e.target.value)}
                className="form-control border-black"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label text">Preço Unitário</label>
              <input
                placeholder="Preço Unitário"
                type="number"
                value={unitPrice}
                onChange={(e) => setPrecounit(e.target.value)}
                className="form-control  border-black"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label text">Comprovativo</label>
              <input
                placeholder="Comprovativo"
                type="btn"
                className="form-control  border-black"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label text">Descrição</label>
              <input
                placeholder="Descrição"
                type="text"
                value={description}
                onChange={(e) => setDesignacao(e.target.value)}
                className="form-control border-black"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label text">Beneficiário</label>
              <input
                placeholder="Beneficiário"
                type="text"
                className="form-control border-black"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label text">Classificação Orçamental</label>
              <input
                placeholder="Classificação Orçamental"
                type="text"
                className="form-control  border-black"
                required
              />
            </div>

          </div>
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary">
              {editIndex !== null ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela para Requisições */}
      <div className="table-responsive mb-4">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th></th>
              <th colSpan={3}>Comprovativo</th>
              <th colSpan={4}></th>
              <th colSpan={2}>Classificação da Despesa</th>
              <th></th>
            </tr>
            <tr>
              <th>Beneficiário</th>
              <th>Data</th>
              <th>Documento</th>
              <th>Número</th>
              <th>Quantidade</th>
              <th>Preço Unitário</th>
              <th>Valor</th>
              <th>Descrição</th>
              <th>C. Orçamental</th>
              <th>C. Finaceira</th>
              <th>Acções</th>
            </tr>
          </thead>

        </table>

        {/* Tabela para Controle de Requisições */}
        <div className="table-responsive mb-4">
          <h5 style={{ textAlign: 'center' }}>Controle Orçamental</h5>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Movimento</th>
                <th>Disponível Inicial </th>
                <th>Saldo Existente </th>
                <th>Valor da Presente Requisição </th>
                <th> Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>C. Orçamental</td>
              </tr>
              <tr>
                <td>C. Orçamental</td>
              </tr>
              <tr>
                <td>C. Orçamental</td>
              </tr>
              <tr>
                <td>C. Orçamental</td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
      {/* Retângulos com Informações */}
      <div className="row mb-4">

      </div>

      {/* Dados Lado a Lado */}
      <div className="row mb-4">
        {/* Lado Esquerdo */}
        <div className="col-md-3">
          <div className="mb-3">
            <label className='text'><strong>Nome do Encarregado</strong></label>
            <input type="text" value={namePersonCharge} className="form-control text" placeholder="Nome do Encarregado" />
          </div>
          <div className="mb-3">
            <label className="text"><strong>Data</strong></label>
            <input
              type="date"
              className="form-control"
              value={new Date().toISOString().split('T')[0]} // Define a operationDate atual
              readOnly // Impede edição, caso necessário
            />
          </div>

        </div>

        <div className="col-md-4">
        </div>

        {/* Lado Direito */}
        <div className="col-md-4">
          <div className="mb-3">
            <div className="text-center">
              <label className='text'><strong>Informação</strong></label>
            </div>
            <p className="text-justify text">
              Tem cabimento e está em condições de ser autorizado, no entanto V.ex melhor decidir.
            </p>
          </div>
          <div className="mb-3">
            <label><strong className='text'>Aprovado por</strong></label>
            <input onChange={handleChangeNomeAditoFinanceiro} value={nomeAditoFinanceiro} disabled type="text" className="form-control" />
          </div>
          <div className="mb-3">
            <label><strong className='text'>Data</strong></label>
            <input type="date" className="form-control" />
          </div>
        </div>
      </div>

      <div className="text-center">
        <button onClick={handleSubmeterRequisicoes} className="btn btn-success">
          Submeter Requisição
        </button>
      </div>


      <div className="text-center mt-4">
        <button onClick={handlePreview}>Pré-visualizar</button>
        {previewUrl && <iframe src={previewUrl} width="100%" height="500px" />}
        <button onClick={handleImprimirPDF} className="btn btn-primary mx-2">
          Imprimir PDF
        </button>
      </div>
    </div>
  );
};

export default FormRequisition2;
