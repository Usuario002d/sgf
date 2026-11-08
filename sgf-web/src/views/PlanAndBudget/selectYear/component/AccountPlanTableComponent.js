import React from 'react';
import { useHistory } from 'react-router-dom'; // Importe o useHistory
import Table from "@material-ui/core/Table";
import TableHead from '@material-ui/core/TableHead';
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from '@material-ui/core/TableContainer';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  clickableRow: {
    backgroundColor: "lightgray",
    cursor: "pointer",
    '&:hover': {
      backgroundColor: "tomato",
    },
  },
  title: {
    fontWeight: "bold",
    color: "black",
  },
  subtitle: {
    color: "black",
  },
}));

export default function TableComponent() {
  const classes = useStyles();
  const history = useHistory(); // Inicialize useHistory

  // Dados fictícios
  const row = {
    ano: 2024,
    descricao: "Descrição fictícia do evento ou orçamento.",
  };

  const handleRowClick = () => {
    // Redireciona para a nova rota
    history.push("/admin/planandbudget/accountsplan"); // Mude para a rota desejada
  };
  return (
    <TableContainer>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={2}>
              Selecione o Plano
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Ano</TableCell>
            <TableCell>Descrição</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow className={classes.clickableRow} onClick={handleRowClick}>
            <TableCell className={classes.title}>{row.ano}</TableCell>
            <TableCell>
              <div className={classes.title}>{row.descricao}</div>
              <div className={classes.subtitle}>Ano: {row.ano}</div>
              <div className={classes.subtitle}>Descrição: {row.descricao}</div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
