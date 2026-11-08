import React, { useEffect, useState } from "react";
import {
  limparDados,
  setUpdateInitialAllocation,
  validateInitialAllocationApprovalDate,
  setInitialAllocationApprovalDate,
  findAccountPlanBudjectEntriesByYear,
  fetchInitialAllocationsByParentId,
  setCreateAccountPlanBudjectEntry,
  findConformInitialAllocation,
  importInitialAllocationsFromExcel,
} from "../services/accountService";
import Spinner from "../config/spinner/spinner";
import PopupNotification from "../config/Pop-up/PopupNotification";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";
import { DateTime } from "luxon";
import Swal from "sweetalert2";
import { BsFileEarmarkExcelFill } from "react-icons/bs";
import {
  FaFilePdf,
  FaTrashAlt,
  FaCrown,
  FaCheckCircle,
  FaCoins,
  FaLayerGroup,
  FaPlusCircle,
  FaSyncAlt,
  FaCalculator,
  FaUpload,
} from "react-icons/fa";
import logoMz from "../assets/img/logoMz.png";
import templatePDF from "../views/BudgetChange/component/templatePDF";
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";

const BudjectTableComponent = () => {
  const [isConformed, setIsConformed] = useState(false);
  const [valuesAccounts, setValuesAccounts] = useState([]);
  const [accountPlan, setAccountPlan] = useState([]);
  const [finality, setFinality] = useState(false);
  const [validationDate, setValidationDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    accountPlanNumber: "",
    value: "",
  });

  const [exchangeRate, setExchangeRate] = useState(2.5);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [accounts, setAccounts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [avalueA, setAvalueA] = useState(0);
  const [avalueA1, setAvalueA1] = useState(0);
  const [avalueA4, setAvalueA4] = useState(0);
  const [avalueL4, setAvalueL4] = useState(0);
  const [avalueA5, setAvalueA5] = useState(0);
  const [avalueA7, setAvalueA7] = useState(0);
  const [avalueA8, setAvalueA8] = useState(0);
  const [avalueA3, setAvalueA3] = useState(0);

  const fileInputRef = React.useRef(null);

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(Number(value || 0));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (finality) {
      Swal.fire({
        icon: "warning",
        title: "Exercício Finalizado",
        text: "Os lançamentos da dotação inicial já foram validados e finalizados.",
      });
      return;
    }

    if (isConformed) {
      Swal.fire({
        icon: "error",
        title: "Operação não permitida",
        text: "A transação não pode ser realizada pois a dotação inicial já foi aprovada!",
      });
      return;
    }

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const workbook = XLSX.read(bstr, { type: "binary" });

          // 1. Identificar folha: prioridade para 'ORCAMENTO ANUAL', 'ORCAMENTO DISPONIVEL', 'TABELA DE DESPESAS', ou primeira folha
          const sheetName =
            workbook.SheetNames.find(
              (s) => s.trim().toUpperCase() === "ORCAMENTO ANUAL"
            ) ||
            workbook.SheetNames.find(
              (s) => s.trim().toUpperCase() === "ORCAMENTO DISPONIVEL"
            ) ||
            workbook.SheetNames.find(
              (s) => s.trim().toUpperCase() === "TABELA DE DESPESAS"
            ) ||
            workbook.SheetNames[0];

          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // 2. Identificar linha de cabeçalho e colunas (suporta cabeçalho simples ou duplo como em 1-PLANO E ORCAMENTO.xlsx)
          let headerRowIdx = -1;
          let colCode = 0;
          let colDesc = 1;
          let colMzn = -1;
          let colUsd = -1;

          for (let i = 0; i < Math.min(15, data.length); i++) {
            const row = data[i];
            if (!row) continue;
            const rowStr = row.map((c) => String(c || "").toLowerCase()).join(" ");
            if (
              rowStr.includes("código") ||
              rowStr.includes("codigo") ||
              rowStr.includes("designação") ||
              rowStr.includes("designacao")
            ) {
              headerRowIdx = i;
              row.forEach((cell, idx) => {
                const c = String(cell || "").toLowerCase();
                if (c.includes("código") || c.includes("codigo")) colCode = idx;
                else if (
                  c.includes("designação") ||
                  c.includes("designacao") ||
                  c.includes("rubrica")
                )
                  colDesc = idx;
                else if (
                  c.includes("usd") ||
                  c.includes("dólar") ||
                  c.includes("dolar")
                ) {
                  if (colUsd === -1) colUsd = idx;
                } else if (
                  (c.includes("mzn") ||
                    c.includes("contra") ||
                    c.includes("meticais")) &&
                  !c.includes("duod")
                ) {
                  if (colMzn === -1) colMzn = idx;
                }
              });

              // Verificar se a linha seguinte é sub-cabeçalho (ex.: [null, null, "USD", "Contra Valor", "Contra Valor"])
              const nextRow = data[i + 1];
              if (nextRow) {
                const nextRowStr = nextRow
                  .map((c) => String(c || "").toLowerCase())
                  .join(" ");
                if (
                  nextRowStr.includes("usd") ||
                  nextRowStr.includes("contra") ||
                  nextRowStr.includes("mzn")
                ) {
                  nextRow.forEach((cell, idx) => {
                    const c = String(cell || "").toLowerCase();
                    const parentHeader = String(row[idx] || "").toLowerCase();
                    if (parentHeader.includes("duod")) return;
                    if (
                      (c.includes("usd") ||
                        c.includes("dólar") ||
                        c.includes("dolar")) &&
                      colUsd === -1
                    ) {
                      colUsd = idx;
                    } else if (
                      (c.includes("mzn") ||
                        c.includes("contra") ||
                        c.includes("meticais")) &&
                      colMzn === -1
                    ) {
                      colMzn = idx;
                    }
                  });
                  headerRowIdx = i + 1;
                }
              }
              break;
            }
          }

          const startIdx = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;
          const allocations = [];
          let previewTotalUsd = 0;
          let previewTotalLeaf = 0;

          const parseNum = (val) => {
            if (typeof val === "number") return val;
            if (!val) return 0;
            const clean = String(val).replace(/,/g, "").replace(/\s/g, "").trim();
            return parseFloat(clean) || 0;
          };

          for (let i = startIdx; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const code = row[colCode] ? String(row[colCode]).trim() : "";
            const desc = row[colDesc] ? String(row[colDesc]).trim() : "";

            if (
              desc &&
              (desc.toLowerCase().includes("total") ||
                desc.includes("CÂMBIO") ||
                desc === "Designação" ||
                desc.includes("Orçamento Disponível"))
            ) {
              continue;
            }

            let valMzn = 0;
            let valUsd = 0;

            if (colUsd >= 0 && row[colUsd] !== undefined) {
              valUsd = parseNum(row[colUsd]);
              valMzn =
                colMzn >= 0 && row[colMzn] !== undefined
                  ? parseNum(row[colMzn])
                  : valUsd * 2.5;
            } else if (colMzn >= 0 && row[colMzn] !== undefined) {
              valMzn = parseNum(row[colMzn]);
              valUsd = valMzn / 2.5;
            } else {
              valMzn = parseNum(row[2]);
              valUsd = valMzn / 2.5;
            }

            if (code || desc) {
              allocations.push({
                code,
                description: desc,
                valueUsd: Number(valUsd.toFixed(2)),
                contraValorMzn: Number(valMzn.toFixed(2)),
              });
              if (!code.endsWith(".00")) {
                previewTotalUsd += valUsd;
                previewTotalLeaf++;
              }
            }
          }

          setLoading(false);

          if (allocations.length === 0) {
            Swal.fire({
              icon: "warning",
              title: "Nenhum dado encontrado",
              text: "Não foi possível encontrar rubricas com dotação na folha seleccionada.",
            });
            return;
          }

          const result = await Swal.fire({
            title: "Confirmar Importação de Dotação Orçamental",
            html: `
              <div style="text-align: left; font-size: 0.9rem; line-height: 1.6;">
                <p><strong>Ficheiro:</strong> ${file.name}</p>
                <p><strong>Folha Seleccionada:</strong> ${sheetName}</p>
                <p><strong>Linhas identificadas:</strong> ${allocations.length}</p>
                <p><strong>Regra de Preenchimento:</strong> <span style="color: #0f5132; font-weight: 700;">Contas Filhas por Designação</span></p>
                <p><strong>Contas Superiores:</strong> <span style="font-weight: 600;">Cálculo Automático por Agregação</span></p>
                <hr style="margin: 8px 0;" />
                <p><strong>Total Dotação Estimada (USD):</strong> ${formatNumber(previewTotalUsd)} USD</p>
                <p><strong>Contravalor Estimado (MZN):</strong> ${formatNumber(previewTotalUsd * 2.5)} MZN</p>
              </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#0f5132",
            confirmButtonText: "Sim, Importar Ficheiro",
            cancelButtonText: "Cancelar",
          });

          if (!result.isConfirmed) return;

          setLoading(true);
          const response = await importInitialAllocationsFromExcel({
            allocations,
            year: 2026,
          });

          Swal.fire({
            title: "Importação Concluída com Sucesso!",
            html: `
              <div style="text-align: left; font-size: 0.9rem; line-height: 1.6;">
                <p style="color: #0f5132; font-weight: 700;">${response.message || "Dotação inicial importada com sucesso!"}</p>
                <ul style="list-style: none; padding-left: 0;">
                  <li><strong>Contas de movimento preenchidas:</strong> ${response.leafCount || previewTotalLeaf}</li>
                  <li><strong>Contas superiores consolidadas:</strong> ${response.controlCount || 18}</li>
                  <li><strong>Total Orçamento (USD):</strong> ${formatNumber(response.totalUsd || previewTotalUsd)} USD</li>
                  <li><strong>Total Orçamento (MZN):</strong> ${formatNumber(response.totalMzn || previewTotalUsd * 2.5)} MZN</li>
                  <li><strong>Duodécimo Mensal (MZN):</strong> ${formatNumber(response.totalDuodecimo || (previewTotalUsd * 2.5) / 12)} MZN</li>
                </ul>
              </div>
            `,
            icon: "success",
            confirmButtonColor: "#0f5132",
          });

          await loadAccounts();
          await loadAccountsInitial();
          await findAccountPlanConformance();
          await validateInitialAllocationApprovalDateValidate();
        } catch (parseError) {
          console.error("Erro ao processar ficheiro:", parseError);
          Swal.fire({
            icon: "error",
            title: "Erro ao ler ficheiro",
            text: "Não foi possível processar a planilha. Verifique o formato.",
          });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const validateInitialAllocationApprovalDateValidate = async () => {
    try {
      setLoading(true);
      const response = await validateInitialAllocationApprovalDate();
      if (response && response.data && response.data.valid) {
        setFinality(true);
        if (response.data.approvalDate) {
          const date = new Date(response.data.approvalDate);
          setValidationDate(date.toLocaleDateString("pt-PT"));
        }
      } else {
        setFinality(false);
        setValidationDate("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (finality) return;

    if (isConformed) {
      Swal.fire({
        icon: "error",
        title: "Operação não permitida",
        text: "A transação não pode ser realizada pois a dotação inicial já foi aprovada!",
      });
      return;
    }

    const { isConfirmed, value: selectedDate } = await Swal.fire({
      title: "Finalizar Lançamentos da Dotação Inicial",
      html: `
        <div>
          <p style="margin-bottom: 12px; color: #334155;">Seleccione a data oficial de validação dos lançamentos:</p>
          <input 
            type="date" 
            id="validationDate" 
            class="swal2-input" 
            style="width: 80%; margin: 10px auto; padding: 8px 12px;"
            max="${new Date().toISOString().split("T")[0]}"
          >
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Confirmar Validação",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0f5132",
      cancelButtonColor: "#64748b",
      focusConfirm: false,
      preConfirm: () => {
        const dateInput = Swal.getPopup().querySelector("#validationDate");
        if (!dateInput.value) {
          Swal.showValidationMessage("Por favor seleccione uma data");
          return false;
        }
        const selectedDateStr = dateInput.value;
        const todayDateStr = new Date().toISOString().split("T")[0];
        if (selectedDateStr > todayDateStr) {
          Swal.showValidationMessage("A data não pode ser posterior à data actual");
          return false;
        }
        return dateInput.value;
      },
    });

    if (isConfirmed) {
      setLoading(true);
      try {
        await setInitialAllocationApprovalDate({
          date: selectedDate,
        });

        Swal.fire({
          title: "Sucesso!",
          text: "Lançamentos da dotação inicial finalizados com sucesso!",
          icon: "success",
          confirmButtonColor: "#0f5132",
        });
        validateInitialAllocationApprovalDateValidate();
        loadAccounts();
        findAccountPlanConformance();
        loadAccountsInitial();
      } catch (error) {
        console.error("Erro ao finalizar operação:", error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Não foi possível finalizar a operação.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const findAccountPlanConformance = async () => {
    try {
      setLoading(true);
      const response = await findConformInitialAllocation();
      setIsConformed(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountsInitial = async () => {
    try {
      setLoading(true);
      const response = await fetchInitialAllocationsByParentId();
      setValuesAccounts(response || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = (await findAccountPlanBudjectEntriesByYear()) || [];
      const avalueAList = response.filter(
        (account) =>
          account.accountPlan?.type === "budject" &&
          account.accountPlan?.finalAllocationType === "A"
      );
      const avalueA4List = response.filter(
        (account) =>
          account.accountPlan?.type === "budject" &&
          account.accountPlan?.finalAllocationType === "A4"
      );
      const avalueL4List = response.filter(
        (account) =>
          account.accountPlan?.type === "budject" &&
          account.accountPlan?.finalAllocationType === "L4"
      );
      const avalueA7List = response.filter(
        (account) =>
          account.accountPlan?.type === "budject" &&
          account.accountPlan?.finalAllocationType === "A7"
      );
      const avalueA8List = response.filter(
        (account) =>
          account.accountPlan?.type === "budject" &&
          account.accountPlan?.finalAllocationType === "A8"
      );
      const avalueL5List = response.filter(
        (account) =>
          account.accountPlan?.type === "budject" &&
          account.accountPlan?.finalAllocationType === "L5"
      );
      const avalueL6List = response.filter(
        (account) =>
          account.accountPlan?.type === "budject" &&
          account.accountPlan?.finalAllocationType === "L6"
      );
      const avalueA3List = response.filter(
        (account) =>
          account.accountPlan?.type === "budject" &&
          account.accountPlan?.finalAllocationType === "A3"
      );

      const contaLaparit = response.filter((account) => account.parentId === 420);
      const contaLaparitL1 = response.filter((account) => account.parentId === 422);

      const totalInitialAllocation = contaLaparit.reduce(
        (total, account) => total + (account.initialAllocation || 0),
        0
      );
      const totalInitialAllocationL1 = contaLaparitL1.reduce(
        (total, account) => total + (account.initialAllocation || 0),
        0
      );

      setAvalueA1(totalInitialAllocationL1 + totalInitialAllocation);

      const vA = avalueAList[0]?.finalAllocation || 0;
      const vL5 = avalueL5List[0]?.finalAllocation || 0;
      const vL6 = avalueL6List[0]?.finalAllocation || 0;
      const vA3 = avalueA3List[0]?.finalAllocation || 0;
      const vA4 = avalueA4List[0]?.finalAllocation || 0;
      const vL4 = avalueL4List[0]?.finalAllocation || 0;
      const vA7 = avalueA7List[0]?.finalAllocation || 0;
      const vA8 = avalueA8List[0]?.finalAllocation || 0;

      setAvalueA(vA + vL5 + vL6 + vA3 + vA4 + vL4);
      setAvalueA4(vA4);
      setAvalueL4(vL4);
      setAvalueA5(vL5 + vL6);
      setAvalueA7(vA7);
      setAvalueA8(vA8);
      setAvalueA3(vA3);

      const filteredParentAccounts = response.filter(
        (account) => account.accountPlan?.type === "budject"
      );
      setAccounts(filteredParentAccounts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    findAccountPlanConformance();
    loadAccountsInitial();
    validateInitialAllocationApprovalDateValidate();
  }, []);

  const organizeAccounts = (accountsList) => {
    const accountMap = {};
    const parentAccounts = [];
    const sortedList = [...accountsList].sort((a, b) =>
      String(a.accountPlan?.number || a.accountPlanNumber || "").localeCompare(
        String(b.accountPlan?.number || b.accountPlanNumber || ""),
        undefined,
        { numeric: true }
      )
    );
    sortedList.forEach((account) => {
      account.children = [];
      accountMap[account.id] = account;
    });
    sortedList.forEach((account) => {
      if (account.parentId) {
        const parentAccount = accountMap[account.parentId];
        if (parentAccount) {
          parentAccount.children.push(account);
        }
      } else {
        parentAccounts.push(account);
      }
    });
    return parentAccounts;
  };

  const organizedAccounts = organizeAccounts(accounts);

  function calculateTotals(account) {
    let totalInitialAllocation = account.initialAllocation || 0;
    let totalFinalAllocation = account.finalAllocation || 0;

    account.children.forEach((child) => {
      const childTotals = calculateTotals(child);
      totalInitialAllocation += childTotals.initial;
      totalFinalAllocation += childTotals.final;
    });
    account.totalInitialAllocation = totalInitialAllocation || 0;
    account.totalFinalAllocation = totalFinalAllocation || 0;

    return {
      initial: totalInitialAllocation,
      final: totalFinalAllocation,
    };
  }

  useEffect(() => {
    organizedAccounts.forEach((account) => calculateTotals(account));
  }, [accounts]);

  const calculateChildrenAllocation = (account) => {
    let total = 0;
    if (account.children && Array.isArray(account.children)) {
      account.children.forEach((child) => {
        const initialAllocationEntry = child.entriesEntry?.find(
          (entry) => entry.type === "initial_allocation"
        );
        const initialAllocation = initialAllocationEntry
          ? initialAllocationEntry.allocation
          : 0;
        total += initialAllocation;
      });
    }
    return total;
  };

  const calculateChildrenAllocationA2 = (account) => {
    let total = 0;
    const processChildren = (children) => {
      if (children && Array.isArray(children)) {
        children.forEach((child) => {
          if (!child.entriesEntry || child.entriesEntry.length === 0) {
            if (child.children && Array.isArray(child.children)) {
              processChildren(child.children);
            }
          } else {
            const initialAllocationEntry = child.entriesEntry.find(
              (entry) => entry.type === "initial_allocation"
            );
            const initialAllocation = initialAllocationEntry
              ? initialAllocationEntry.allocation
              : 0;
            total += initialAllocation;
          }
        });
      }
    };
    processChildren(account.children);
    return total;
  };

  const calculateFinalAllocation = (account) => {
    let totalAllocation = 0;
    const finalAllocationType = account.accountPlan?.finalAllocationType;
    const initialAllocationEntry = account.entriesEntry?.find(
      (entry) => entry.type === "initial_allocation"
    );
    const initialAllocation = initialAllocationEntry
      ? initialAllocationEntry.allocation
      : 0;

    if (
      ["L", "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9"].includes(
        finalAllocationType
      )
    ) {
      totalAllocation += calculateChildrenAllocation(account);
    } else if (finalAllocationType === "A") {
      totalAllocation = totalCurrentExpenses;
    } else if (finalAllocationType === "L4") {
      totalAllocation = avalueL4;
    } else if (finalAllocationType === "A1") {
      totalAllocation = calculateChildrenAllocationA2(account);
    } else if (finalAllocationType === "A2") {
      totalAllocation = calculateChildrenAllocationA2(account);
    } else if (finalAllocationType === "A3") {
      totalAllocation += calculateChildrenAllocationA2(account);
    } else if (finalAllocationType === "A4") {
      const l2Account = accounts.find(
        (acc) => acc.accountPlan?.finalAllocationType === "L2"
      );
      const l3Account = accounts.find(
        (acc) => acc.accountPlan?.finalAllocationType === "L3"
      );
      const l2Allocation = l2Account ? calculateChildrenAllocation(l2Account) : 0;
      const l3Allocation = l3Account ? calculateChildrenAllocation(l3Account) : 0;
      totalAllocation = l2Allocation + l3Allocation;
    } else if (finalAllocationType === "A5") {
      totalAllocation = avalueA5;
    } else if (finalAllocationType === "A7" || finalAllocationType === "A8") {
      totalAllocation = totalCapitalExpenses;
    } else {
      totalAllocation += initialAllocation || 0;
    }
    return totalAllocation;
  };

  const calculateFinalAllocationTotal = (account, type) => {
    let totalAllocation = 0;
    if (type === "AFF") {
      const relevantAccounts = accounts.filter((acc) =>
        ["A3", "A2", "L4", "L5", "L6", "L2", "L3"].includes(
          acc.accountPlan?.finalAllocationType
        )
      );
      relevantAccounts.forEach((accountItem) => {
        totalAllocation += (accountItem.children || []).reduce(
          (acc, child) => acc + calculateFinalAllocation(child),
          0
        );
      });
    } else if (type === "AFC") {
      const relevantAccounts = accounts.filter((acc) =>
        ["L7", "L8", "L9"].includes(acc.accountPlan?.finalAllocationType)
      );
      relevantAccounts.forEach((accountItem) => {
        totalAllocation += (accountItem.children || []).reduce(
          (acc, child) => acc + calculateFinalAllocation(child),
          0
        );
      });
    } else {
      totalAllocation += account.finalAllocation || 0;
    }
    return totalAllocation;
  };

  const totalCurrentExpenses = calculateFinalAllocationTotal(accounts, "AFF");
  const totalCapitalExpenses = calculateFinalAllocationTotal(accounts, "AFC");
  const totalGlobalBudget = totalCurrentExpenses + totalCapitalExpenses;
  const totalCurrentContraValor = totalCurrentExpenses * 2.5;
  const totalCurrentDuodecimo = totalCurrentContraValor / 12;
  const totalCapitalContraValor = totalCapitalExpenses * 2.5;
  const totalCapitalDuodecimo = totalCapitalContraValor / 12;
  const totalGlobalContraValor = totalGlobalBudget * 2.5;
  const totalGlobalDuodecimo = totalGlobalContraValor / 12;

  const exportToPDF = () => {
    const table = document.querySelector("#tableData");
    if (!table) return;
    const rows = Array.from(table.querySelectorAll("tr"));

    const head = [
      [
        { content: "Código", rowSpan: 2 },
        { content: "Designação", rowSpan: 2 },
        { content: "Dotação Inicial", colSpan: 2 },
        { content: "Duodécimo", rowSpan: 2 },
      ],
      [{ content: "USD" }, { content: "Contra Valor (MZN)" }],
    ];

    const body = rows.slice(2).map((row) =>
      Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent.trim())
    );

    const totals = [
      [
        "",
        "Total de Despesas Correntes",
        formatNumber(totalCurrentExpenses),
        formatNumber(totalCurrentContraValor),
        formatNumber(totalCurrentDuodecimo),
      ],
      [
        "",
        "Total de Despesas de Capital",
        formatNumber(totalCapitalExpenses),
        formatNumber(totalCapitalContraValor),
        formatNumber(totalCapitalDuodecimo),
      ],
      [
        "",
        "Total Orçamento Global",
        formatNumber(totalGlobalBudget),
        formatNumber(totalGlobalContraValor),
        formatNumber(totalGlobalDuodecimo),
      ],
    ];

    const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");

    templatePDF({
      title: "Tabela de Despesas Orçamentais",
      subtitle: "Dotação Inicial, Contravalor em MZN e Duodécimo Mensal",
      tableContent: {
        head,
        body: [...body, ...totals],
        columnStyles: {
          0: { halign: "left" },
          1: { halign: "left" },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
      },
      footerText: "Documento gerado automaticamente pelo SGF",
      logoImage: logoMz,
      generatedBy: savedUserData.fullName || "Utilizador SGF",
      filename: "dotacao_inicial_despesas.pdf",
    });
  };

  const exportToExcelWithStyles = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("ORCAMENTO DISPONIVEL");

    worksheet.columns = [
      { header: "Código", key: "codigo", width: 18 },
      { header: "Designação", key: "designacao", width: 48 },
      { header: "Dotação Inicial (MZN)", key: "dotacao_mzn", width: 25 },
      { header: "Dotação Inicial (USD)", key: "dotacao_usd", width: 24 },
      { header: "Duodécimo Mensal (MZN)", key: "duodecimo", width: 24 },
      { header: "Tipo de Conta", key: "tipo_conta", width: 28 },
    ];

    // Estilizar cabeçalho
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F5132" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 24;

    const renderAccountRowsToExcel = (account, level = 0) => {
      const isParentAccount = account.children && account.children.length > 0;
      const finalAllocation = calculateFinalAllocation(account);
      const usdValue = finalAllocation || 0;
      const totalContraValor = finalAllocation * exchangeRate;
      const totalDuoDecimo = totalContraValor / 12;

      const row = worksheet.addRow({
        codigo: `${account.accountPlan.number}`,
        designacao: `${account.accountPlan.description}`,
        dotacao_mzn: Number(totalContraValor.toFixed(2)),
        dotacao_usd: Number(usdValue.toFixed(2)),
        duodecimo: Number(totalDuoDecimo.toFixed(2)),
        tipo_conta: isParentAccount
          ? "Agregadora (Cálculo Automático)"
          : "Movimento (Preencher Dotação)",
      });

      if (isParentAccount) {
        row.eachCell((cell) => {
          cell.style.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE8F5EE" },
          };
          cell.style.font = { bold: true, color: { argb: "FF0F5132" } };
        });
      }

      account.children?.forEach((childAccount) =>
        renderAccountRowsToExcel(childAccount, level + 1)
      );
    };

    organizedAccounts.forEach((account) => renderAccountRowsToExcel(account));

    const totalCorrentesRow = worksheet.addRow({
      codigo: "",
      designacao: "Total de Despesas Correntes",
      dotacao_mzn: Number(totalCurrentContraValor.toFixed(2)),
      dotacao_usd: Number(totalCurrentExpenses.toFixed(2)),
      duodecimo: Number(totalCurrentDuodecimo.toFixed(2)),
      tipo_conta: "Total Agregado",
    });
    totalCorrentesRow.font = { bold: true };

    const totalCapitalRow = worksheet.addRow({
      codigo: "",
      designacao: "Total de Despesas de Capital",
      dotacao_mzn: Number(totalCapitalContraValor.toFixed(2)),
      dotacao_usd: Number(totalCapitalExpenses.toFixed(2)),
      duodecimo: Number(totalCapitalDuodecimo.toFixed(2)),
      tipo_conta: "Total Agregado",
    });
    totalCapitalRow.font = { bold: true };

    const totalGlobalRow = worksheet.addRow({
      codigo: "",
      designacao: "Total Orçamento Global",
      dotacao_mzn: Number(totalGlobalContraValor.toFixed(2)),
      dotacao_usd: Number(totalGlobalBudget.toFixed(2)),
      duodecimo: Number(totalGlobalDuodecimo.toFixed(2)),
      tipo_conta: "Total Geral",
    });
    totalGlobalRow.font = { bold: true };
    totalGlobalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD1E7DD" },
    };

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "modelo_dotacao_orcamental_2026.xlsx";
      link.click();
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const accountPlanFilter = accounts.filter(
      (item) => item.accountPlan?.number === value
    );

    if (accountPlanFilter.length > 0 && accountPlanFilter[0].accountPlan) {
      setAccountPlan(accountPlanFilter[0].accountPlanId);
    }

    if (name === "value" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "value" && value) {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isConformed) {
      Swal.fire({
        icon: "error",
        title: "Operação não permitida",
        text: "A transação não pode ser realizada pois a dotação inicial já foi aprovada!",
      });
      return;
    }
    const result = await Swal.fire({
      title: "Confirmação de Dotação",
      text: "Tem a certeza de que deseja registar a dotação inicial para esta conta?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f5132",
      confirmButtonText: "Sim, registar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;
    setLoading(true);
    const operationDate = DateTime.now().toFormat("yyyy-MM-dd");
    try {
      await setCreateAccountPlanBudjectEntry({
        ...formData,
        operationDate: operationDate,
      });

      Swal.fire({
        icon: "success",
        title: "Sucesso",
        text: "Dotação registada com sucesso!",
      });
      validateInitialAllocationApprovalDateValidate();
      loadAccounts();
      findAccountPlanConformance();
      loadAccountsInitial();
      setFormData({
        accountPlanNumber: "",
        value: "",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao efectuar a transação, tente novamente!";
      const errorDetail = error?.response?.data?.error || "";
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: `${errorMessage}${errorDetail ? `: ${errorDetail}` : ""}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInitialBudget = async (e) => {
    e.preventDefault();
    if (isConformed) {
      Swal.fire({
        icon: "error",
        title: "Operação não permitida",
        text: "A transação não pode ser realizada pois a dotação inicial já foi aprovada!",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Actualizar Dotação",
      text: "Tem a certeza de que deseja actualizar o valor desta conta?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f5132",
      confirmButtonText: "Sim, actualizar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;
    setLoading(true);
    const operationDate = DateTime.now().toFormat("yyyy-MM-dd");
    try {
      await setUpdateInitialAllocation({
        accountPlanNumber: formData.accountPlanNumber,
        newValue: formData.value,
        isInitialAllocation: true,
        operationDate: operationDate,
      });

      Swal.fire({
        icon: "success",
        title: "Sucesso",
        text: "Dotação actualizada com sucesso!",
      });
      validateInitialAllocationApprovalDateValidate();
      loadAccounts();
      findAccountPlanConformance();
      loadAccountsInitial();
      setFormData({
        accountPlanNumber: "",
        value: "",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erro ao efectuar a transação, tente novamente!";
      const errorDetail = error?.response?.data?.error || "";
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: `${errorMessage}${errorDetail ? `: ${errorDetail}` : ""}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRowDoubleClick = (account) => {
    setFormData({
      accountPlanNumber: account.accountPlan.number,
      value: account.finalAllocation.toFixed(2),
    });
  };

  const matchesSearch = (account) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const selfMatch =
      account.accountPlan?.number?.toLowerCase().includes(q) ||
      account.accountPlan?.description?.toLowerCase().includes(q);
    const childMatch = account.children?.some((c) => matchesSearch(c));
    return selfMatch || childMatch;
  };

  const renderAccountRows = (account, level = 0) => {
    if (!matchesSearch(account)) return null;

    const isParentAccount =
      (account.children && account.children.length > 0) ||
      account.accountPlan?.number === "1.6.0.0.00";

    const finalAllocation = calculateFinalAllocation(account);
    const usdValue = (finalAllocation * exchangeRate)?.toFixed(2) || 0;
    const totalContraValor = finalAllocation * exchangeRate;
    const totalDuoDecimo = (usdValue / 12).toFixed(2);

    const handleRowClick = () => {
      if (isParentAccount) {
        Swal.fire({
          title: "Conta Agregadora",
          text: "Seleccione uma subconta de movimento para lançar ou actualizar a dotação.",
          icon: "info",
          confirmButtonColor: "#0f5132",
          confirmButtonText: "Entendido",
        });
      } else {
        handleRowDoubleClick({
          accountPlan: account.accountPlan,
          finalAllocation,
          totalContraValor,
          totalDuoDecimo,
        });
      }
    };

    return (
      <React.Fragment key={account.accountPlan?.number || account.id}>
        <tr
          className={isParentAccount ? "sgf-row-parent" : ""}
          onDoubleClick={handleRowClick}
          style={{ cursor: "pointer" }}
          title={
            isParentAccount
              ? "Conta agregadora (calculada automaticamente)"
              : "Duplo clique para carregar esta conta no formulário"
          }
        >
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
          <td
            className="text-end"
            style={{
              fontFamily: "monospace",
              fontWeight: isParentAccount ? 700 : 600,
              whiteSpace: "nowrap",
            }}
          >
            {formatNumber(finalAllocation.toFixed(2))}
          </td>
          <td
            className="text-end"
            style={{
              fontFamily: "monospace",
              fontWeight: isParentAccount ? 700 : 600,
              color: "#0f5132",
              whiteSpace: "nowrap",
            }}
          >
            {formatNumber(usdValue)}
          </td>
          <td
            className="text-end"
            style={{
              fontFamily: "monospace",
              fontWeight: isParentAccount ? 700 : 500,
              color: "#92400e",
              whiteSpace: "nowrap",
            }}
          >
            {formatNumber(totalDuoDecimo)}
          </td>
        </tr>

        {account.children &&
          account.children.map((childAccount) =>
            renderAccountRows(childAccount, level + 1)
          )}
      </React.Fragment>
    );
  };

  return (
    <div className="container-fluid py-2">
      <Spinner isLoading={loading} />

      {/* Cabeçalho Institucional Compacto da Tabela de Despesas */}
      <div className="sgf-page-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <h2 className="mb-0" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
            Tabela de Despesas — Dotação Orçamental Inicial
          </h2>
          <span
            className="badge"
            style={{
              backgroundColor: "#eaf5ef",
              color: "#0f5132",
              border: "1px solid #a7d7be",
            }}
          >
            <FaCoins className="me-1" /> Plano & Orçamento
          </span>
          <span
            className="badge"
            style={{
              backgroundColor: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fde68a",
            }}
          >
            Câmbio: 1 USD = {exchangeRate} MZN
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={finality}
            className="btn btn-sm"
            style={{
              background: finality
                ? "#e8f5ee"
                : "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              color: finality ? "#0f5132" : "#ffffff",
              border: finality ? "1px solid #a7d7be" : "1px solid #b45309",
              padding: "6px 14px",
              fontWeight: 700,
            }}
          >
            {finality ? (
              <>
                <FaCheckCircle /> Validado em {validationDate}
              </>
            ) : (
              <>
                <FaCrown /> Finalizar Lançamentos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Linha Compacta de 3 Cards Executivos de Resumo Orçamental */}
      <div className="row g-2 mb-2">
        {/* Card 1: Despesas Correntes */}
        <div className="col-md-4">
          <div
            className="card h-100 mb-0"
            style={{
              borderTop: "3px solid #0f5132",
              background: "linear-gradient(180deg, #ffffff 0%, #f6fbf8 100%)",
            }}
          >
            <div className="card-body" style={{ padding: "0.65rem 0.9rem" }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#0f5132",
                    textTransform: "uppercase",
                  }}
                >
                  Despesas Correntes
                </span>
                <span
                  className="badge"
                  style={{ backgroundColor: "#eaf5ef", color: "#0f5132" }}
                >
                  Funcionamento
                </span>
              </div>

              <div className="d-flex flex-column gap-1">
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "0.75rem", color: "#5c746b" }}>
                    Dotação (USD):
                  </span>
                  <strong style={{ fontSize: "0.84rem", color: "#0f2922", fontFamily: "monospace" }}>
                    {formatNumber(totalCurrentExpenses)} USD
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "0.75rem", color: "#5c746b" }}>
                    Contravalor (MZN):
                  </span>
                  <strong style={{ fontSize: "0.9rem", color: "#0f5132", fontFamily: "monospace" }}>
                    {formatNumber(totalCurrentContraValor)} MZN
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "0.75rem", color: "#5c746b" }}>
                    Duodécimo:
                  </span>
                  <strong style={{ fontSize: "0.8rem", color: "#b45309", fontFamily: "monospace" }}>
                    {formatNumber(totalCurrentDuodecimo)} MZN
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Despesas de Capital */}
        <div className="col-md-4">
          <div
            className="card h-100 mb-0"
            style={{
              borderTop: "3px solid #0284c7",
              background: "linear-gradient(180deg, #ffffff 0%, #f5faff 100%)",
            }}
          >
            <div className="card-body" style={{ padding: "0.65rem 0.9rem" }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#0369a1",
                    textTransform: "uppercase",
                  }}
                >
                  Despesas de Capital
                </span>
                <span
                  className="badge"
                  style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}
                >
                  Investimento
                </span>
              </div>

              <div className="d-flex flex-column gap-1">
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "0.75rem", color: "#5c746b" }}>
                    Dotação (USD):
                  </span>
                  <strong style={{ fontSize: "0.84rem", color: "#0f2922", fontFamily: "monospace" }}>
                    {formatNumber(totalCapitalExpenses)} USD
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "0.75rem", color: "#5c746b" }}>
                    Contravalor (MZN):
                  </span>
                  <strong style={{ fontSize: "0.9rem", color: "#0369a1", fontFamily: "monospace" }}>
                    {formatNumber(totalCapitalContraValor)} MZN
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "0.75rem", color: "#5c746b" }}>
                    Duodécimo:
                  </span>
                  <strong style={{ fontSize: "0.8rem", color: "#b45309", fontFamily: "monospace" }}>
                    {formatNumber(totalCapitalDuodecimo)} MZN
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Orçamento Global */}
        <div className="col-md-4">
          <div
            className="card h-100 mb-0"
            style={{
              borderTop: "3px solid #d97706",
              background: "linear-gradient(180deg, #ffffff 0%, #fefbf3 100%)",
            }}
          >
            <div className="card-body" style={{ padding: "0.65rem 0.9rem" }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#92400e",
                    textTransform: "uppercase",
                  }}
                >
                  Orçamento Global
                </span>
                <span
                  className="badge"
                  style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                >
                  Consolidado Anual
                </span>
              </div>

              <div className="d-flex flex-column gap-1">
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "0.75rem", color: "#5c746b" }}>
                    Dotação Global (USD):
                  </span>
                  <strong style={{ fontSize: "0.84rem", color: "#0f2922", fontFamily: "monospace" }}>
                    {formatNumber(totalGlobalBudget)} USD
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "0.75rem", color: "#5c746b" }}>
                    Contravalor Global (MZN):
                  </span>
                  <strong style={{ fontSize: "0.92rem", color: "#0f5132", fontFamily: "monospace" }}>
                    {formatNumber(totalGlobalContraValor)} MZN
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "0.75rem", color: "#5c746b" }}>
                    Duodécimo Global:
                  </span>
                  <strong style={{ fontSize: "0.8rem", color: "#b45309", fontFamily: "monospace" }}>
                    {formatNumber(totalGlobalDuodecimo)} MZN
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Lançamento e Actualização de Dotação */}
      <div className="card">
        <div className="card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaCalculator style={{ color: "#0f5132" }} />
            <span>Registar ou Actualizar Dotação Inicial por Conta de Movimento</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#5c746b", fontWeight: 500 }}>
            Duplo clique numa linha de movimento na tabela preenche os campos automaticamente
          </span>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-2 align-items-start">
              <div className="col-md-5">
                <label htmlFor="accountPlanNumber">Conta Orçamental de Movimento</label>
                <select
                  id="accountPlanNumber"
                  name="accountPlanNumber"
                  className="form-select"
                  value={formData.accountPlanNumber}
                  onChange={handleChange}
                  required
                  title={
                    accounts.find(
                      (a) => a.accountPlan?.number === formData.accountPlanNumber
                    )?.accountPlan?.description || ""
                  }
                >
                  <option value="">Seleccionar Conta de Movimento...</option>
                  {accounts
                    .filter(
                      (account) =>
                        account.accountPlan?.type === "budject" &&
                        account.accountPlan?.writable === "moviment"
                    )
                    .map((account) => (
                      <option key={account.id} value={account.accountPlan.number}>
                        {account.accountPlan.number} — {account.accountPlan.description}
                      </option>
                    ))}
                </select>
                {formData.accountPlanNumber && (
                  <div className="sgf-field-preview">
                    <strong>{formData.accountPlanNumber}:</strong>{" "}
                    {accounts.find(
                      (a) => a.accountPlan?.number === formData.accountPlanNumber
                    )?.accountPlan?.description || ""}
                  </div>
                )}
              </div>

              <div className="col-md-3">
                <label htmlFor="value">Dotação Inicial (Valor em USD)</label>
                <input
                  type="text"
                  id="value"
                  name="value"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </div>

              <div className="col-md-4 d-flex gap-2" style={{ paddingTop: "21px" }}>
                <button
                  type="submit"
                  className="btn btn-primary flex-fill"
                  disabled={loading || finality || isConformed}
                  style={{ minHeight: "35px" }}
                >
                  <FaPlusCircle />
                  {loading ? "A processar..." : "Registar Lançamento"}
                </button>
                <button
                  type="button"
                  className="btn btn-success flex-fill"
                  disabled={loading || finality || isConformed}
                  onClick={handleUpdateInitialBudget}
                  style={{ minHeight: "35px" }}
                >
                  <FaSyncAlt /> Actualizar Valor
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Card da Tabela Principal de Despesas */}
      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <FaLayerGroup style={{ color: "#0f5132" }} />
            <span>Quadro Detalhado de Despesas Orçamentais</span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Pesquisar código ou rubrica..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: "230px", minHeight: "36px" }}
            />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={finality || isConformed}
              accept=".xlsx, .xls"
              style={{ display: "none" }}
            />

            <Button
              variant="outline-success"
              size="sm"
              onClick={exportToExcelWithStyles}
              style={{ fontWeight: 600, borderColor: "#0f5132", color: "#0f5132" }}
              title="Descarrega o modelo Excel do sistema com a estrutura de contas para preenchimento"
            >
              <BsFileEarmarkExcelFill /> Exportar Modelo Excel
            </Button>

            <Button
              variant="success"
              size="sm"
              disabled={finality || isConformed}
              onClick={() => {
                if (finality || isConformed) {
                  Swal.fire({
                    icon: "warning",
                    title: "Dotação Inicial Validada",
                    text: "A Tabela de Despesas — Dotação Orçamental Inicial já foi validada e não permite novo upload de ficheiro Excel.",
                  });
                  return;
                }
                fileInputRef.current?.click();
              }}
              style={{
                backgroundColor: finality || isConformed ? "#94a3b8" : "#0f5132",
                borderColor: finality || isConformed ? "#94a3b8" : "#0f5132",
                fontWeight: 700,
                color: "#ffffff",
                cursor: finality || isConformed ? "not-allowed" : "pointer",
              }}
              title={
                finality || isConformed
                  ? "A Dotação Orçamental Inicial já foi validada; o upload de Excel está bloqueado"
                  : "Importar a planilha Excel preenchida com as dotações"
              }
            >
              <FaUpload />{" "}
              {finality || isConformed
                ? "Upload Bloqueado (Validado)"
                : "Importar Excel Preenchido"}
            </Button>

            <Button variant="danger" size="sm" onClick={exportToPDF}>
              <FaFilePdf /> Exportar PDF
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              style={{
                backgroundColor: "#be123c",
                borderColor: "#be123c",
                color: "#ffffff",
                fontWeight: 700,
              }}
              title="Zerar todos os valores da tabela e remover a validação/conformidade"
              onClick={async () => {
                const result = await Swal.fire({
                  title: "Limpar e Zerar Tabela de Despesas?",
                  text: "Esta acção irá zerar todos os valores de dotação da tabela e remover a validação e a conformidade para permitir um novo carregamento!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#be123c",
                  cancelButtonColor: "#64748b",
                  confirmButtonText: "Sim, zerar tudo!",
                  cancelButtonText: "Cancelar",
                  reverseButtons: true,
                });

                if (result.isConfirmed) {
                  try {
                    setLoading(true);
                    await limparDados();
                    setFinality(false);
                    setValidationDate("");
                    setIsConformed(false);
                    await loadAccounts();
                    await findAccountPlanConformance();
                    await loadAccountsInitial();
                    await validateInitialAllocationApprovalDateValidate();
                    Swal.fire(
                      "Tabela Zerada!",
                      "Todos os valores foram zerados e a validação/conformidade foi removida com sucesso.",
                      "success"
                    );
                  } catch (error) {
                    Swal.fire(
                      "Erro!",
                      "Ocorreu um erro ao tentar limpar os dados.",
                      "error"
                    );
                  } finally {
                    setLoading(false);
                  }
                }
              }}
            >
              <FaTrashAlt /> Limpar Dados
            </Button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table id="tableData" className="table table-hover mb-0">
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "39%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead className="sticky-top">
                <tr>
                  <th rowSpan={2} style={{ verticalAlign: "middle" }}>
                    Código
                  </th>
                  <th rowSpan={2} style={{ verticalAlign: "middle" }}>
                    Designação da Rubrica
                  </th>
                  <th colSpan={2} className="text-center">
                    Dotação Inicial
                  </th>
                  <th className="text-center">Duodécimo Mensal</th>
                </tr>
                <tr>
                  <th className="text-end">Valor (USD)</th>
                  <th className="text-end">Contra Valor (MZN)</th>
                  <th className="text-end">Contra Valor (MZN)</th>
                </tr>
              </thead>
              <tbody>
                {organizedAccounts.length > 0 ? (
                  organizedAccounts.map((account) => renderAccountRows(account))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      Sem dados disponíveis para exibição.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Conta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="code">Código</label>
            <input
              type="text"
              id="code"
              name="code"
              className="form-control"
              value={editFormData?.accountPlanNumber || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label htmlFor="description">Dotação</label>
            <input
              type="text"
              id="description"
              name="description"
              className="form-control"
              value={editFormData?.finalAllocation || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
              }
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const updatedAccounts = accounts.map((acc) =>
                acc.number === editFormData.number ? editFormData : acc
              );
              setAccounts(updatedAccounts);
              setShowEditModal(false);
            }}
          >
            Guardar Alterações
          </Button>
        </Modal.Footer>
      </Modal>

      {popup.show && (
        <PopupNotification
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
};

export default BudjectTableComponent;
