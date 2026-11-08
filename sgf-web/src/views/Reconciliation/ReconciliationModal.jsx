import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Button, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, Typography,
  Checkbox, CircularProgress, Chip, Box, IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle, ErrorOutline, Upload, DateRange,
  Close, CloudUpload, Description
} from '@mui/icons-material';
import Papa from 'papaparse';
import Swal from 'sweetalert2';

const ReconciliationModal = ({
  open,
  onClose,
  payments = [],
  onSaveReconciliation
}) => {
  // Estados do componente
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [bankTransactions, setBankTransactions] = useState([]);
  const [reconciliationData, setReconciliationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState([]);

  // Filtra pagamentos pelo período selecionado
  useEffect(() => {
    const filtered = payments.filter(payment => {
      const paymentDate = new Date(payment.operationDate);
      return (
        paymentDate >= new Date(dateRange.start) &&
        paymentDate <= new Date(dateRange.end)
      );
    });
    setFilteredPayments(filtered);
  }, [payments, dateRange]);

  // Realiza a reconciliação quando há transações bancárias
  useEffect(() => {
    if (bankTransactions.length > 0 && filteredPayments.length > 0) {
      performReconciliation();
    }
  }, [bankTransactions, filteredPayments]);

  // Função para realizar a reconciliação automática
  const performReconciliation = () => {
    setLoading(true);
    
    const results = filteredPayments.map(payment => {
      // Tenta encontrar transação correspondente
      const matchedTransaction = bankTransactions.find(transaction => {
        return (
          // Compara por número do documento
          (transaction.document && transaction.document === payment.internalRequest?.requestNumber) ||
          // Ou por valor e data (com margem de 1 dia)
          (
            Math.abs(transaction.amount - payment.totalAmount) < 0.01 &&
            Math.abs(new Date(transaction.date) - new Date(payment.operationDate)) < 86400000
          )
        );
      });

      return {
        payment: {
          ...payment,
          id: payment.id,
          date: payment.operationDate,
          amount: payment.totalAmount,
          document: payment.documentNumber || '',
          description: payment.description || 'Pagamento sem descrição',
          reference: payment.internalRequest?.requestNumber || ''
        },
        transaction: matchedTransaction || null,
        status: matchedTransaction ? 'matched' : 'unmatched',
        reconciled: false
      };
    });

    setReconciliationData(results);
    setLoading(false);
  };

  // Manipula a importação do arquivo CSV
  const handleCsvImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setImportDialogOpen(false);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            throw new Error('O arquivo está vazio ou não contém dados válidos');
          }

          const transactions = results.data.map((row, index) => {
            // Converte valor para número
            const amount = parseFloat(String(row.Valor).replace('.', '').replace(',', '.'));
            
            if (isNaN(amount)) {
              throw new Error(`Valor inválido na linha ${index + 1}: ${row.Valor}`);
            }

            return {
              date: formatDate(row.Data),
              description: row.Descrição || 'Transação sem descrição',
              amount: amount,
              document: row.Documento || row.Referência || '',
              id: `txn-${Date.now()}-${index}`
            };
          });

          setBankTransactions(transactions);
          Swal.fire('Sucesso!', `${transactions.length} transações importadas com sucesso.`, 'success');
        } catch (error) {
          Swal.fire('Erro na importação', error.message, 'error');
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        Swal.fire('Erro', 'Falha ao processar o arquivo CSV', 'error');
        setLoading(false);
      }
    });
  };

  // Formata data para YYYY-MM-DD
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? dateString : date.toISOString().split('T')[0];
  };

  // Alterna o status de reconciliação de um item
  const toggleReconciliation = (index) => {
    const updated = [...reconciliationData];
    updated[index].reconciled = !updated[index].reconciled;
    setReconciliationData(updated);
  };

  // Finaliza o processo de reconciliação
  const handleFinalize = async () => {
    try {
      setLoading(true);
      
      // Filtra apenas os itens reconciliados
      const reconciledItems = reconciliationData.filter(item => item.reconciled);
      
      if (reconciledItems.length === 0) {
        throw new Error('Nenhum item selecionado para reconciliação');
      }

      // Chama a função de salvamento passada como prop
      await onSaveReconciliation(reconciledItems);
      
      Swal.fire('Sucesso!', 'Reconciliação concluída com sucesso.', 'success');
      onClose();
    } catch (error) {
      Swal.fire('Erro', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(to bottom, #f5f7fa 0%, #e4e8eb 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }
      }}
    >
      {/* Cabeçalho do modal */}
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #3a4a6b 0%, #1e2b4d 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box display="flex" alignItems="center">
          <Description sx={{ mr: 1.5, fontSize: '1.8rem' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Reconciliação de Pagamentos
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Conteúdo principal */}
      <DialogContent sx={{ p: 0 }}>
        {/* Seção de filtros */}
        <Grid container spacing={2} sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(16,57,150,0.08) 0%, rgba(88,81,219,0.08) 50%, rgba(193,53,132,0.08) 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Data Início"
              type="date"
              fullWidth
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#3a4a6b'
                  }
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
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#3a4a6b'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Importar extrato bancário em formato CSV">
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => setImportDialogOpen(true)}
                sx={{
                  background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #3a7bd5 0%, #00d2ff 100%)'
                  }
                }}
              >
                Importar Extrato
              </Button>
            </Tooltip>
            
            <Button
              variant="contained"
              startIcon={<DateRange />}
              onClick={performReconciliation}
              disabled={loading || bankTransactions.length === 0}
              sx={{
                background: 'linear-gradient(45deg, #a6c1ee 0%, #fbc2eb 100%)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: 2,
                px: 3,
                '&:disabled': {
                  opacity: 0.7,
                  background: '#e0e0e0'
                },
                '&:hover': {
                  background: 'linear-gradient(45deg, #85a5d8 0%, #f8a4d8 100%)'
                }
              }}
            >
              Reconciliar
            </Button>
            
            <Chip
              label={`${filteredPayments.length} pagamentos`}
              sx={{
                background: 'rgba(58,74,107,0.1)',
                color: '#3a4a6b',
                border: '1px solid rgba(58,74,107,0.2)',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                height: '36px'
              }}
            />
            
            {bankTransactions.length > 0 && (
              <Chip
                label={`${bankTransactions.length} transações`}
                sx={{
                  background: 'rgba(0,150,136,0.1)',
                  color: '#00796b',
                  border: '1px solid rgba(0,150,136,0.2)',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  height: '36px'
                }}
              />
            )}
          </Grid>
        </Grid>

        {/* Tabela de resultados */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#3a4a6b' }} />
          </Box>
        ) : (
          <Paper sx={{ m: 3, mb: 0, borderRadius: 2, overflow: 'hidden' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(to right, #3a4a6b, #1e2b4d)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Conciliar</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Documento</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Referência</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Valor</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Transação Bancária</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {reconciliationData.length > 0 ? (
                  reconciliationData.map((item, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        '&:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                        '&:last-child td': { borderBottom: 0 }
                      }}
                    >
                      <TableCell>
                        <Checkbox
                          checked={item.reconciled}
                          onChange={() => toggleReconciliation(index)}
                          color="primary"
                          disabled={item.status === 'unmatched'}
                          sx={{
                            '&.Mui-checked': { color: '#00c853' }
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>{item.payment.date}</TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.payment.description}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>{item.payment.document}</TableCell>
                      
                      <TableCell>{item.payment.reference}</TableCell>
                      
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {item.payment.amount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </TableCell>
                      
                      <TableCell>
                        {item.status === 'matched' ? (
                          <Chip
                            icon={<CheckCircle />}
                            label="Correspondente"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            icon={<ErrorOutline />}
                            label="Não encontrado"
                            color="error"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {item.transaction ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.transaction.description}
                            </Typography>
                            <Box display="flex" alignItems="center" mt={0.5}>
                              <Typography variant="caption" sx={{ mr: 1.5, color: 'text.secondary' }}>
                                {item.transaction.date}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                {item.transaction.amount.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma transação correspondente
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{ color: 'text.secondary' }}>
                        {bankTransactions.length > 0 ? (
                          <>
                            <Description sx={{ fontSize: '3rem', color: 'rgba(0,0,0,0.1)', mb: 1 }} />
                            <Typography variant="h6">
                              Nenhum pagamento encontrado no período
                            </Typography>
                            <Typography variant="body2">
                              Ajuste o período ou verifique seus dados
                            </Typography>
                          </>
                        ) : (
                          <>
                            <CloudUpload sx={{ fontSize: '3rem', color: 'rgba(0,0,0,0.1)', mb: 1 }} />
                            <Typography variant="h6">
                              Importe um extrato bancário
                            </Typography>
                            <Typography variant="body2">
                              Para começar a reconciliação, importe um arquivo CSV com as transações
                            </Typography>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}
      </DialogContent>

      {/* Rodapé do modal */}
      <DialogActions sx={{
        p: 2,
        borderTop: '1px solid rgba(0,0,0,0.05)',
        background: 'rgba(0,0,0,0.02)',
        justifyContent: 'space-between'
      }}>
        <Box>
          {reconciliationData.length > 0 && (
            <Chip
              label={`${reconciliationData.filter(item => item.reconciled).length} itens selecionados`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>
        
        <Box>
          <Button
            onClick={onClose}
            sx={{
              mr: 1,
              color: '#3a4a6b',
              borderColor: '#3a4a6b',
              '&:hover': {
                backgroundColor: 'rgba(58,74,107,0.04)'
              }
            }}
          >
            Cancelar
          </Button>
          
          <Button
            variant="contained"
            onClick={handleFinalize}
            disabled={loading || reconciliationData.filter(item => item.reconciled).length === 0}
            sx={{
              background: 'linear-gradient(45deg, #00c853 0%, #5efc82 100%)',
              color: 'white',
              fontWeight: 'bold',
              px: 3,
              '&:disabled': {
                background: '#e0e0e0'
              },
              '&:hover': {
                background: 'linear-gradient(45deg, #009624 0%, #4caf50 100%)'
              }
            }}
          >
            Finalizar Reconciliação
          </Button>
        </Box>
      </DialogActions>

      {/* Modal de importação */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Importar Extrato Bancário</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography gutterBottom>
            Selecione o arquivo CSV com as transações bancárias
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            O arquivo deve conter as colunas: <strong>Data</strong>, <strong>Descrição</strong>, <strong>Valor</strong> e opcionalmente <strong>Documento/Referência</strong>.
          </Typography>
          
          <Box
            sx={{
              border: '2px dashed #3a4a6b',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              backgroundColor: 'rgba(58,74,107,0.05)'
            }}
          >
            <CloudUpload sx={{ fontSize: '3rem', color: '#3a4a6b', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Arraste e solte o arquivo aqui
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Ou clique para selecionar
            </Typography>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              style={{ display: 'none' }}
              id="csv-upload-input"
            />
            
            <label htmlFor="csv-upload-input">
              <Button
                variant="contained"
                component="span"
                startIcon={<Upload />}
                sx={{
                  background: 'linear-gradient(45deg, #3a4a6b 0%, #1e2b4d 100%)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                Selecionar Arquivo
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ReconciliationModal;