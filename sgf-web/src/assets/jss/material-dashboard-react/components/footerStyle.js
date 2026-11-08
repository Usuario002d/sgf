import {
  defaultFont,
  container,
  primaryColor,
  grayColor,
} from "assets/jss/material-dashboard-react.js";

const footerStyle = {
  block: {
    color: "inherit",
    padding: "15px",
    textTransform: "uppercase",
    borderRadius: "3px",
    textDecoration: "none",
    position: "relative",
    display: "block",
    ...defaultFont,
    fontWeight: "500",
    fontSize: "12px",
  },
  left: {
    float: "left!important",
    display: "block",
  },
  right: {
    padding: "15px 0",
    margin: "0",
    fontSize: "14px",
    float: "right!important",
  },
  footer: {
    position: "fixed",
    bottom: "0",
    width: "100%",
    borderTop: "1px solid #444", // cor da borda discreta
    padding: "8px 0",            // altura reduzida
    backgroundColor: "#000",     // fundo preto
    color: "#fff",               // texto branco
    textAlign: "center",         // centraliza o texto
    ...defaultFont,
    zIndex: "999",
  },
  
  container,
  a: {
    color: primaryColor,
    textDecoration: "none",
    backgroundColor: "transparent",
  },
  list: {
    marginBottom: "0",
    padding: "0",
    marginTop: "0",
  },
  inlineBlock: {
    display: "inline-block",
    padding: "0px",
    width: "auto",
  },
};
export default footerStyle;
