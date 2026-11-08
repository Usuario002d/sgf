// src/component/BudgetTableComponent.js
import React from 'react';
import { Table, Button } from 'react-bootstrap';

const BudgetTableComponent = ({ data, onRemove, onEdit }) => {
  return (
    <div className="mt-4">
      <h3>Mapa de Alterações Orçamentais da Despesa</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Dotação Inicial (MZN)</th>
            <th>Inscrição/Reforço (MZN)</th>
            <th>Anulação/Redução (MZN)</th>
            <th>Aumento (MZN)</th>
            <th>Diminuição (MZN)</th>
            <th>Dotação Final (MZN)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const finalAmount = (
              (parseFloat(row.dotacaoInicial) || 0) +
              (parseFloat(row.reforco) || 0) -
              (parseFloat(row.anulacao) || 0) +
              (parseFloat(row.aumento) || 0) -
              (parseFloat(row.diminucao) || 0)
            ).toFixed(2);

            return (
              <tr key={index}>
                <td>{row.codigo}</td>
                <td>{row.descricao}</td>
                <td>{row.dotacaoInicial}</td>
                <td>{row.reforco}</td>
                <td>{row.anulacao}</td>
                <td>{row.aumento}</td>
                <td>{row.diminucao}</td>
                <td>{finalAmount}</td>
                <td>
                  <Button variant="primary" onClick={() => onEdit(index)}>
                    Editar
                  </Button>{' '}
                  <Button variant="danger" onClick={() => onRemove(index)}>
                    Remover
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default BudgetTableComponent;



// import React from 'react';
// import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Button } from '@material-ui/core';

// const BudgetTable = ({ data, onRemove }) => {
//   return (
    // <Paper style={{ marginTop: '20px' }}>
    //   <Typography variant="h6" align="center" style={{ padding: '10px', backgroundColor: '#f2d4d4', border: '1px solid #ff0000' }}>
    //     Mapa de Alterações Orçamentais da Despesa
    //   </Typography>
    //   <Table>
    //     <TableHead>
    //       <TableRow style={{ backgroundColor: '#f2d4d4', border: '1px solid #ff0000' }}>
    //       <TableCell style={{ border: '1px solid #ff0000' }}>Código</TableCell>
    //       <TableCell style={{ border: '1px solid #ff0000' }}>Descrição</TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }}>Dotação Inicial</TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }}>Inscrição/Reforço</TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }}>Anulação/Redução</TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }} colSpan={2}>Redistribuição</TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }}>Dotação Final</TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }}>Ações</TableCell> {/* Nova coluna para ações */}
    //       </TableRow>
    //       <TableRow style={{ backgroundColor: '#f2d4d4', border: '1px solid #ff0000' }}>
    //         <TableCell style={{ border: '1px solid #ff0000' }} rowSpan={2}>-</TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }} rowSpan={2}>-</TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }} rowSpan={2}>-</TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }} rowSpan={2}>-</TableCell>
         
    //         <TableCell style={{ border: '1px solid #ff0000' }}></TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }}>Aumento</TableCell>
    //         <TableCell style={{ border: '1px solid #ff0000' }}>Diminuição</TableCell>
    //          {/* Nova coluna para ações */}
    //       </TableRow>
        
    //     </TableHead>
    //     <TableBody>
    //       {data.map((row, index) => {
    //         // Cálculo da Dotação Final
    //         const finalAmount = (
    //           (parseFloat(row.initialAllocation) || 0) + // Dotação Inicial
    //           (parseFloat(row.inscription) || 0) - // Inscrição/Reforço
    //           (parseFloat(row.cancellation) || 0) + // Anulação/Redução
    //           (parseFloat(row.reallocationIncrease) || 0) - // Aumento
    //           (parseFloat(row.reallocationDecrease) || 0) // Diminuição
    //         ).toFixed(2);

    //         return (
    //           <TableRow key={index} style={{ border: '1px solid #ff0000' }}>
    //             <TableCell style={{ border: '1px solid #ff0000' }}>{row.code}</TableCell>
    //             <TableCell style={{ border: '1px solid #ff0000' }}>{row.description}</TableCell>
    //             <TableCell style={{ border: '1px solid #ff0000' }}>{row.initialAllocation}</TableCell>
    //             <TableCell style={{ border: '1px solid #ff0000' }}>{row.inscription}</TableCell>
    //             <TableCell style={{ border: '1px solid #ff0000' }}>{row.cancellation}</TableCell>
    //             <TableCell style={{ border: '1px solid #ff0000' }}>{row.reallocationIncrease}</TableCell>
    //             <TableCell style={{ border: '1px solid #ff0000' }}>{row.reallocationDecrease}</TableCell>
    //             <TableCell style={{ border: '1px solid #ff0000' }}>{finalAmount}</TableCell>
    //             <TableCell style={{ border: '1px solid #ff0000' }}>
    //               <Button 
    //                 variant="contained" 
    //                 color="secondary" 
    //                 onClick={() => onRemove(index)} // Chama a função onRemove com o índice da linha
    //               >
    //                 Remover
    //               </Button>
    //             </TableCell>
    //           </TableRow>
    //         );
    //       })}
    //     </TableBody>
    //   </Table>
    // </Paper>
//   );
// };

// export default BudgetTable;
