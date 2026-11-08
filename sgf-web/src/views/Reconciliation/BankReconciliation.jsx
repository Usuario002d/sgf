import React, { useEffect, useState } from 'react';
import {
  Box, Grid, TextField, Button, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, Typography,
  Checkbox, CircularProgress, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import { CheckCircle, ErrorOutline, Description, Upload, DateRange } from '@mui/icons-material'; // Corrigido o ícone Error
import Papa from 'papaparse';
import Swal from 'sweetalert2'
import { fetchAllAccountingJournalAll, bankReconciliationService, findAccountRequestWhitConformance, getRegisteredAccounts, fetchAllAccountingJournalEntryAll, findAccountPlanBudjectEntriesByYear, fetchAccountRequestWhitConformance, fetchAllAccountingJournalEntry, createBankOutAccountingJournal, createBillToReceiveAccountingJournal, fetchOpenAccount } from '../../services/accountService';
import ConsultReconciledPayments from './ConsultReconciledPayments';

const BankReconciliation = () => {
  const [payments, setPayments] = useState([]);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reconciliationData, setReconciliationData] = useState([]);
  const [openImportDialog, setOpenImportDialog] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'reconcile' ou 'consult'


  const parseDateDDMMYYYY = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;

    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}`);
  };

  // const fetchPayments = async () => {
  //   try {
  //     setLoading(true);
  //     const AccountingJournalEntry = await fetchAllAccountingJournalEntryAll();
  //     const response = await fetchAccountRequestWhitConformance();
  //     console.log("AccountingJournalEntry ", AccountingJournalEntry);

  //     console.log("Dados Recebidos ", response);
  //     const filtered = response.filter(payment =>
  //       payment.internalRequest.paidReq &&
  //       parseDateDDMMYYYY(payment.operationDate) >= new Date(dateRange.start) &&
  //       parseDateDDMMYYYY(payment.operationDate) <= new Date(dateRange.end)
  //     );

  //     console.log("filtered", filtered);

  //     setPayments(response);
  //     setFilteredPayments(filtered);
  //   } catch (error) {
  //     console.error('Erro ao buscar pagamentos:', error);
  //     Swal.fire('Erro', 'Não foi possível carregar os pagamentos', 'error');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Processa o arquivo CSV importado
  const handleReconciliationCardClick = (type) => {
    console.log("consultar pagamentos")
    setActiveModal(type);
    setShowModal(true);
  };
  const fetchPayments = async () => {
    try {
      setLoading(true);

      // Buscar dados das APIs
      const AccountingJournalEntry = await fetchAllAccountingJournalEntryAll();
      const response = await fetchAccountRequestWhitConformance();

      // Criar um mapa de internalRequestId para AccountingJournalEntry
      const journalEntryMap = {};
      AccountingJournalEntry.forEach(entry => {
        if (entry.internalRequestId) {
          journalEntryMap[entry.internalRequestId] = {
            operationDate: entry.operationDate,
            description: entry.description,
            document: entry.accountingDocument.description
          };
        }
      });

      // Enriquecer os pagamentos com os dados do journal
      const enrichedResponse = response.map(payment => {
        const journalData = journalEntryMap[payment.internalRequestId] || {};
        return {
          ...payment,
          operationDate: journalData.operationDate,
          description: journalData.description || payment.description,
          document: journalData.document
        };
      });

      // 🔥 Remover duplicados com base no requestNumber
      const uniquePaymentsMap = new Map();
      enrichedResponse.forEach(payment => {
        const requestNumber = payment.internalRequest?.requestNumber;
        if (requestNumber && !uniquePaymentsMap.has(requestNumber)) {
          uniquePaymentsMap.set(requestNumber, payment);
        }
      });
      const uniquePayments = Array.from(uniquePaymentsMap.values());

      console.log("Pagamentos únicos:", uniquePayments);

      // Filtrar pelos critérios desejados
      const filtered = uniquePayments.filter(payment =>
        payment.internalRequest.paidReq &&
        parseDateDDMMYYYY(payment.operationDate) >= new Date(dateRange.start) &&
        parseDateDDMMYYYY(payment.operationDate) <= new Date(dateRange.end)
      );

      setPayments(uniquePayments); // 👈 usar lista sem duplicados
      setFilteredPayments(filtered);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      Swal.fire('Erro', 'Não foi possível carregar os pagamentos', 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleCsvImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Verifica se há dados no arquivo
          if (!results.data || results.data.length === 0) {
            throw new Error('O arquivo está vazio ou não contém dados válidos');
          }

          // Processa cada linha com tratamento robusto
          const transactions = [];
          const errors = [];

          results.data.forEach((row, index) => {
            const lineNumber = index + 2; // Linha no arquivo (+1 cabeçalho, +1 base 0)
            const rowErrors = [];

            // Validação da Data
            if (!row.Data) {
              rowErrors.push('Coluna "Data" vazia');
            } else if (isNaN(new Date(row.Data))) {
              rowErrors.push(`Formato de data inválido: "${row.Data}" (use DD/MM/AAAA ou AAAA-MM-DD)`);
            }

            // Validação do Valor - mais flexível
            let amount = null;
            if (!row.Valor && row.Valor !== 0) { // 0 é valor válido
              rowErrors.push('Coluna "Valor" vazia');
            } else {
              // Aceita vários formatos: "1.250,50", "1250.50", "1,250.50"
              const cleanValue = String(row.Valor)
                .replace(/[^\d,-]/g, '') // Remove caracteres não numéricos exceto , e -
                .replace('.', '') // Remove separadores de milhar
                .replace(',', '.'); // Converte decimal para padrão JS

              amount = parseFloat(cleanValue);

              if (isNaN(amount)) {
                rowErrors.push(`Valor inválido: "${row.Valor}"`);
              } else if (amount <= 0) {
                rowErrors.push(`Valor deve ser positivo: "${row.Valor}"`);
              }
            }

            // Validação da Referencia
            if (!row.Referencia || row.Referencia.trim() === '') {
              rowErrors.push('Coluna "Referencia" vazia');
            }
            // Se não houver erros, adiciona à lista de transações
            if (rowErrors.length === 0) {
              transactions.push({
                date: formatDate(row.Data), // Função que formata a data
                description: row.Descrição || '',
                amount: amount,
                document: row.Documento || null,
                referencia: row.Referencia, // <-- Adicionado aqui
                id: `txn-${Date.now()}-${index}`
              });
            } else {
              errors.push({
                line: lineNumber,
                errors: rowErrors,
                raw: JSON.stringify(row, null, 2)
              });
            }
          });

          // Se houver erros mas também transações válidas
          if (errors.length > 0 && transactions.length > 0) {
            Swal.fire({
              title: 'Importação parcialmente concluída',
              html: `
                  <div style="text-align: left; max-height: 60vh; overflow-y: auto;">
                    <p>Importados <strong>${transactions.length}</strong> registros válidos</p>
                    <p>Encontrados <strong>${errors.length}</strong> erros:</p>
                    
                    ${errors.slice(0, 5).map(err => `
                      <div style="margin: 10px 0; padding: 10px; background: #fff8f8; border-radius: 5px;">
                        <p><strong>Linha ${err.line}:</strong></p>
                        <ul style="margin: 5px 0 0 20px;">
                          ${err.errors.map(e => `<li>${e}</li>`).join('')}
                        </ul>
                        <pre style="font-size: 12px; margin: 5px 0 0; color: #666;">${err.raw}</pre>
                      </div>
                    `).join('')}
                    
                    ${errors.length > 5 ? `<p>... mais ${errors.length - 5} erro(s) não exibidos</p>` : ''}
                    
                    <p style="margin-top: 15px;">
                      <strong>Deseja continuar com os registros válidos?</strong><br>
                      Os registros com erro serão ignorados.
                    </p>
                  </div>
                `,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sim, importar válidos',
              cancelButtonText: 'Cancelar',
              width: '700px'
            }).then((result) => {
              if (result.isConfirmed) {
                setBankTransactions(transactions);
                performReconciliation(transactions);
                setOpenImportDialog(false);
              }
            });
          }
          // Se todos os registros tiverem erro
          else if (errors.length > 0) {
            throw {
              type: 'INVALID_DATA',
              message: 'Nenhum registro válido encontrado',
              errors: errors
            };
          }
          // Se tudo estiver ok
          else {
            console.log("sera que esta tudo bem?", transactions)
            setBankTransactions(transactions);
            performReconciliation(transactions);
            setOpenImportDialog(false);

            Swal.fire({
              title: 'Importação concluída',
              text: `${transactions.length} transações importadas com sucesso`,
              icon: 'success',
              timer: 2000
            });
          }
        } catch (error) {
          let errorMessage = error.message;

          if (error.type === 'INVALID_DATA') {
            errorMessage = `
                Nenhum registro válido encontrado no arquivo.<br><br>
                <strong>Erros encontrados (${error.errors.length}):</strong><br>
                ${error.errors.slice(0, 3).map(err =>
              `Linha ${err.line}: ${err.errors.join(', ')}`
            ).join('<br>')}
                ${error.errors.length > 3 ? `<br>... mais ${error.errors.length - 3} erro(s)` : ''}
              `;
          }

          Swal.fire({
            title: 'Erro na importação',
            html: errorMessage,
            icon: 'error',
            width: '600px'
          });
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setLoading(false);
        Swal.fire({
          title: 'Erro ao ler arquivo',
          text: 'O arquivo pode estar corrompido ou em formato inválido',
          icon: 'error'
        });
      }
    });
  };

  // Função auxiliar para formatar datas
  const formatDate = (dateString) => {
    // Converte vários formatos para YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; // Retorna original se não puder converter

    return date.toISOString().split('T')[0];
  };

  // Realiza a reconciliação automática
  const performReconciliation = (transactions) => {
    console.log("Reconciliandoss:", transactions);
    console.log("filteredPayments:", filteredPayments);



    const results = filteredPayments.map(payment => {
      const matchedTransaction = transactions.find(transaction =>
        transaction.referencia && transaction.referencia === payment.internalRequest?.requestNumber && // 📝 Valida referência
        Math.abs(transaction.amount - parseFloat(payment.totalAmount)) < 0.01 // 🪙 Valida v
      );

      const logInfo = {
        paymentId: payment.id,
        requestNumber: payment.internalRequest?.requestNumber,
        documentSearched: payment.internalRequest?.requestNumber,
        matched: matchedTransaction ? '✅ Encontrado' : '❌ Não encontrado',
      };

      console.log("Reconciliando:", logInfo);

      return {
        payment: {
          id: payment.id,
          requestNumber: payment.internalRequest?.requestNumber || '',
          date: payment.operationDate,
          amount: parseFloat(payment.totalAmount),
          document: payment.document || '',
          description: payment.description,
          referencia: payment.internalRequest?.requestNumber || '',
        },
        transaction: matchedTransaction
        ? {
            ...matchedTransaction,
            description: matchedTransaction.description && matchedTransaction.description.trim() !== ''
              ? matchedTransaction.description
              : 'Sem descrição',
          }
        : null,
        status: matchedTransaction ? 'matched' : 'unmatched',
        reconciled: matchedTransaction ? true : false
      };
    });

    console.log("resultados da reconciliacao", results)
    setReconciliationData(results);
  };

  // Atualiza o status de reconciliação
  const toggleReconciliation = (index) => {
    const updated = [...reconciliationData];
    updated[index].reconciled = !updated[index].reconciled;
    setReconciliationData(updated);
  };

  // Finaliza o processo
  const finalizeReconciliation = () => {
    const unreconciled = reconciliationData.filter(item => !item.reconciled);
    if (unreconciled.length > 0) {
      Swal.fire({
        title: 'Atenção',
        text: `${unreconciled.length} itens não reconciliados. Deseja continuar?`,
        icon: 'warning',
        showCancelButton: true
      }).then(result => {
        if (result.isConfirmed) saveReconciliation();
      });
    } else {
      saveReconciliation();
    }
  };

  // Simulação: Salvar no backend
  // BankReconciliation.js

  const saveReconciliation = async () => {
    try {
      setLoading(true);

      // Verifica se há itens reconciliados
      const hasReconciledItems = reconciliationData.some(item => item.reconciled);

      if (!hasReconciledItems) {
        await Swal.fire({
          title: 'Atenção',
          text: 'Nenhum item selecionado para reconciliação. Deseja continuar?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, continuar',
          cancelButtonText: 'Cancelar'
        });

        return;
      }

      // Mostra confirmação antes de salvar
      const result = await Swal.fire({
        title: 'Confirmar reconciliação',
        text: `Você está prestes a reconciliar ${reconciliationData.filter(item => item.reconciled).length} itens. Continuar?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, reconciliar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      });

      if (!result.isConfirmed) {
        return;
      }

      const reconciliationD = reconciliationData.filter(item => item.status === 'matched');

      console.log("reconciliationD", reconciliationD)

      // Chama o serviço de reconciliação
      await bankReconciliationService(reconciliationD);

      // Feedback de sucesso
      await Swal.fire({
        title: 'Sucesso!',
        text: 'Reconciliação realizada com sucesso.',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true
      });

      // Atualiza os dados após salvar
      fetchPayments();
      setBankTransactions([]);
      setReconciliationData([]);

    } catch (error) {
      console.error('Erro na reconciliação:', error);

      let errorMessage = 'Falha ao salvar reconciliação';
      if (error.message.includes('Nenhum item selecionado')) {
        errorMessage = error.message;
      }

      await Swal.fire({
        title: 'Erro',
        text: error,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [dateRange]);

  return (


    <div style={{ width: "100%", padding: "16px 24px" }}>
      {/* Header Executivo Compacto */}
      <div className="sgf-header-box mb-3 d-flex align-items-center justify-content-between" style={{
        background: "linear-gradient(135deg, #0f5132 0%, #145a32 100%)",
        color: "#ffffff",
        padding: "12px 20px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(15, 81, 50, 0.15)"
      }}>
        <div>
          <h5 className="mb-0" style={{ fontWeight: 700, letterSpacing: "0.5px", fontSize: "1.2rem", color: "#ffffff" }}>
            Reconciliação Bancária
          </h5>
          <small style={{ color: "#d1e7dd", fontSize: "0.85rem" }}>
            Confronto e validação de extratos bancários com movimentos do sistema
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Chip
            icon={<CheckCircle style={{ color: '#0f5132', fontSize: 18 }} />}
            label={`${filteredPayments.length} pagamentos no período`}
            style={{
              backgroundColor: "#e8f5e9",
              color: "#0f5132",
              fontWeight: 600,
              border: "1px solid #c8e6c9"
            }}
          />
        </div>
      </div>
      <Box sx={{ p: 3 }}>

        {/* Filtros com fundo gradiente premium */}
        <Grid container spacing={2} sx={{
          mb: 3,
          p: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Data Início"
              type="date"
              fullWidth
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              InputLabelProps={{
                shrink: true,
                sx: {
                  fontWeight: 'bold',
                  color: '#000000 !important', // Preto total
                  fontSize: '1.1rem', // Tamanho aumentado
                  '&.Mui-focused': {
                    color: '#000000 !important' // Mantém preto mesmo quando focado
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: 1,
                  '& fieldset': {
                    borderColor: '#000000' // Borda preta
                  },
                  '&:hover fieldset': {
                    borderColor: '#000000' // Borda preta no hover
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '1.05rem' // Tamanho aumentado para o texto interno
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Data Fim"
              type="date"
              fullWidth
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              InputLabelProps={{
                shrink: true,
                sx: {
                  fontWeight: 'bold',
                  color: '#000000 !important', // Preto absoluto
                  fontSize: '1.1rem', // 10% maior que o padrão
                  '&.Mui-focused': {
                    color: '#000000 !important' // Mantém preto quando em foco
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: 1,
                  '& fieldset': {
                    borderColor: '#000000' // Borda preta
                  },
                  '&:hover fieldset': {
                    borderColor: '#000000' // Borda preta no hover
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000000' // Borda preta quando focado
                  }
                },
                '& .MuiInputBase-input': {
                  fontSize: '1.05rem', // Texto interno maior
                  color: '#000000' // Cor do texto interno preta
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Botão para importar extrato */}
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={() => setOpenImportDialog(true)}
              sx={{
                backgroundColor: '#0f5132',
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#0a3622' }
              }}
            >
              Importar Extrato
            </Button>

            {/* Botão para atualizar */}
            <Button
              variant="contained"
              startIcon={<DateRange />}
              onClick={fetchPayments}
              disabled={loading}
              sx={{
                backgroundColor: '#b45309',
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#92400e' }
              }}
            >
              Atualizar
            </Button>

            {/* Chip para quantidade de pagamentos */}
            <Chip
              label={`${filteredPayments.length} pagamentos`}
              sx={{
                background: 'linear-gradient(45deg,rgb(4, 75, 138) 0%,rgb(1, 13, 14) 100%)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '20px',
                boxShadow: '0px 2px 5px rgba(0,0,0,0.2)'
              }}
            />

            {/* Botão para consultar pagamentos reconciliados */}
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => handleReconciliationCardClick('consult')}
              sx={{
                backgroundColor: '#ffffff',
                borderColor: '#0f5132',
                color: '#0f5132',
                border: '1px solid #0f5132',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#f0fdf4' }
              }}
            >
              Reconciliados
            </Button>
          </Grid>

        </Grid>

        {/* Resultados */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', padding: '10px 14px' }}>Conciliar</TableCell>
                  <TableCell style={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', padding: '10px 14px' }}>Data</TableCell>
                  <TableCell style={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', padding: '10px 14px' }}>Descrição</TableCell>
                  <TableCell style={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', padding: '10px 14px' }}>Documento</TableCell>
                  <TableCell style={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', padding: '10px 14px' }}>Referencia</TableCell>
                  <TableCell style={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', padding: '10px 14px' }}>Valor</TableCell>
                  <TableCell style={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', padding: '10px 14px' }}>Status</TableCell>
                  <TableCell style={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', padding: '10px 14px' }}>Transação Bancária</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reconciliationData.length > 0 ? (
                  reconciliationData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Checkbox
                          checked={item.reconciled}
                          onChange={() => toggleReconciliation(index)}
                          color="primary"
                          disabled={item.status === 'unmatched'}
                        />
                      </TableCell>
                      <TableCell>{item.payment.date}</TableCell>
                      <TableCell>{item.payment.description}</TableCell>
                      <TableCell>{item.payment.document}</TableCell>
                      <TableCell>{item.payment.referencia}</TableCell>
                      <TableCell>
                        {item.payment.amount.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                          style: 'decimal'
                        })}
                      </TableCell>
                      <TableCell>
                        {item.status === 'matched' ? (
                          <CheckCircle color="success" />
                        ) : (
                          <ErrorOutline color="error" />
                        )}
                      </TableCell>
                      <TableCell>
                        {item.transaction ? (
                          <Box>
                            <Typography variant="body2">{item.transaction.description}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.transaction.date} • {item.transaction.amount.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                style: 'decimal'
                              })}
                            </Typography>
                          </Box>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} style={{ textAlign: 'center', padding: '16px 0' }}>
                      {bankTransactions.length > 0
                        ? 'Nenhum pagamento encontrado no período selecionado'
                        : 'Importe um extrato bancário para iniciar a reconciliação'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>


            {reconciliationData.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={finalizeReconciliation}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#0f5132',
                    color: '#ffffff',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 3,
                    boxShadow: 'none',
                    '&:hover': { backgroundColor: '#0a3622' }
                  }}
                >
                  Finalizar Reconciliação
                </Button>
              </Box>
            )}
          </Paper>
        )}

        {/* Dialog de importação */}
        <Dialog open={openImportDialog} onClose={() => setOpenImportDialog(false)}>
          <DialogTitle>Importar Extrato Bancário</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Selecione o arquivo CSV com as transações bancárias
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Formato esperado: Data, Descrição, Valor, Documento (opcional)
            </Typography>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              style={{ display: 'block', marginTop: '16px' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenImportDialog(false)}>Cancelar</Button>
          </DialogActions>
        </Dialog>
      </Box>


      {showModal && activeModal === 'consult' && (
        <ConsultReconciledPayments
          open={showModal}
          onClose={() => setShowModal(false)}
          reconciledPayments={payments.filter(p => p.internalRequest.isReconciled === 1)}
          unreconciledPayments={payments.filter(p => p.internalRequest.isReconciled === 0)}
          loading={loading}
        />
      )}
    </div>

  );
};

export default BankReconciliation;