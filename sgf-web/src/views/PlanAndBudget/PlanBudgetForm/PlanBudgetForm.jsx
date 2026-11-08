import { blackColor } from 'assets/jss/material-dashboard-react';
import React, { useState } from 'react';

//Estilos do componente 
const styles = {
  header: {
    border: '1px solid #ccc',
    padding: '10px',
    backgroundColor: '#6ac762',
    textAlign: 'center',
  },
  cell: {
    border: '1px solid #ccc',
    padding: '7px',
    textAlign: 'rigth',
    color : 'black',
  },
  input: {
    width: '90%',
    padding: '7px',
  
  },
  button: {
    padding: '10px 20px',
    margin: '5px',
    backgroundColor: '#6ec271',
    color: '#080808',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};


const TabelaOrcamento = () => {
  //Construcao da tabela e insercao de dados usando Script
  const [dados, setDados] = useState([
    { codigo: '1.0.0.0.00', descricao: 'Despesas Correntes', dotacao: '', backgroundColor:'#deee'},
    { codigo: '1.1.0.0.00', descricao: 'Despesas com o Pessoal', dotacao: '', backgroundColor: '#deee' },
    { codigo: '1.1.1.0.00', descricao: 'Salários e Remunerações', dotacao: '' , backgroundColor: '#deee'},
    { codigo: '1.1.1.1.00', descricao: 'Pessoal Civil', dotacao: '' , backgroundColor: '#deee'},
    { codigo: '1.1.1.1.01', descricao: 'Vencimento Base do Pessoal Civil', dotacao: ''},
    { codigo: '1.1.1.1.02', descricao: 'Vencimento Base do Pessoal Civil Fora do Quadro', dotacao: ''},
    { codigo: '1.1.1.1.03', descricao: 'Remuneração do Pessoal Civil Estrangeiro', dotacao: '' },
    { codigo: '1.1.1.1.08', descricao: 'Remunerações Extraordinárias de Pessoal Civil', dotacao: '' },
    { codigo: '1.1.1.1.12', descricao: 'Retrospetivo Salariais do Exercicio Corrente para Pessoal Civil', dotacao: ''},
    { codigo: '1.1.1.1.99', descricao: 'Outros Salarios e Remunerações de Pessoal Civil', dotacao: '' },
    { codigo: '1.1.2.0.00', descricao: 'Demais Despesas com o Pessoal', dotacao: '' , backgroundColor: '#deee'},
    { codigo: '1.1.2.1.00', descricao: 'Pessoal Civil', dotacao: '', backgroundColor: '#deee'},
    { codigo: '1.1.2.1.01', descricao: 'Ajudas de Custo Dentro do País para o Pessoal Civil', dotacao: '' },
    { codigo: '1.1.2.1.02', descricao: 'Ajudas de Custo no Exterior para o Pessoal Civil (MDC)', dotacao: '' },
    { codigo: '1.1.2.1.03', descricao: 'Auxilio do Pessoal Civil', dotacao: '' },
    { codigo: '1.1.2.1.04', descricao: 'Renda de Casa para Pessoal Civil', dotacao: '' },
    { codigo: '1.1.2.1.05', descricao: 'Representação para Pessoal Civil', dotacao: '' },
    { codigo: '1.1.2.1.10', descricao: 'Remunerações Extraordinárias para Pessoal Civil', dotacao: '' },
    { codigo: '1.1.2.1.11', descricao: 'Contratação por Tempo Determinado do Pessoal Civil', dotacao: '' },
    { codigo: '1.1.2.1.99', descricao: 'Outras Despesas com Pessoal Civil', dotacao: '' },
    { codigo: '1.2.0.0.00', descricao: 'Bens e Serviços', dotacao: '', backgroundColor: '#deee' },
    { codigo: '1.2.1.0.00', descricao: 'Bens ', dotacao: '' , backgroundColor: '#deee'},
    { codigo: '1.2.1.0.01', descricao: 'Combustíveis e Lubrificantes', dotacao: '' },
    { codigo: '1.2.1.0.02', descricao: 'Material para Manutenção e Reparação de Imóveis', dotacao: '' },
    { codigo: '1.2.1.0.03', descricao: 'Material para Manutenção e Reparação de Equipamento', dotacao: '' },
    { codigo: '1.2.1.0.05', descricao: 'Material de Consumo para Escritório', dotacao: '' },
    { codigo: '1.2.1.0.06', descricao: 'Material Duradouro de Escritório', dotacao: '' },
    { codigo: '1.2.1.0.07', descricao: 'Fardamento e Calçado', dotacao: '' },
    { codigo: '1.2.1.0.08', descricao: 'Sobressalentes para Equipamento, Maquinas e Motores', dotacao: '' },
    { codigo: '1.2.1.0.10', descricao: 'Generos Alimenticios', dotacao: '' },
    { codigo: '1.2.1.0.11', descricao: 'Material de Limpeza e Higiene', dotacao: '' },
    { codigo: '1.2.1.0.14', descricao: 'Material de Uso Duradouro', dotacao: '' },
    { codigo: '1.2.1.0.20', descricao: 'Material para Representação', dotacao: '',  },
    { codigo: '1.2.1.0.21', descricao: 'Material para Festividades, Homenagens e Premiações', dotacao: '' },
    { codigo: '1.2.1.0.22', descricao: 'Material de Consumo para Informatica', dotacao: '' },
    { codigo: '1.2.1.0.23', descricao: 'Material Duradouro para Informatica', dotacao: '' },
    { codigo: '1.2.1.0.24', descricao: 'Software de Base', dotacao: '' },
    { codigo: '1.2.1.0.25', descricao: 'Material de Cama, Banho e Mesa', dotacao: '' },
    { codigo: '1.2.1.0.26', descricao: 'Material de Consumo para Copa e Cozinha', dotacao: '' },
    { codigo: '1.2.1.0.27', descricao: 'Material Duradouro de Copa e Cozinha', dotacao: '' },
    { codigo: '1.2.1.0.98', descricao: 'Outros Bens de Consumo', dotacao: '' },
    { codigo: '1.2.1.0.99', descricao: 'Outros Bens Duradouros', dotacao: '' },
    { codigo: '1.2.2.0.00', descricao: 'Serviços', dotacao: '' , backgroundColor: '#deee'},
    { codigo: '1.2.2.0.01', descricao: 'Comunicações em Geral', dotacao: '',  },
    { codigo: '1.2.2.0.02', descricao: 'Passagens Dentro do País', dotacao: '' },
    { codigo: '1.2.2.0.03', descricao: 'Passagens Fora do País', dotacao: '' },
    { codigo: '1.2.2.0.04', descricao: 'Renda de Instalações (na componente de Chancelaria)', dotacao: '' },
    { codigo: '1.2.2.0.05', descricao: 'Manutenção e Reparação de Imóveis', dotacao: '' },
    { codigo: '1.2.2.0.06', descricao: 'Manutenção e Reparação de Bens Moveis', dotacao: '' },
    { codigo: '1.2.2.0.07', descricao: 'Manutenção e Reparação de Veiculos', dotacao: '' },
    { codigo: '1.2.2.0.08', descricao: 'Transporte e Carga', dotacao: '' },
    { codigo: '1.2.2.0.09', descricao: 'Seguros', dotacao: '' },
    { codigo: '1.2.2.0.10', descricao: 'Representação', dotacao: '' },
    { codigo: '1.2.2.0.11', descricao: 'Festividades, Homenagens e Premiação', dotacao: '' },
    { codigo: '1.2.2.0.12', descricao: 'Àgua', dotacao: '' },
    { codigo: '1.2.2.0.13', descricao: 'Energia eléctrica', dotacao: '' },
    { codigo: '1.2.2.0.14', descricao: 'Consultoria e Assistencia Tecnica Residente Pessoal Singular', dotacao: '' },
    { codigo: '1.2.2.0.15', descricao: 'Consultoria e Assistencia Tecnica Residente Pessoal Colectiva', dotacao: '' },
    { codigo: '1.2.2.0.16', descricao: 'Consultoria e Assistencia Tecnica nao Residente Pessoal Singular', dotacao: '',  },
    { codigo: '1.2.2.0.17', descricao: 'Consultoria e Assistencia Tecnica nao Residente Pessoal Colectiva', dotacao: '' },
    { codigo: '1.2.2.0.18', descricao: 'Contratos de Manutenção para Maquinas e Equipamento', dotacao: '' },
    { codigo: '1.2.2.0.21', descricao: 'Limpeza e Conservação', dotacao: '' },
    { codigo: '1.2.2.0.22', descricao: 'Servicos de Segurança', dotacao: '' },
    { codigo: '1.2.2.0.23', descricao: 'Transporte de Funcionarios', dotacao: '' },
    { codigo: '1.2.2.0.99', descricao: 'Outros Serviços', dotacao: '' },
    { codigo: '1.4.0.0.00', descricao: 'Transferências Correntes', dotacao: '' , backgroundColor: '#deee'},
    { codigo: '1.4.3.1.03', descricao: 'Subsidio por Morte para Civis', dotacao: '' },
    { codigo: '1.4.3.4.01', descricao: 'Bolsas de Estudos no Pais', dotacao: '' },
    { codigo: '1.4.3.4.02', descricao: 'Bolsas de Estudos no Exterior (MDC)', dotacao: '' },
    { codigo: '1.4.3.4.08', descricao: 'Assistência Médica e Medicamentosa no Exterior', dotacao: '' },
    { codigo: '1.4.4.0.02', descricao: 'Transferencias Correntes a Organismos Internacionais Sectoriais', dotacao: '' },
    { codigo: '1.6.0.0.00', descricao: 'Exercicios Findos', dotacao: '' , backgroundColor: '#deee'},
    { codigo: '1.6.1.0.00', descricao: 'Retroactivos Salariais do Exercicio Corrente para Pessoal Civil', dotacao: '', backgroundColor: '#deee' },
    { codigo: '1.6.0.0.01', descricao: 'Retroactivos Salariais do Exercicio Anteriores para Pessoal Civil', dotacao: '' },
    { codigo: '1.6.2.0.00', descricao: 'Retroactivos de Bens e Servicos', dotacao: '', backgroundColor: '#deee' },
    { codigo: '1.6.2.0.01', descricao: 'Pagamentos Exercicios Anteriores Relativos a Bens de Consumo', dotacao: '' },
    { codigo: '1.6.2.0.02', descricao: 'Pagamentos Exercicios Anteriores Relativos a Bens Dur e Perman.', dotacao: '' },
    { codigo: '1.6.2.0.03', descricao: 'Pagamentos de Exercicios Anteriores Relativos a Serviços', dotacao: '' },
    { codigo: '1.6.2.0.04', descricao: 'Pagamentos de  Exercicios Anteriores Relativos a Obras', dotacao: '',  },
    { codigo: '', descricao: 'Total de Despesas correntes ', dotacao: '', backgroundColor: '#deee' },
    { codigo: '2.0.0.0.00', descricao: 'Despesas de Capital', dotacao: '', backgroundColor: '#deee' },
    { codigo: '2.1.0.0.00', descricao: 'Bens de Capital', dotacao: '', backgroundColor: '#deee' },
    { codigo: '2.1.1.0.00', descricao: 'Construções', dotacao: '' , backgroundColor: '#deee'},
    { codigo: '2.1.1.0.01', descricao: 'Obras e Curso', dotacao: '' },
    { codigo: '2.1.1.0.02', descricao: 'Habitações', dotacao: '' },
    { codigo: '2.1.1.0.03', descricao: 'Edifícios', dotacao: '' },
    { codigo: '2.1.1.0.04', descricao: 'Benfeitorias em bens moveis', dotacao: '' },
    { codigo: '2.1.1.0.99', descricao: 'Outras Construções', dotacao: '' },
    { codigo: '2.1.2.0.00', descricao: 'Maquinaria, Equipamento e Mobiliario', dotacao: '' , backgroundColor: '#deee'},
    { codigo: '2.1.2.0.14', descricao: 'Mobiliario em Geral', dotacao: '' },
    { codigo: '2.1.2.0.15', descricao: 'Equipamento de Escritorio', dotacao: '' },
    { codigo: '2.1.2.0.16', descricao: 'Aparelhos de Imagem', dotacao: '' },
    { codigo: '2.1.2.0.17', descricao: 'Material Bibliografico', dotacao: '' },
    { codigo: '2.1.2.0.18', descricao: 'Obras e Pecas de Arte', dotacao: '' },
    { codigo: '2.1.2.0.19', descricao: 'Equipamento de Informatica', dotacao: '' },
    { codigo: '2.1.2.0.20', descricao: 'Ferramentas de Uso Geral', dotacao: '' },
    { codigo: '2.1.2.0.21', descricao: 'Utensilios de Apoio Administrativo', dotacao: '' },
    { codigo: '2.1.2.0.99', descricao: 'Outras Maquinarias, Equipamentos e Mobiliarios', dotacao: '' },
    { codigo: '2.1.3.0.00', descricao: 'Meios de Transporte', dotacao: '', backgroundColor: '#deee' },
    { codigo: '2.1.3.0.01', descricao: 'Automovel Ligeiro', dotacao: '' },
    { codigo: '2.1.3.0.03', descricao: 'Automovel Pesado de Passageiros', dotacao: '',  },
    { codigo: '2.1.3.0.04', descricao: 'Motociclo', dotacao: '' },
    { codigo: '2.1.3.0.99', descricao: 'Outros Meios de Transporte', dotacao: '',  },
    { codigo: ' ', descricao: 'Total de Despesas de Capital', dotacao: '' , backgroundColor: '#deee'},
    { codigo: ' ', descricao: 'Total Orçamento Global ', dotacao: '' , backgroundColor: '#deee'},
  ]);


//Para utilizador digitar valor/dotacao inicial
  const handleInputChange = (index, e) => {
    const novoDado = [...dados];
    novoDado[index].dotacao = e.target.value;
    setDados(novoDado);
  };

  //Organizando paginas do componente
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const ultima = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = ultima - itensPorPagina;
  const itensVisiveis = dados.slice(indicePrimeiroItem, ultima);

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const proximaPagina = () => {
    if (paginaAtual < Math.ceil(dados.length / itensPorPagina)) {
      setPaginaAtual(paginaAtual + 1);
    }
  };
//Fase de renderizacao 
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h4>Tabela de Plano e Orçamento</h4>
      <table style={{ width: '70%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={styles.header}>Código</th>
            <th style={styles.header}>Designação</th>
            <th style={styles.header}>Dotação Inicial</th>
          </tr>
        </thead>
              <tbody>
                {itensVisiveis.map((item, index) => (
                  <tr key={index}>
                    <td style={{ ...styles.cell, backgroundColor: item.backgroundColor || 'white' }}>{item.codigo}</td>
                    <td style={{ ...styles.cell, backgroundColor: item.backgroundColor || 'white' }}>{item.descricao}</td>
                    <td style={{ ...styles.cell, backgroundColor: item.backgroundColor || 'white' }}>{item.dotacao}</td>
                  </tr>
                ))}
            </tbody>
      </table>

      <div style={{ textAlign: 'center' }}>
        <button onClick={paginaAnterior} disabled={paginaAtual === 1} style={styles.button}>Anterior</button>
        <span>{paginaAtual}</span>
        <button onClick={proximaPagina} disabled={paginaAtual === Math.ceil(dados.length / itensPorPagina)}
          style={styles.button}>Próxima</button>
      </div>
    </div>
  );
};
export default TabelaOrcamento;