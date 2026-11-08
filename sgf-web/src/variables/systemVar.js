var actions = {
  CREAETE: "CREATE",
  EDIT: "EDIT",
  ACTIVE: "RESTORE",
  INACTIVE: "REMOVE",
}

var steps = {
  SETTINGS: "Settings",
  CREATE_EDIT: "Create/Edit",
  CONFIRM: "Confirm",
}

var buttons = {
  ADD_NEW: "Adicionar Novo",
  NEW: "Registrar Novo",
  CONFIRM: "Confirmar",
  NEXT: "Proximo",
}

var statusList = [
  { name: "active", value: 1, description: "Activo" },
  { name: "inactive", value: 0, description: "Inactivo" },
]

module.exports = {
  statusList,
  actions,
  steps,
  buttons,
};