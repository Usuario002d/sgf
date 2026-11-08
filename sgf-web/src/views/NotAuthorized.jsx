// src/views/NotAuthorized.js
import React from 'react';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

export default function NotAuthorized() {
  const history = useHistory();
  
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>403 - Acesso Negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => history.push('/dashboard')}
      >
        Voltar ao Dashboard
      </Button>
    </div>
  );
}