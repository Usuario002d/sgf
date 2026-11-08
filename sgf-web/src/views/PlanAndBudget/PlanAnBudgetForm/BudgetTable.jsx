import React from 'react';
import BudjectTableComponent from '../../../components/BudjectTaleComponent';
// Importar CSS do DataTables
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';

// Importar JS do DataTables
import 'datatables.net';
import 'datatables.net-bs5';


const BudgetTable = () => {
  return (
      <BudjectTableComponent/>
  );
};

export default BudgetTable;
