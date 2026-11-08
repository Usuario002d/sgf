import React from "react";
import SettingsComponent from "./component/AccountPlanSettingsComponent";
/**
 * Settings Components for Account plan
 * 
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function Settings({ editChildDateToParent, seachChildDateToParent, parentData }) {

  const tableColumns = [
    { name: 'account_number', label: 'Código', minWidth: 60, seachable: true, filterDataType: "string" },
    { name: 'description', label: 'Designação', minWidth: 100, },
    { name: 'initial_alocation', label: 'Dolar', minWidth: 60, },
    { name: 'reserve', label: 'Reserva(%)', minWidth: 70, },
    { name: 'initial_alocationUSD', label: 'Rupias', minWidth: 100, },
    { name: 'action', label: 'Acções', minWidth: 40, align: 'right', size: "small" },
  ];

  return (
    <SettingsComponent
      editChildDateToParent={editChildDateToParent}
      parentData={{ ...parentData, tableColumns: tableColumns, tableRows: parentData.dtos }}
    />
  );
}
