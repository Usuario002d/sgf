const sidebarWidth = 268;

const appStyle = (theme) => ({
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#eef3f0",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#0f2922",
  },
  mainPanel: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#eef3f0",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${sidebarWidth}px)`,
      marginLeft: `${sidebarWidth}px`,
    },
  },
  content: {
    flex: "1 0 auto",
    marginTop: "54px",
    padding: "8px 14px 36px 14px",
    width: "100%",
    maxWidth: "1760px",
    marginLeft: "auto",
    marginRight: "auto",
    boxSizing: "border-box",
    [theme.breakpoints.down("sm")]: {
      padding: "8px 8px 34px 8px",
      marginTop: "50px",
    },
  },
});

export default appStyle;
