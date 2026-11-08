import React, { useEffect, useState } from "react";
import {
  registerAccount,
  updateAccountAPI,
  callDeleteAccountAPI,
  findConformInitialAllocation,
  findAccountPlanBudjectEntriesByYear,
  getRegisteredAccounts,
} from "../services/accountService";
import Spinner from "../config/spinner/spinner";
import PopupNotification from "../config/Pop-up/PopupNotification";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import {
  FaFilePdf,
  FaFileExcel,
  FaPrint,
  FaSitemap,
  FaPlusCircle,
  FaEdit,
  FaTrashAlt,
  FaLayerGroup,
  FaCheckCircle,
} from "react-icons/fa";
import logoMz from "../assets/img/logoMz.png";
import templatePDF from "../views/BudgetChange/component/templatePDF";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const AccountForm = () => {
  const [isConformed, setIsConformed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    writable: "moviment",
    type: "financial",
    class: "E",
    parentAccount: "",
  });

  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [accounts, setAccounts] = useState([]);
  const [parentAccounts1, setParentAccounts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const exportToPDF = () => {
    const title = "Plano de Contas";
    const subtitle = "Plano de Contas Financeiro";
    const headers = [["Conta", "Descrição", "Natureza", "Tipo", "Classe"]];
    const tableElement = document.getElementById("accountsTable1");
    let body = [];

    if (tableElement) {
      const rows = tableElement.getElementsByTagName("tr");
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        if (cells.length >= 5) {
          body.push([
            cells[0].textContent.trim(),
            cells[1].textContent.trim(),
            cells[2].textContent.trim(),
            cells[3].textContent.trim(),
            cells[4].textContent.trim(),
          ]);
        }
      }
    }

    const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    const generatedBy = savedUserData.fullName || "Utilizador SGF";

    templatePDF({
      title,
      subtitle,
      tableContent: {
        head: headers,
        body,
        columnStyles: {
          0: { halign: "left" },
          1: { halign: "left" },
          2: { halign: "center" },
          3: { halign: "center" },
          4: { halign: "center" },
        },
      },
      footerText: "Documento gerado automaticamente pelo SGF",
      logoImage: logoMz,
      generatedBy,
      filename: "plano_contas_financeiro.pdf",
    });
  };

  const handlePrint = () => {
    const tableNode = document.getElementById("accountsTable1");
    if (!tableNode) return;
    const printContent = tableNode.cloneNode(true);
    const headers = printContent.querySelectorAll("th");
    const rows = printContent.querySelectorAll("tr");
    if (headers.length > 0) headers[headers.length - 1].remove();
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length) cells[cells.length - 1].remove();
    });

    const printWindow = window.open("", "", "height=700, width=950");
    printWindow.document.write("<html><head><title>Plano de Contas Financeiro</title>");
    printWindow.document.write(
      "<style>body{font-family:sans-serif;padding:20px;} table { width: 100%; border-collapse: collapse; font-size: 11px; } th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; } th { background: #e8f5ee; color: #0f5132; }</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h2>Plano de Contas Financeiro</h2>");
    printWindow.document.write(printContent.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Plano de Contas Financeiro");
    const headers = ["Conta", "Descrição", "Natureza", "Tipo", "Classe"];
    worksheet.addRow(headers);

    const tableElement = document.getElementById("accountsTable1");
    if (tableElement) {
      const rows = tableElement.getElementsByTagName("tr");
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        if (cells.length >= 5) {
          worksheet.addRow([
            cells[0].textContent.trim(),
            cells[1].textContent.trim(),
            cells[2].textContent.trim(),
            cells[3].textContent.trim(),
            cells[4].textContent.trim(),
          ]);
        }
      }
    }

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F5132" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    worksheet.columns.forEach((column) => {
      let maxLength = 12;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const length = cell.value ? cell.value.toString().length : 0;
        if (length > maxLength) maxLength = length;
      });
      column.width = maxLength + 4;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "plano_contas_financeiro.xlsx");
  };

  const handleDeleteClick = (childAccount, parentId, parentNumber, childId) => {
    if (isConformed) {
      Swal.fire({
        icon: "error",
        title: "Operação não permitida",
        text: "A transação não pode ser realizada pois a dotação inicial já foi aprovada!",
      });
      return;
    }
    setAccountToDelete({
      ...childAccount,
      parentAccountPlanNumber: parentNumber,
      id: childId,
    });
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const updatedAccount = {
        number: accountToDelete.accountPlan.number,
        description: accountToDelete.accountPlan.description,
        writable: accountToDelete.accountPlan.writable,
        type: accountToDelete.accountPlan.type,
        class: accountToDelete.accountPlan.class,
        parentAccountPlanNumber: accountToDelete.parentAccountPlanNumber,
        id: accountToDelete.id,
      };

      await callDeleteAccountAPI(updatedAccount);
      Swal.fire({
        icon: "success",
        title: "Sucesso",
        text: "Conta removida com sucesso!",
      });
      setShowDeleteConfirmation(false);
      loadAccounts();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao remover a conta. Verifique se não existem operações associadas a esta conta!",
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleEditClick = (childAccount, parentId, parentNumber, childId) => {
    if (isConformed) {
      Swal.fire({
        icon: "error",
        title: "Operação não permitida",
        text: "A transação não pode ser realizada pois a dotação inicial já foi aprovada!",
      });
      return;
    }
    setEditFormData({
      ...childAccount,
      parentAccountPlanNumber: parentNumber,
      id: childId,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      accountPlan: {
        ...prevData.accountPlan,
        [name]: value,
      },
    }));
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const updatedAccount = {
        number: editFormData.accountPlan.number,
        description: editFormData.accountPlan.description,
        writable: editFormData.accountPlan.writable,
        type: editFormData.accountPlan.type,
        class: editFormData.accountPlan.class,
        parentAccountPlanNumber: editFormData.parentAccountPlanNumber,
        id: editFormData.id,
      };

      const response = await updateAccountAPI(updatedAccount);
      if (response && response.errors) {
        response.errors.forEach((error) => {
          Swal.fire({
            icon: "error",
            title: "Erro ao processar requisição",
            text: `${error.message}`,
          });
        });
        setLoading(false);
        return;
      }

      setShowEditModal(false);
      loadAccounts();
      Swal.fire({
        icon: "success",
        title: "Sucesso",
        text: "Conta actualizada com sucesso!",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao actualizar a conta, tente novamente!",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await findAccountPlanBudjectEntriesByYear();
      const filteredParentAccounts = (response || []).filter(
        (account) => account.accountPlan?.type === "financial"
      );
      setAccounts(filteredParentAccounts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts1 = async () => {
    try {
      setLoading(true);
      const response = await getRegisteredAccounts();
      const filteredParentAccounts = (response || []).filter(
        (account) => account.writable === "controll" && account.type === "financial"
      );
      setParentAccounts(filteredParentAccounts);
    } catch (error) {
      console.error("Erro ao carregar as contas:", error);
    } finally {
      setLoading(false);
    }
  };

  const findAccountPlanConformance = async () => {
    try {
      setLoading(true);
      const response = await findConformInitialAllocation();
      setIsConformed(response);
    } catch (error) {
      console.error("Erro ao buscar conformidade:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    findAccountPlanConformance();
    loadAccounts1();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateNewAccountNumber = (parentAccount) => {
    const childAccounts = accounts.filter(
      (account) =>
        account.accountPlan.number.startsWith(parentAccount) &&
        account.accountPlan.number.length > parentAccount.length
    );

    const childSuffixes = childAccounts.map((account) =>
      parseInt(account.accountPlan.number.slice(parentAccount.length), 10)
    );

    let newIndex = 1;
    while (childSuffixes.includes(newIndex)) {
      newIndex++;
    }

    if (parentAccount.length <= 2) {
      return `${parentAccount}${newIndex}`;
    } else {
      const formattedSuffix = newIndex.toString().padStart(2, "0");
      return `${parentAccount}${formattedSuffix}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parentAccount = accounts.find(
        (account) => account.accountPlan.number === formData.parentAccount
      );

      if (!parentAccount) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Conta mãe não existe no plano financeiro!",
        });
        setLoading(false);
        return;
      }

      await registerAccount({
        ...formData,
        parentAccountId: parentAccount.id,
        number: generateNewAccountNumber(formData.parentAccount),
        parentAccountPlanNumber: parentAccount.accountPlanNumber,
      });

      loadAccounts();
      Swal.fire({
        icon: "success",
        title: "Sucesso",
        text: "Conta financeira registada com sucesso!",
      });
      setFormData({
        ...formData,
        description: "",
        parentAccount: "",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao registar conta, tente novamente!",
      });
    } finally {
      setLoading(false);
    }
  };

  const organizeAccounts = (accountsList) => {
    const accountMap = {};
    const parentAccounts = [];

    accountsList.forEach((account) => {
      account.children = [];
      accountMap[account.id] = account;
    });

    accountsList.forEach((account) => {
      if (account.parentId) {
        const parentAccount = accountMap[account.parentId];
        if (parentAccount) {
          parentAccount.children.push(account);
        }
      } else {
        parentAccounts.push(account);
      }
    });

    const sortAccountsByNumber = (account) => {
      account.children.sort((a, b) =>
        (a.accountPlan?.number || "").localeCompare(b.accountPlan?.number || "")
      );
      account.children.forEach((child) => sortAccountsByNumber(child));
    };

    parentAccounts.sort((a, b) =>
      (a.accountPlan?.number || "").localeCompare(b.accountPlan?.number || "")
    );
    parentAccounts.forEach((account) => sortAccountsByNumber(account));

    return parentAccounts;
  };

  const organizedAccounts = organizeAccounts(accounts);

  const matchesSearch = (account) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const selfMatch =
      account.accountPlan?.number?.toLowerCase().includes(q) ||
      account.accountPlan?.description?.toLowerCase().includes(q);
    const childMatch = account.children?.some((c) => matchesSearch(c));
    return selfMatch || childMatch;
  };

  const renderAccountRows = (account, parentAccount = null, level = 0) => {
    if (!matchesSearch(account)) return null;

    const isParentAccount =
      account.children?.length > 0 || account.accountPlan?.class !== "E";
    const writable = account.accountPlan?.writable;
    const type = account.accountPlan?.type;
    const classe = account.accountPlan?.class;

    const classColors = {
      A: { bg: "#0f5132", text: "#ffffff" },
      B: { bg: "#166534", text: "#ffffff" },
      C: { bg: "#d97706", text: "#ffffff" },
      D: { bg: "#0284c7", text: "#ffffff" },
      E: { bg: "#e2e8f0", text: "#1e293b" },
    };
    const badgeColor = classColors[classe] || classColors.E;

    return (
      <React.Fragment key={account.accountPlan?.number || account.id}>
        <tr className={isParentAccount ? "sgf-row-parent" : ""}>
          <td style={{ paddingLeft: `${10 + level * 12}px`, whiteSpace: "nowrap" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: isParentAccount ? 700 : 600,
                color: isParentAccount ? "#0f5132" : "#1e293b",
                backgroundColor: isParentAccount ? "#dcfce7" : "#f1f5f9",
                padding: "2px 6px",
                borderRadius: "5px",
                fontSize: "0.78rem",
              }}
            >
              {account.accountPlan?.number}
            </span>
          </td>
          <td
            className="sgf-desc-cell"
            style={{ paddingLeft: `${8 + level * 10}px` }}
            title={account.accountPlan?.description}
          >
            <span
              style={{
                fontWeight: isParentAccount ? 700 : 500,
                color: isParentAccount ? "#0f2922" : "#334155",
              }}
            >
              {account.accountPlan?.description}
            </span>
          </td>
          <td className="text-center">
            <span
              className="badge"
              style={{
                backgroundColor:
                  writable === "controll" ? "#fef3c7" : "#e0f2fe",
                color: writable === "controll" ? "#92400e" : "#0369a1",
                border:
                  writable === "controll"
                    ? "1px solid #fde68a"
                    : "1px solid #bae6fd",
              }}
            >
              {writable === "controll" ? "Controlo" : "Movimento"}
            </span>
          </td>
          <td className="text-center">
            <span
              className="badge"
              style={{
                backgroundColor: "#eaf5ef",
                color: "#0f5132",
                border: "1px solid #bbf7d0",
              }}
            >
              {type === "financial" ? "Financeiro" : type}
            </span>
          </td>
          <td className="text-center">
            <span
              className="badge"
              style={{
                backgroundColor: badgeColor.bg,
                color: badgeColor.text,
                minWidth: "28px",
              }}
            >
              Classe {classe}
            </span>
          </td>
          <td className="text-center">
            {!isParentAccount && account.children?.length === 0 ? (
              <div className="d-inline-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    border: "1px solid #fde68a",
                    padding: "4px 10px",
                  }}
                  onClick={() =>
                    handleEditClick(
                      account,
                      parentAccount?.id,
                      parentAccount?.accountPlanNumber,
                      account.accountPlan?.id
                    )
                  }
                >
                  <FaEdit size={12} /> Editar
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#fff1f2",
                    color: "#be123c",
                    border: "1px solid #fecdd3",
                    padding: "4px 10px",
                  }}
                  onClick={() =>
                    handleDeleteClick(
                      account,
                      parentAccount?.id,
                      parentAccount?.accountPlanNumber,
                      account.accountPlan?.id
                    )
                  }
                >
                  <FaTrashAlt size={12} /> Remover
                </button>
              </div>
            ) : (
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Agregadora
              </span>
            )}
          </td>
        </tr>

        {account.children?.map((childAccount) =>
          renderAccountRows(childAccount, account, level + 1)
        )}
      </React.Fragment>
    );
  };

  const totalAccounts = accounts.length;
  const controlCount = accounts.filter(
    (a) => a.accountPlan?.writable === "controll"
  ).length;
  const movementCount = accounts.filter(
    (a) => a.accountPlan?.writable === "moviment"
  ).length;

  return (
    <div className="container-fluid py-2">
      <Spinner isLoading={loading} />

      {/* Cabeçalho Institucional Compacto */}
      <div className="sgf-page-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <h2 className="mb-0" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
            Plano de Contas Financeiro
          </h2>
          <span
            className="badge"
            style={{
              backgroundColor: "#eaf5ef",
              color: "#0f5132",
              border: "1px solid #a7d7be",
            }}
          >
            <FaSitemap className="me-1" /> Contabilidade Geral
          </span>
          {isConformed && (
            <span
              className="badge"
              style={{
                backgroundColor: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
              }}
            >
              <FaCheckCircle className="me-1" /> Exercício Conformado
            </span>
          )}
          <span className="text-muted d-none d-xl-inline" style={{ fontSize: "0.78rem" }}>
            — Estrutura patrimonial e financeira para lançamentos contabilísticos, bancos e tesouraria
          </span>
        </div>

        {/* KPIs Rápidos Compactos */}
        <div className="d-flex flex-wrap gap-2">
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d5e0da",
              borderRadius: "8px",
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "0.68rem", color: "#5c746b", fontWeight: 700, textTransform: "uppercase" }}>
              Total:
            </span>
            <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f2922" }}>
              {totalAccounts}
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "0.68rem", color: "#92400e", fontWeight: 700, textTransform: "uppercase" }}>
              Controlo:
            </span>
            <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#b45309" }}>
              {controlCount}
            </span>
          </div>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #a7d7be",
              borderRadius: "8px",
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "0.68rem", color: "#0f5132", fontWeight: 700, textTransform: "uppercase" }}>
              Movimento:
            </span>
            <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#059669" }}>
              {movementCount}
            </span>
          </div>
        </div>
      </div>

      {/* Card 1: Formulário de Registo */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex align-items-center gap-2">
            <FaPlusCircle style={{ color: "#0f5132" }} />
            <span>Registar Nova Conta Financeira</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#5c746b", fontWeight: 500 }}>
            Código atribuído automaticamente a partir da Conta Mãe seleccionada
          </span>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-2 align-items-start">
              <div className="col-md-5">
                <label htmlFor="parentAccount">Conta Mãe (Classes B ou C)</label>
                <select
                  id="parentAccount"
                  name="parentAccount"
                  className="form-select"
                  value={formData.parentAccount}
                  onChange={handleChange}
                  required
                  title={
                    parentAccounts1.find((a) => a.number === formData.parentAccount)
                      ?.description || ""
                  }
                >
                  <option value="">Seleccionar Conta Mãe...</option>
                  {parentAccounts1
                    .filter((account) => account.class === "B" || account.class === "C")
                    .map((account) => (
                      <option key={account.id} value={account.number}>
                        {account.number} — {account.description}
                      </option>
                    ))}
                </select>
                {formData.parentAccount && (
                  <div className="sgf-field-preview">
                    <strong>{formData.parentAccount}:</strong>{" "}
                    {parentAccounts1.find((a) => a.number === formData.parentAccount)
                      ?.description || ""}
                  </div>
                )}
              </div>

              <div className="col-md-5">
                <label htmlFor="description">Designação da Conta Financeira</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  className="form-control"
                  placeholder="Ex: Banco Comercial — Conta Operacional MZN"
                  value={formData.description}
                  onChange={handleChange}
                  title={formData.description}
                  required
                />
              </div>

              <div className="col-md-2" style={{ paddingTop: "21px" }}>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                  style={{ minHeight: "35px" }}
                >
                  <FaPlusCircle />
                  {loading ? "A registar..." : "Registar Conta"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Card 2: Tabela Hierárquica */}
      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <FaLayerGroup style={{ color: "#0f5132" }} />
            <span>Estrutura Hierárquica do Plano Financeiro</span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <div style={{ minWidth: "240px" }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Pesquisar conta ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ minHeight: "36px" }}
              />
            </div>
            <button
              type="button"
              onClick={exportToExcel}
              className="btn btn-sm btn-success"
            >
              <FaFileExcel /> Excel
            </button>
            <button
              type="button"
              onClick={exportToPDF}
              className="btn btn-sm btn-danger"
            >
              <FaFilePdf /> PDF
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          {accounts.length > 0 ? (
            <div className="table-responsive">
              <table id="accountsTable1" className="table table-hover mb-0">
                <colgroup>
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "44%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "13%" }} />
                </colgroup>
                <thead className="sticky-top">
                  <tr>
                    <th>Código da Conta</th>
                    <th>Designação da Conta</th>
                    <th className="text-center">Natureza</th>
                    <th className="text-center">Plano</th>
                    <th className="text-center">Classe</th>
                    <th className="text-center">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {organizedAccounts.map((account) => renderAccountRows(account))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              A carregar contas do plano financeiro...
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit style={{ color: "#0f5132" }} /> Editar Conta Financeira
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="code">Código da Conta</label>
            <input
              type="text"
              id="code"
              name="accountPlanNumber"
              className="form-control"
              value={editFormData?.accountPlan?.number || editFormData?.accountPlanNumber || ""}
              disabled
            />
          </div>
          <div className="mb-2">
            <label htmlFor="description">Descrição Completa da Conta</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="form-control"
              value={editFormData?.accountPlan?.description || ""}
              onChange={handleEditChange}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Guardar Alterações
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal
        show={showDeleteConfirmation}
        onHide={() => setShowDeleteConfirmation(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTrashAlt style={{ color: "#be123c" }} /> Confirmar Exclusão
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem a certeza de que deseja eliminar a conta{" "}
          <strong>
            {accountToDelete?.accountPlan?.number || accountToDelete?.accountPlanNumber}
          </strong>{" "}
          ({accountToDelete?.accountPlan?.description})?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirmation(false)}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Sim, Eliminar Conta
          </Button>
        </Modal.Footer>
      </Modal>

      <PopupNotification
        show={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ show: false, message: "", type: "" })}
      />
    </div>
  );
};

export default AccountForm;
