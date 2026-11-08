import { useEffect } from "react";

/**
 * SgfAutoTablePaginator
 * Enhances all SGF HTML tables with a sleek DataTable pagination bar:
 * - Removes vertical scrollbars from .table-responsive containers
 * - Paginates tbody data rows into 10 or 15 rows per page
 * - Provides «, ‹, page numbers, ›, » navigation arrows
 * - Preserves all rows in DOM (using .sgf-paginated-hidden) so PDF/Excel exports include 100% of rows
 */
export default function SgfAutoTablePaginator() {
  useEffect(() => {
    const tableStateMap = new WeakMap();
    let isUpdatingDOM = false;
    let rafId = null;

    const isSummaryOrEmptyRow = (tr) => {
      if (!tr || !tr.cells || tr.cells.length === 0) return true;
      if (tr.cells.length === 1 && tr.cells[0].colSpan > 1) return true;
      const text = (tr.textContent || "").trim().toUpperCase();
      if (
        text.startsWith("TOTAL") ||
        text.startsWith("SUBTOTAL") ||
        text.includes("TOTAL GERAL") ||
        text.includes("TOTAL DO PLANO") ||
        text.includes("TOTAL ORÇAMENTADO")
      ) {
        return true;
      }
      return false;
    };

    const applyPaginationToTable = (table) => {
      if (!table || table.dataset.sgfNoPaginate === "true") return;
      const tbody = table.querySelector("tbody");
      if (!tbody) return;

      // Remove vertical scrollbars from parent container
      const responsiveWrapper = table.closest(".table-responsive");
      if (responsiveWrapper) {
        responsiveWrapper.style.maxHeight = "none";
        responsiveWrapper.style.overflowY = "visible";
      }

      const allRows = Array.from(tbody.querySelectorAll(":scope > tr"));
      const dataRows = [];
      const summaryRows = [];

      allRows.forEach((tr) => {
        if (isSummaryOrEmptyRow(tr)) {
          summaryRows.push(tr);
        } else {
          dataRows.push(tr);
        }
      });

      let state = tableStateMap.get(table);
      const signature = `${dataRows.length}:${
        dataRows[0] ? dataRows[0].textContent.slice(0, 40) : ""
      }:${
        dataRows[dataRows.length - 1]
          ? dataRows[dataRows.length - 1].textContent.slice(0, 40)
          : ""
      }`;

      if (!state) {
        state = {
          page: 1,
          pageSize: 10,
          signature,
        };
        tableStateMap.set(table, state);
      } else if (state.signature !== signature) {
        state.signature = signature;
        const maxPage = Math.max(1, Math.ceil(dataRows.length / state.pageSize));
        if (state.page > maxPage) {
          state.page = 1;
        }
      }

      const totalItems = dataRows.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));
      if (state.page > totalPages) state.page = totalPages;
      if (state.page < 1) state.page = 1;

      const startIdx = (state.page - 1) * state.pageSize;
      const endIdx = Math.min(startIdx + state.pageSize, totalItems);

      isUpdatingDOM = true;

      // Show only rows in current page
      dataRows.forEach((tr, idx) => {
        if (idx >= startIdx && idx < endIdx) {
          tr.classList.remove("sgf-paginated-hidden");
        } else {
          tr.classList.add("sgf-paginated-hidden");
        }
      });

      // Summary / empty rows always stay visible
      summaryRows.forEach((tr) => {
        tr.classList.remove("sgf-paginated-hidden");
      });

      // Find or create the pagination bar right after .table-responsive or table
      const anchorEl = responsiveWrapper || table;
      let paginationBar = anchorEl.nextElementSibling;
      if (
        !paginationBar ||
        !paginationBar.classList.contains("sgf-datatable-pagination")
      ) {
        paginationBar = document.createElement("div");
        paginationBar.className = "sgf-datatable-pagination";
        if (anchorEl.parentNode) {
          anchorEl.parentNode.insertBefore(paginationBar, anchorEl.nextSibling);
        }
      }

      const displayStart = totalItems === 0 ? 0 : startIdx + 1;
      const displayEnd = totalItems === 0 ? 0 : endIdx;

      // Build page numbers window (up to 5 page buttons)
      const pageButtons = [];
      let startPage = Math.max(1, state.page - 2);
      let endPage = Math.min(totalPages, startPage + 4);
      if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
      }
      for (let p = startPage; p <= endPage; p++) {
        pageButtons.push(p);
      }

      paginationBar.innerHTML = `
        <div class="sgf-dt-info">
          <span>A mostrar <strong>${displayStart}–${displayEnd}</strong> de <strong>${totalItems}</strong> registo(s)</span>
          <span class="sgf-dt-divider">|</span>
          <label class="sgf-dt-size-label">
            Linhas por pág.:
            <select class="sgf-dt-size-select" aria-label="Linhas por página">
              <option value="10" ${state.pageSize === 10 ? "selected" : ""}>10</option>
              <option value="15" ${state.pageSize === 15 ? "selected" : ""}>15</option>
            </select>
          </label>
        </div>
        <div class="sgf-dt-controls">
          <button type="button" class="sgf-dt-btn" data-action="first" title="Primeira página" ${
            state.page <= 1 ? "disabled" : ""
          }>&laquo;</button>
          <button type="button" class="sgf-dt-btn" data-action="prev" title="Página anterior" ${
            state.page <= 1 ? "disabled" : ""
          }>&lsaquo;</button>
          ${pageButtons
            .map(
              (p) =>
                `<button type="button" class="sgf-dt-btn sgf-dt-page ${
                  p === state.page ? "active" : ""
                }" data-page="${p}">${p}</button>`
            )
            .join("")}
          <button type="button" class="sgf-dt-btn" data-action="next" title="Próxima página" ${
            state.page >= totalPages ? "disabled" : ""
          }>&rsaquo;</button>
          <button type="button" class="sgf-dt-btn" data-action="last" title="Última página" ${
            state.page >= totalPages ? "disabled" : ""
          }>&raquo;</button>
        </div>
      `;

      // Bind events
      const sizeSelect = paginationBar.querySelector(".sgf-dt-size-select");
      if (sizeSelect) {
        sizeSelect.onchange = (e) => {
          state.pageSize = Number(e.target.value) || 10;
          state.page = 1;
          applyPaginationToTable(table);
        };
      }

      const buttons = paginationBar.querySelectorAll(".sgf-dt-btn");
      buttons.forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          if (btn.disabled) return;
          const action = btn.getAttribute("data-action");
          const pageAttr = btn.getAttribute("data-page");
          if (action === "first") state.page = 1;
          else if (action === "prev") state.page = Math.max(1, state.page - 1);
          else if (action === "next")
            state.page = Math.min(totalPages, state.page + 1);
          else if (action === "last") state.page = totalPages;
          else if (pageAttr) state.page = Number(pageAttr);
          applyPaginationToTable(table);
        };
      });

      setTimeout(() => {
        isUpdatingDOM = false;
      }, 0);
    };

    const scanAllTables = () => {
      if (isUpdatingDOM) return;
      const tables = document.querySelectorAll("table.table");
      tables.forEach((table) => {
        applyPaginationToTable(table);
      });
    };

    const scheduleScan = () => {
      if (isUpdatingDOM) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        scanAllTables();
      });
    };

    // Initial scan
    scanAllTables();

    // MutationObserver for dynamic tables, modals, and filter updates
    const observer = new MutationObserver((mutations) => {
      if (isUpdatingDOM) return;
      let shouldScan = false;
      for (const m of mutations) {
        if (
          m.target &&
          m.target.closest &&
          m.target.closest(".sgf-datatable-pagination")
        ) {
          continue;
        }
        if (m.type === "childList" || m.type === "characterData") {
          shouldScan = true;
          break;
        }
      }
      if (shouldScan) {
        scheduleScan();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return null;
}
