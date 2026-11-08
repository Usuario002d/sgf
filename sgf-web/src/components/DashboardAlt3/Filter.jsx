import React, { useState } from "react";

const Filter = ({ onFilter, onChange }) => {
  const currentYear = Number(localStorage.getItem("selectedFiscalYear") || 2025);
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(String(currentYear));

  const months = [
    { value: "01", name: "Janeiro" },
    { value: "02", name: "Fevereiro" },
    { value: "03", name: "Março" },
    { value: "04", name: "Abril" },
    { value: "05", name: "Maio" },
    { value: "06", name: "Junho" },
    { value: "07", name: "Julho" },
    { value: "08", name: "Agosto" },
    { value: "09", name: "Setembro" },
    { value: "10", name: "Outubro" },
    { value: "11", name: "Novembro" },
    { value: "12", name: "Dezembro" },
  ];

  const baseYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(baseYear - i));

  const handleFilter = () => {
    if (onFilter) onFilter({ month, year });
    if (onChange) onChange({ month, year });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
          Mês:
        </span>
        <select
          className="form-select"
          style={{ width: "135px", minHeight: "36px", padding: "4px 10px" }}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
          Exercício:
        </span>
        <select
          className="form-select"
          style={{ width: "105px", minHeight: "36px", padding: "4px 10px" }}
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleFilter}
        style={{ minHeight: "36px", padding: "6px 14px" }}
      >
        Actualizar
      </button>
    </div>
  );
};

export default Filter;
