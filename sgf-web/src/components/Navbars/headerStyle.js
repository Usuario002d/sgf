import {
  container,
  defaultFont,
  primaryColor,
  defaultBoxShadow,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  whiteColor,
} 

    from "assets/jss/material-dashboard-react.js";
const headerStyle = () => ({
  appBar: {
    // background: "linear-gradient(60deg, #66bb6a, #000)",
    background: "#f1a20e",
    boxShadow: "none",
    borderBottom: "0",
    marginBottom: "0",
    position: "absolute",
    width: "100%",
    paddingTop: "0px", // Diminui o espaçamento superior
    zIndex: "1029",
    color: whiteColor[7],
    border: "0",
    borderRadius: "3px",
    padding: "0 px 0", // Reduz o padding geral
    transition: "all 150ms ease 0s",
    minHeight: "20px", // Reduz a altura mínima
    display: "block",
    
  },
  container: {
    ...container,
    minHeight: "30px", // Ajusta a altura mínima do container
  },
  flex: {
    flex: 1,
  },
  title: {
    ...defaultFont,
    letterSpacing: "unset",
    lineHeight: "30px",
    fontSize: "20px",
    borderRadius: "3px",
    textTransform: "none",
    color: "inherit",
    margin: "0",
    "&:hover,&:focus": {
      background: "transparent",
    },
  },
  appResponsive: {
    top: "8px",
  },
  primary: {
    backgroundColor: primaryColor[0],
    color: whiteColor,
    ...defaultBoxShadow,
  },
  info: {
    backgroundColor: infoColor[0],
    color: whiteColor,
    ...defaultBoxShadow,
  },
  success: {
    backgroundColor: successColor[0],
    color: whiteColor,
    ...defaultBoxShadow,
  },
  warning: {
    backgroundColor: warningColor[0],
    color: whiteColor,
    ...defaultBoxShadow,
  },
  danger: {
    backgroundColor: dangerColor[0],
    color: whiteColor,
    ...defaultBoxShadow,
  },
});

export default headerStyle;
