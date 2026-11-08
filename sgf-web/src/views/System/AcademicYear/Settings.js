import React from "react";
import SettingsComponent from "components/Settings/SettingsComponent";
/**
 * Settings Components
 * 
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function Settings({ editChildDateToParent, seachChildDateToParent, parentData }) {

  const tableColumns = [
    { name: 'year', label: 'Ano', minWidth: 100, seachable: true, filterDataType: "string" },
    { name: 'description', label: 'Descrição', minWidth: 100, },
    {
      name: 'state', label: 'Estado', seachable: true,
      filterDataType: "array", filters: [{ label: "Activo", value: 1 }, { label: "Inactivo", value: 0 },],
      minWidth: 100, align: 'right', size: "small"
    },
    { name: 'action', label: 'Acções', minWidth: 100, align: 'right', size: "small" },
  ];

  return (
    <SettingsComponent
      editChildDateToParent={editChildDateToParent}
      seachChildDateToParent={seachChildDateToParent}
      parentData={{ ...parentData, tableColumns: tableColumns, tableRows: parentData.dtos }}
    />
  );
}
