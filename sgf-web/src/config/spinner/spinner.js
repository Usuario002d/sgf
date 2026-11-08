import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // fundo escuro semi-transparente
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'auto', // bloqueia qualquer interação
    backdropFilter: 'blur(4px)' // efeito de blur no fundo
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: theme.spacing(4),
    borderRadius: 16,
    boxShadow: '0 0 30px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 165, 0, 0.5) inset',
    textAlign: 'center',
    minWidth: 250,
    border: '2px solid gold',
    animation: '$pulse 2s infinite alternate'
  },
  message: {
    marginTop: theme.spacing(3),
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'gold',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.7)'
  },
  spinner: {
    color: 'gold',
    filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))'
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.7)'
    },
    '100%': {
      boxShadow: '0 0 40px rgba(255, 215, 0, 0.9), 0 0 30px rgba(255, 165, 0, 0.7) inset'
    }
  }
}));

export default function Spinner({ isLoading, message = 'PROCESSANDO...' }) {
  const classes = useStyles();

  if (!isLoading) return null;

  return (
    <div className={classes.overlay}>
      <div className={classes.card}>
        <CircularProgress 
          thickness={5} 
          size={60} 
          className={classes.spinner} 
        />
        <div className={classes.message}>{message}</div>
      </div>
    </div>
  );
}