import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Tooltip from "@material-ui/core/Tooltip";
import Menu from "@material-ui/icons/Menu";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import CalendarTodayOutlined from "@material-ui/icons/CalendarTodayOutlined";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import {
  getActiveFiscalYear,
  syncActiveFiscalYearWithBackend,
  fetchFiscalYearsOverview,
} from "../../services/accountService";


const sidebarWidth = 268;

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "fixed",
    top: 0,
    right: 0,
    background: "linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(244,249,246,0.95) 100%)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #d5e0da",
    boxShadow: "0 2px 8px 0 rgba(15, 41, 34, 0.04)",
    color: "#0f2922",
    zIndex: 1020,
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${sidebarWidth}px)`,
    },
  },
  toolbar: {
    minHeight: "52px",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      minHeight: "48px",
      padding: "0 12px",
    },
  },
  leftGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },
  menuButton: {
    color: "#0f2922",
    border: "1px solid #d5e0da",
    borderRadius: "8px",
    padding: "7px",
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  pageTitle: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    fontSize: "1.06rem",
    fontWeight: 800,
    color: "#0f2922",
    letterSpacing: "-0.015em",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dateSubtitle: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "0.76rem",
    color: "#5c746b",
    marginTop: "2px",
    textTransform: "capitalize",
  },
  rightGroup: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  currencyBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 12px",
    borderRadius: "9999px",
    backgroundColor: "#eaf5ef",
    border: "1px solid #b7dec9",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#0f5132",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  currencyDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#d97706",
  },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 6px 4px 12px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    border: "1px solid #d5e0da",
  },
  userText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    lineHeight: 1.2,
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  userName: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#0f2922",
  },
  userRole: {
    fontSize: "0.7rem",
    fontWeight: 600,
    color: "#b45309",
  },
  logoutButton: {
    backgroundColor: "#f4f8f6",
    border: "1px solid #d5e0da",
    borderRadius: "8px",
    padding: "7px",
    color: "#2d443d",
    transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: "#fff1f2",
      borderColor: "#fecdd3",
      color: "#be123c",
    },
  },
}));

export default function Header(props) {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();

  const currentCalendarYear = new Date().getFullYear();

  const [activeFiscalYear, setActiveFiscalYearState] = useState(2026);
  const [availableYears, setAvailableYears] = useState([2026]);

  useEffect(() => {
    fetchFiscalYearsOverview().then((list) => {
      setAvailableYears([2026]);
      setActiveFiscalYearState(2026);
    });

    const handleYearChanged = (e) => {
      if (e?.detail?.year) {
        setActiveFiscalYearState(Number(e.detail.year));
      }
    };
    window.addEventListener("sgf-fiscal-year-changed", handleYearChanged);
    return () => window.removeEventListener("sgf-fiscal-year-changed", handleYearChanged);
  }, []);

  const handleYearSelectChange = async (e) => {
    const newYear = Number(e.target.value);
    setActiveFiscalYearState(newYear);
    try {
      await syncActiveFiscalYearWithBackend(newYear);
      window.location.reload();
    } catch (err) {
      console.error("Erro ao mudar ano fiscal:", err);
    }
  };

  let savedUserData = props.userData;
  if (!savedUserData) {
    try {
      savedUserData = JSON.parse(localStorage.getItem("userData"));
    } catch (e) {
      savedUserData = null;
    }
  }

  const getActiveRouteTitle = () => {
    const routes = props.routes || [];
    for (const route of routes) {
      if (route.path && location.pathname === (route.layout || "/admin") + route.path) {
        return route.name;
      }
      if (route.items) {
        for (const sub of route.items) {
          if (location.pathname === sub.layout + sub.path) {
            return `${route.name} • ${sub.name}`;
          }
        }
      }
    }
    return "Sistema de Gestão Financeira";
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString("pt-PT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleName = (profileId) => {
    switch (Number(profileId)) {
      case 1:
        return "Adido Financeiro";
      case 2:
        return "Chefe da Missão";
      case 3:
        return "Assistente Financeiro";
      case 4:
        return "Embaixador";
      default:
        return savedUserData?.role || "Administrador";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.setItem("authToken", "");
    window.location.href = "/login";
  };

  return (
    <AppBar className={classes.appBar} elevation={0}>
      <Toolbar className={classes.toolbar}>
        <div className={classes.leftGroup}>
          <Hidden mdUp implementation="css">
            <IconButton
              aria-label="Abrir menu"
              onClick={props.handleDrawerToggle}
              className={classes.menuButton}
              size="small"
            >
              <Menu fontSize="small" />
            </IconButton>
          </Hidden>

          <div className={classes.titleGroup}>
            <span className={classes.pageTitle}>{getActiveRouteTitle()}</span>
            <span className={classes.dateSubtitle}>
              <CalendarTodayOutlined style={{ fontSize: 12, color: "#0f5132" }} />
              {getCurrentDate()}
            </span>
          </div>
        </div>

        <div className={classes.rightGroup}>
          {/* BADGE INTERATIVO DO EXERCÍCIO ECONÓMICO */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 8px 3px 10px",
              borderRadius: "8px",
              backgroundColor: "#f4f8f6",
              border: "1.5px solid #b7dec9",
            }}
          >
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f5132", textTransform: "uppercase" }}>
              Exercício:
            </span>
            <select
              value={activeFiscalYear}
              onChange={handleYearSelectChange}
              style={{
                border: "none",
                backgroundColor: "transparent",
                fontWeight: 800,
                fontSize: "0.82rem",
                color: "#0f2922",
                cursor: "pointer",
                outline: "none",
                padding: "2px 4px",
              }}
              title="Mudar Exercício Económico em execução"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <Tooltip title="Gestão de Exercício Económico & Transição" arrow>
              <IconButton
                size="small"
                onClick={() => history.push("/admin/fiscalYearManagement")}
                style={{ padding: "4px", color: "#0f5132" }}
              >
                <SwapHorizIcon style={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </div>

          <div className={classes.currencyBadge}>
            <span className={classes.currencyDot} />
            Moeda Base: MZN
          </div>

          <div className={classes.userPill}>
            <div className={classes.userText}>
              <span className={classes.userName}>
                {savedUserData?.fullName || "Utilizador"}
              </span>
              <span className={classes.userRole}>
                {getRoleName(savedUserData?.accessProfileId)}
              </span>
            </div>

            <Tooltip title="Terminar Sessão" arrow>
              <IconButton
                onClick={handleLogout}
                className={classes.logoutButton}
                size="small"
              >
                <ExitToAppIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  handleDrawerToggle: PropTypes.func,
  routes: PropTypes.arrayOf(PropTypes.object),
  userData: PropTypes.object,
};
