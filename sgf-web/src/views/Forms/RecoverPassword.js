import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Grid, Table, TableBody, TableCell, TableRow, Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from '@mui/material';

const RecoverPassword = () => {
  const [user, setUser] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false); // controle do alerta de senha enviada

  const blockedUsers = [
    { name: 'Sebadora', email: 'sebadora@gmail.com' },
    { name: 'John', email: 'john@gmail.com' },
    { name: 'Paulo', email: 'paulo@gmail.com' },
  ];

  const handleGetUser = () => {
    setLoading(true);
    setError('');

    setTimeout(() => {
      const userData = {
        name: 'Sebadora',
        email: 'sebadora@gmail.com',
        phone: '800000000',
        status: 'blocked',
      };

      if (user.toLowerCase() === 'sebadora@gmail.com') {
        setFoundUser(userData);
      } else {
        setError('Usuário não encontrado.');

      } if (user.toLowerCase() === '') {
        setFoundUser(null);
        setOpenDialog(true);
      }

      setLoading(false);
    }, 2000);
  };

  const handleUnlockAccount = () => {
    console.log(`Desbloqueando conta de ${foundUser.name}`);
    setFoundUser({ ...foundUser, status: 'active' });
  };

  const handleUnlockAndSendPassword = () => {
    console.log(`Desbloqueando conta e enviando nova senha para ${foundUser.email}`);
    setFoundUser({ ...foundUser, status: 'active' });

    // Simula envio de nova senha
    setTimeout(() => {
      setAlertOpen(true); // Mostra alerta de senha enviada
    }, 500);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  return (
    <Grid container justifyContent="center" style={{ height: '100vh', padding: '20px' }}>
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Card>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              Gestão de Contas de Utilizadores
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
              Busque o usuário para desbloquear a conta ou enviar uma nova senha.
            </Typography>

            <TextField
              label="E-mail"
              fullWidth
              variant="outlined"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              margin="normal"
            />

            <Button
              onClick={handleGetUser}
              fullWidth
              variant="contained"
              color="primary"
              style={{ marginTop: '16px' }}
              disabled={loading}
            >
              Buscar Usuário/Mostrar Usuários Bloqueados
              {loading && (
                <CircularProgress size={24} style={{ marginLeft: '16px' }} color="inherit" />
              )}
            </Button>

            {error && <Alert severity="error" style={{ marginTop: '20px' }}>{error}</Alert>}

            {foundUser && (
              <CardContent style={{ marginTop: '20px' }}>
                <Typography variant="h6">Detalhes da Conta</Typography>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>{foundUser.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>E-mail</TableCell>
                      <TableCell>{foundUser.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Telefone</TableCell>
                      <TableCell>{foundUser.phone}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>{foundUser.status === 'blocked' ? 'Bloqueado' : 'Ativo'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Ações */}
                {foundUser.status === 'blocked' ? (
                  <>
                    <Button
                      onClick={handleUnlockAccount}
                      fullWidth
                      variant="contained"
                      color="secondary"
                      style={{ marginTop: '16px' }}
                    >
                      Desbloquear Conta
                    </Button>

                    <Button
                      onClick={handleUnlockAndSendPassword}
                      fullWidth
                      variant="contained"
                      color="primary"
                      style={{ marginTop: '16px' }}
                    >
                      Desbloquear e Enviar Nova Senha
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleUnlockAndSendPassword}
                    fullWidth
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '16px' }}
                  >
                    Enviar Nova Senha
                  </Button>
                )}
              </CardContent>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Dialog de usuários bloqueados */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Usuários Bloqueados</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            O usuário não foi encontrado. Abaixo está a lista de usuários bloqueados:
          </Typography>
          <Table>
            <TableBody>
              {blockedUsers.map((blockedUser, index) => (
                <TableRow key={index}>
                  <TableCell>{blockedUser.name}</TableCell>
                  <TableCell>{blockedUser.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerta de senha enviada */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        message="Senha redefinida e enviada para o e-mail do utilizador."
      />
    </Grid>
  );
};

export default RecoverPassword;
