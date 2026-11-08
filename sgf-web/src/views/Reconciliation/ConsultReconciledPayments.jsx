import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, Button, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, Typography,
  CircularProgress, Chip, Box, IconButton,
  Tooltip, Avatar, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  CheckCircle, ErrorOutline, Search, DateRange,
  Close, Description, Receipt, CompareArrows
} from '@mui/icons-material';

const ConsultPayments = ({
  open,
  onClose,
  reconciledPayments = [],
  unreconciledPayments = [],
  loading
}) => {
  // Estados do componente
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [showReconciled, setShowReconciled] = useState(true);

  // Filtra pagamentos pelo período selecionado
  useEffect(() => {
    const paymentsToFilter = showReconciled ? reconciledPayments : unreconciledPayments;
  
    console.log('🔄 showReconciled:', showReconciled);
    console.log('📅 Data range:', dateRange);
    console.log('📥 Payments recebidos:', paymentsToFilter);
  
    const filtered = paymentsToFilter.filter(payment => {
      const rawCreatedAt = payment.createdAt;
  
      // 🟦 Normalizar o createdAt
      const createdAtDate = new Date(rawCreatedAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
  
      // 📝 Log para depuração
      console.log(`📌 Pagamento ID ${payment.id}:`, {
        createdAt: rawCreatedAt,
        createdAtDate,
        startDate,
        endDate
      });
  
      if (
        createdAtDate instanceof Date &&
        !isNaN(createdAtDate) &&
        startDate instanceof Date &&
        !isNaN(startDate) &&
        endDate instanceof Date &&
        !isNaN(endDate)
      ) {
        return createdAtDate >= startDate && createdAtDate <= endDate;
      } else {
        console.warn(`⚠ Data inválida detectada para pagamento ID ${payment.id}:`, rawCreatedAt);
        return false;
      }
    });
  
    console.log('✅ Pagamentos filtrados:', filtered);
    setFilteredPayments(filtered);
  }, [reconciledPayments, unreconciledPayments, dateRange, showReconciled]);
  
  // Formata valor monetário
  const formatCurrency = (value) => {
    if (!value || isNaN(Number(value))) {
      return '0.00'; // Valor padrão se for null, undefined ou inválido
    }
  
    return Number(value).toLocaleString('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Formata data para exibição
  const formatDisplayDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleToggleChange = (event, newValue) => {
    if (newValue !== null) {
      setShowReconciled(newValue);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          width: '95vw',
          maxWidth: '1440px',
          borderRadius: 2.5,
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 45px rgba(0,0,0,0.18)',
          overflow: 'hidden'
        }
      }}>
      {/* Cabeçalho do modal */}
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #0f5132 0%, #145a32 100%)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 3,
        py: 2,
        borderBottom: '2px solid #b7dec9'
      }}>
        <Box display="flex" alignItems="center">
          <CompareArrows sx={{ mr: 1.5, fontSize: '1.8rem' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Consulta de Pagamentos
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
          backgroundColor: '#f8fafc',
          p: 2.5,
          borderBottom: '1px solid #e2e8f0'
        }}>
          <Grid item xs={12} md={4}>
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
                    borderColor: '#2e7d32'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
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
                    borderColor: '#2e7d32'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={showReconciled}
              exclusive
              onChange={handleToggleChange}
              fullWidth
              sx={{
                height: '56px',
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontWeight: 'bold'
                }
              }}
            >
              <ToggleButton value={true} color="success">
                <CheckCircle sx={{ mr: 1 }} />
                Reconciliados
              </ToggleButton>
              <ToggleButton value={false} color="error">
                <ErrorOutline sx={{ mr: 1 }} />
                Não Reconciliados
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`${filteredPayments.length} pagamentos encontrados`}
              sx={{
                background: showReconciled ? 'rgba(46,125,50,0.1)' : 'rgba(198,40,40,0.1)',
                color: showReconciled ? '#2e7d32' : '#c62828',
                border: showReconciled ? '1px solid rgba(46,125,50,0.2)' : '1px solid rgba(198,40,40,0.2)',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                height: '36px'
              }}
            />
            
            <Chip
              label={`Total: ${formatCurrency(
                filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
              )}`}
              color={showReconciled ? 'success' : 'error'}
              variant="outlined"
              sx={{ fontWeight: 'bold', fontSize: '0.9rem', height: '36px' }}
            />
          </Grid>
        </Grid>

        {/* Tabela de resultados */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#2e7d32' }} />
          </Box>
        ) : (
          <Paper sx={{ m: 3, mb: 0, borderRadius: 2, overflow: 'hidden' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: '#f2f8f5'
                }}>
                  <TableCell sx={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', py: 1.5, px: 2 }}>
                    {showReconciled ? 'Data Reconciliação' : 'Data Operação'}
                  </TableCell>
                  <TableCell sx={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', py: 1.5, px: 2 }}>Documento</TableCell>
                  <TableCell sx={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', py: 1.5, px: 2 }}>Referência</TableCell>
                  <TableCell sx={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', py: 1.5, px: 2 }}>Descrição</TableCell>
                  <TableCell sx={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', py: 1.5, px: 2 }}>Valor</TableCell>
                  <TableCell sx={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', py: 1.5, px: 2 }}>Data Transação</TableCell>
                  <TableCell sx={{ backgroundColor: '#f2f8f5', color: '#0f5132', fontWeight: 700, borderBottom: '2px solid #b7dec9', py: 1.5, px: 2 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        '&:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                        '&:last-child td': { borderBottom: 0 }
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ 
                            bgcolor: showReconciled ? '#e8f5e9' : '#ffebee', 
                            color: showReconciled ? '#2e7d32' : '#c62828', 
                            mr: 2,
                            width: 32, 
                            height: 32 
                          }}>
                            {showReconciled ? <Receipt fontSize="small" /> : <ErrorOutline fontSize="small" />}
                          </Avatar>
                          {formatDisplayDate(showReconciled ? payment.createdAt : payment.createdAt)}
                        </Box>
                      </TableCell>
                      
                      <TableCell sx={{ fontWeight: 500 }}>
                        {payment.documentNumber || 'N/A'}
                      </TableCell>
                      
                      <TableCell>{payment.internalRequest?.requestNumber || 'N/A'}</TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {payment.description}
                        </Typography>
                      </TableCell>
                      
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(payment.totalAmount)}
                      </TableCell>
                      
                      <TableCell>
                        {formatDisplayDate(payment.createdAt)}
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={showReconciled ? <CheckCircle fontSize="small" /> : <ErrorOutline fontSize="small" />}
                          label={showReconciled ? 'Reconciliado' : 'Não Reconciliado'}
                          color={showReconciled ? 'success' : 'error'}
                          size="small"
                          variant="filled"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{ color: 'text.secondary' }}>
                        {(showReconciled ? reconciledPayments.length : unreconciledPayments.length) === 0 ? (
                          <>
                            <Description sx={{ fontSize: '3rem', color: 'rgba(0,0,0,0.1)', mb: 1 }} />
                            <Typography variant="h6">
                              {showReconciled 
                                ? 'Nenhum pagamento reconciliado encontrado' 
                                : 'Nenhum pagamento não reconciliado encontrado'}
                            </Typography>
                            <Typography variant="body2">
                              {showReconciled
                                ? 'Realize reconciliações para visualizar os dados aqui'
                                : 'Todos os pagamentos estão reconciliados'}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Search sx={{ fontSize: '3rem', color: 'rgba(0,0,0,0.1)', mb: 1 }} />
                            <Typography variant="h6">
                              Nenhum resultado encontrado para o período
                            </Typography>
                            <Typography variant="body2">
                              Ajuste as datas para visualizar os pagamentos
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
        background: 'rgba(0,0,0,0.02)'
      }}>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: '#0f5132', color: '#ffffff', '&:hover': { backgroundColor: '#0a3622' },
            '&:hover': {
              backgroundColor: 'rgba(46,125,50,0.04)'
            }
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsultPayments;