import React from "react";
import Dashboard from "@material-ui/icons/Dashboard";
import LibraryBooks from "@material-ui/icons/LibraryBooks";
import TableConfigsIcon from "@material-ui/icons/ViewList";
import PeopleOutline from "@material-ui/icons/PeopleOutline";
import AccountBalance from "@material-ui/icons/AccountBalance";
import AccountBalanceWallet from "@material-ui/icons/AccountBalanceWallet";
import Receipt from "@material-ui/icons/Receipt";
import SwapHoriz from "@material-ui/icons/SwapHoriz";
import Assessment from "@material-ui/icons/Assessment";
import SettingsOutlined from "@material-ui/icons/SettingsOutlined";
import VerifiedUserOutlined from "@material-ui/icons/VerifiedUserOutlined";
import VpnKeyOutlined from "@material-ui/icons/VpnKeyOutlined";
import LinkOutlined from "@material-ui/icons/LinkOutlined";

import BudgetChange from "views/BudgetChange/Index.js";
import BudjectConformance from "../src/components/BudjectConformance";
import BudgetTable from "views/PlanAndBudget/PlanAnBudgetForm/BudgetTable";
import AccountsPlanFin from "views/PlanAndBudget/AccountsPlan/AccountsPlanFin";
import AccountsPlanOrc from "views/PlanAndBudget/AccountsPlan/AccountsPlanOrc";
import FormRequisition from "views/Requisition/FormRequisition.js";
import UserRegister from "views/Forms/UserRegister.js";
import DataUpdate from "views/Forms/DataUpdate";
import RecoverPassword from "views/Forms/RecoverPassword";
import AccountsToPay from "views/AccountsPayableReceivable/AccountsToPay";
import PlanBudgetReport from "views/Reports/PlanBudgetReport";
import FinancialReports from "views/Reports/FinancialReports";
import RequestReports from "views/Reports/RequestReports";
import AccountsToReceiveOptional from "views/AccountsPayableReceivable/AccountsToReceiveOptional";
import BanksEntrance from "views/AccountsPayableReceivable/BanksEntrance";
import BanksExit from "views/AccountsPayableReceivable/BanksExit";
import Operations from "views/AccountsPayableReceivable/Operations";
import BudgetExecutionReports from "views/Reports/BudgetExecutionReports";
import RequestCompliance from "views/Requisition/RequestCompliance";
import RequestSubmit from "views/Requisition/RequestSubmit";
import AssociateAccounts from "views/AssociatAccounts";
import FiscalYearManagement from "views/PlanAndBudget/FiscalYearManagement";
import ReleaseReport from "views/Reports/ReleaseReport";
import BankReconciliation from "views/Reconciliation/BankReconciliation";
import DashboardAlt3 from "components/DashboardAlt3/DashboardAlt3";
import PrivateRoute from "./routes/ProtectedRoute";

const dashboardRoutes = [
  {
    id: "1",
    open: false,
    path: "/dashboard",
    name: "Painel Executivo",
    icon: Dashboard,
    component: (props) => <PrivateRoute component={DashboardAlt3} {...props} />,
    layout: "/admin",
    requiredPermission: null,
  },
  {
    id: "2",
    open: false,
    name: "Administração",
    icon: SettingsOutlined,
    requiredPermission: null,
    items: [
      {
        path: "/userregister",
        name: "Gestão de Utilizadores",
        component: (props) => <PrivateRoute component={UserRegister} {...props} />,
        icon: PeopleOutline,
        layout: "/admin",
      },
      {
        path: "/dataupdate",
        name: "Actualizar Dados",
        component: (props) => <PrivateRoute component={DataUpdate} {...props} />,
        icon: LibraryBooks,
        layout: "/admin",
      },
      {
        path: "/recoverpassword",
        name: "Recuperar Senha",
        component: (props) => <PrivateRoute component={RecoverPassword} {...props} />,
        icon: VpnKeyOutlined,
        layout: "/admin",
      },
      {
        path: "/fiscalYearManagement",
        name: "Exercício Económico & Transição",
        icon: SwapHoriz,
        component: (props) => <PrivateRoute component={FiscalYearManagement} {...props} />,
        layout: "/admin",
      },
      {
        path: "/AssociateAccounts",
        name: "Associação de Contas",
        icon: LinkOutlined,
        component: (props) => <PrivateRoute component={AssociateAccounts} {...props} />,
        layout: "/admin",
      },
    ],
  },
  {
    id: "3",
    open: false,
    name: "Plano de Contas",
    icon: AccountBalance,
    requiredPermission: "planoOrcamento",
    items: [
      {
        path: "/accountsplanorc",
        name: "Plano Orçamental",
        icon: TableConfigsIcon,
        component: (props) => <PrivateRoute component={AccountsPlanOrc} {...props} />,
        layout: "/admin",
      },
      {
        path: "/accountsplanfin",
        name: "Plano Financeiro",
        icon: AccountBalanceWallet,
        component: (props) => <PrivateRoute component={AccountsPlanFin} {...props} />,
        layout: "/admin",
      },
    ],
  },
  {
    id: "4",
    open: false,
    name: "Plano e Orçamento",
    icon: AccountBalanceWallet,
    requiredPermission: "planoOrcamento",
    items: [
      {
        path: "/BudgetTable",
        name: "Tabela de Despesas",
        icon: TableConfigsIcon,
        component: (props) => <PrivateRoute component={BudgetTable} {...props} />,
        layout: "/admin",
      },
      {
        path: "/planandbudget/changePlan",
        name: "Alteração de Despesas",
        icon: SwapHoriz,
        component: (props) => <PrivateRoute component={BudgetChange} {...props} />,
        layout: "/admin",
        visibility: false,
      },
      {
        path: "/planandbudget/planandbudgetConformance",
        name: "Conformidade Orçamental",
        icon: VerifiedUserOutlined,
        component: (props) => <PrivateRoute component={BudjectConformance} {...props} />,
        layout: "/admin",
        requiredPermission: "planoOrcamento",
        visibility: false,
      },
    ],
  },
  {
    id: "5",
    open: false,
    name: "Requisições de Fundos",
    icon: Receipt,
    requiredPermission: "requisoesFundos",
    items: [
      {
        path: "/formrequisition",
        name: "Emitir Requisição",
        icon: Receipt,
        component: (props) => <PrivateRoute component={FormRequisition} {...props} />,
        layout: "/admin",
        requiredPermission: "requisoesFundos",
      },
      {
        path: "/formrequisitionConformance",
        name: "Conformidade de Requisições",
        icon: VerifiedUserOutlined,
        component: (props) => <PrivateRoute component={RequestCompliance} {...props} />,
        layout: "/admin",
        requiredPermission: "requisoesFundos",
      },
      {
        path: "/submitRequisition",
        name: "Requisições Submetidas",
        icon: TableConfigsIcon,
        component: (props) => <PrivateRoute component={RequestSubmit} {...props} />,
        layout: "/admin",
        requiredPermission: "requisoesFundos",
      },
    ],
  },
  {
    id: "6",
    open: false,
    name: "Movimentos & Tesouraria",
    icon: SwapHoriz,
    items: [
      {
        path: "/AccountsToPay",
        name: "Contas a Pagar",
        icon: LibraryBooks,
        layout: "/admin",
        component: (props) => <PrivateRoute component={AccountsToPay} {...props} />,
        requiredPermission: "relatoriosGlobais",
      },
      {
        path: "/AccountsToReceiveOptional",
        name: "Contas a Receber",
        icon: LibraryBooks,
        layout: "/admin",
        component: (props) => <PrivateRoute component={AccountsToReceiveOptional} {...props} />,
        requiredPermission: "relatoriosGlobais",
      },
      {
        path: "/BanksEntrance",
        name: "Bancos — Entradas",
        icon: LibraryBooks,
        layout: "/admin",
        component: (props) => <PrivateRoute component={BanksEntrance} {...props} />,
        requiredPermission: "relatoriosGlobais",
      },
      {
        path: "/BanksExit",
        name: "Bancos — Saídas",
        icon: LibraryBooks,
        layout: "/admin",
        component: (props) => <PrivateRoute component={BanksExit} {...props} />,
        requiredPermission: "relatoriosGlobais",
      },
      {
        path: "/Operations",
        name: "Operações Diversas",
        icon: LibraryBooks,
        layout: "/admin",
        component: (props) => <PrivateRoute component={Operations} {...props} />,
        requiredPermission: "relatoriosGlobais",
      },
    ],
  },
  {
    id: "7",
    open: false,
    path: "/BankReconciliation",
    name: "Reconciliação Bancária",
    icon: AccountBalance,
    layout: "/admin",
    component: (props) => <PrivateRoute component={BankReconciliation} {...props} />,
    requiredPermission: "relatoriosGlobais",
  },
  {
    id: "8",
    open: false,
    name: "Relatórios Globais",
    icon: Assessment,
    items: [
      {
        path: "/PlanBudgetReport",
        name: "Plano e Orçamento",
        icon: Assessment,
        layout: "/admin",
        component: (props) => <PrivateRoute component={PlanBudgetReport} {...props} />,
        requiredPermission: "relatoriosGlobais",
      },
      {
        path: "/BudgetExecutionReports",
        name: "Execução Orçamental",
        icon: Assessment,
        layout: "/admin",
        component: (props) => <PrivateRoute component={BudgetExecutionReports} {...props} />,
        requiredPermission: "relatoriosGlobais",
      },
      {
        path: "/FinancialReports",
        name: "Relatórios Financeiros",
        icon: Assessment,
        layout: "/admin",
        component: (props) => <PrivateRoute component={FinancialReports} {...props} />,
        requiredPermission: "relatoriosGlobais",
      },
      {
        path: "/RequestReports",
        name: "Relatórios de Requisições",
        icon: Assessment,
        layout: "/admin",
        component: (props) => <PrivateRoute component={RequestReports} {...props} />,
        requiredPermission: "relatoriosGlobais",
      },
      {
        path: "/releaseReport",
        name: "Extrato de Lançamentos",
        icon: Assessment,
        layout: "/admin",
        component: (props) => <PrivateRoute component={ReleaseReport} {...props} />,
        requiredPermission: "relatoriosGlobais",
      },
    ],
  },
];

export const filterRoutes = (routes, user) => {
  const isAdmin = user?.isAdmin || false;
  const permissions = user?.permissions || {};

  return routes
    .filter((route) => {
      if (route.requiredPermission === null || route.requiredPermission === undefined) return true;
      if (isAdmin) return true;
      return permissions[route.requiredPermission] === true;
    })
    .map((route) => ({
      ...route,
      items: route.items
        ? route.items.filter((item) => {
            if (item.requiredPermission === null || item.requiredPermission === undefined) return true;
            if (isAdmin) return true;
            return permissions[item.requiredPermission] === true;
          })
        : null,
    }))
    .filter((route) => !route.items || route.items.length > 0);
};

export default dashboardRoutes;
