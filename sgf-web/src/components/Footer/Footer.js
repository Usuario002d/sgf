import React from "react";

export default function Footer() {
  return (
    <footer
      className="sgf-fixed-footer"
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        left: "268px",
        padding: "4px 18px",
        minHeight: "28px",
        borderTop: "1px solid #cbd9d1",
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 -2px 8px rgba(15, 41, 30, 0.05)",
        zIndex: 1015,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          fontSize: "11px",
          color: "#475569",
          lineHeight: 1.2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#0f5132",
              display: "inline-block",
            }}
          />
          <span style={{ fontWeight: 700, color: "#0f291e" }}>
            SGF — Sistema Integrado de Gestão Financeira e Orçamental
          </span>
          <span style={{ color: "#94a3b8" }}>|</span>
          <span style={{ color: "#64748b", fontWeight: 600 }}>v2.4 Enterprise</span>
        </div>
        <div style={{ fontWeight: 600, color: "#64748b" }}>
          &copy; {1900 + new Date().getYear()}{" "}
          <a
            href="#sgf"
            onClick={(e) => e.preventDefault()}
            style={{
              color: "#0f5132",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Administração Financeira
          </a>{" "}
          — Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
