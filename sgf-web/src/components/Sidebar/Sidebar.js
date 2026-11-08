import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Icon from "@material-ui/core/Icon";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const sidebarWidth = 268;

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: sidebarWidth,
    backgroundColor: "#ffffff",
    borderRight: "1px solid #d5e0da",
    boxShadow: "2px 0 12px rgba(15, 41, 34, 0.03)",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflowX: "hidden",
    zIndex: 1030,
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderBottom: "1px solid #e2ebe6",
    background: "linear-gradient(135deg, #f2f8f5 0%, #ffffff 70%, #fefaf0 100%)",
  },
  brandLogoBox: {
    width: "58px",
    height: "58px",
    borderRadius: "13px",
    backgroundColor: "#ffffff",
    border: "1.5px solid #e5c687",
    boxShadow: "0 3px 10px rgba(180, 83, 9, 0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px",
    flexShrink: 0,
  },
  brandLogoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transform: "scale(1.08)",
  },
  brandTextGroup: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  brandTitle: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    fontSize: "15px",
    fontWeight: 800,
    color: "#0f2922",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  brandSubtitle: {
    fontSize: "11.5px",
    fontWeight: 600,
    color: "#0f5132",
    marginTop: "2px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  userCard: {
    margin: "14px 14px 8px 14px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #f3f9f5 0%, #fdfaf3 100%)",
    border: "1px solid #d5e4dc",
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #0f5132 0%, #156d45 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "13px",
    flexShrink: 0,
    letterSpacing: "0.02em",
    boxShadow: "0 2px 6px rgba(15, 81, 50, 0.2)",
  },
  userMeta: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    flex: 1,
  },
  userName: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#0f2922",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.25,
  },
  userRoleBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 700,
    color: "#b45309",
    marginTop: "2px",
  },
  userEmail: {
    fontSize: "11px",
    color: "#5c746b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: "1px",
  },
  navSectionLabel: {
    padding: "12px 22px 6px 22px",
    fontSize: "10.5px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#6c857b",
  },
  navScrollContainer: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "4px 12px 20px 12px",
  },
  parentMenuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "10px",
    padding: "9px 12px",
    marginBottom: "3px",
    color: "#2d443d",
    fontWeight: 600,
    fontSize: "13.2px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    userSelect: "none",
    "&:hover": {
      backgroundColor: "#f0f7f3",
      color: "#0f2922",
    },
  },
  parentMenuItemActive: {
    backgroundColor: "#e8f5ee",
    color: "#0f5132",
    fontWeight: 700,
    borderLeft: "3px solid #0f5132",
    "&:hover": {
      backgroundColor: "#dcf0e5",
      color: "#0f5132",
    },
  },
  menuLeftGroup: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: 0,
    flex: 1,
  },
  menuIcon: {
    fontSize: "19px",
    color: "#5c746b",
    flexShrink: 0,
    transition: "color 0.15s ease",
  },
  menuIconActive: {
    color: "#0f5132",
  },
  menuLabel: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.3,
  },
  chevronIcon: {
    fontSize: "18px",
    color: "#6c857b",
    flexShrink: 0,
  },
  subMenuList: {
    padding: "2px 0 6px 14px",
    marginLeft: "14px",
    borderLeft: "1.5px solid #cfe0d7",
  },
  subMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    borderRadius: "8px",
    padding: "7px 11px",
    marginBottom: "2px",
    color: "#3f5950",
    fontWeight: 500,
    fontSize: "12.8px",
    transition: "all 0.15s ease",
    "&:hover": {
      backgroundColor: "#f2f8f5",
      color: "#0f2922",
    },
  },
  subMenuItemActive: {
    backgroundColor: "#fef6e4",
    color: "#92400e",
    fontWeight: 700,
    "&:hover": {
      backgroundColor: "#fdecc8",
      color: "#92400e",
    },
  },
  subMenuDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: "#b8c9bf",
    flexShrink: 0,
  },
  subMenuDotActive: {
    backgroundColor: "#d97706",
    width: "6px",
    height: "6px",
  },
  sidebarFooter: {
    padding: "12px 16px",
    borderTop: "1px solid #e2ebe6",
    backgroundColor: "#f7faf8",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#5c746b",
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#059669",
    display: "inline-block",
    marginRight: "6px",
  },
}));

export default function Sidebar(props) {
  const classes = useStyles();
  const { logo, routes = [], userData, open, handleDrawerToggle } = props;
  const history = useHistory();
  const location = useLocation();
  const [menus, setMenus] = useState(routes);

  useEffect(() => {
    setMenus((prev) =>
      routes.map((route) => {
        const hasActiveChild =
          route.items &&
          route.items.some((item) => location.pathname === item.layout + item.path);
        const existing = prev.find((p) => p.id === route.id);
        return {
          ...route,
          open: hasActiveChild ? true : existing ? existing.open : false,
        };
      })
    );
  }, [routes, location.pathname]);

  const activeRoute = (routeName) => location.pathname === routeName;

  const isParentActive = (menu) => {
    if (!menu.items) {
      return activeRoute((menu.layout || "/admin") + menu.path);
    }
    return menu.items.some((item) => activeRoute(item.layout + item.path));
  };

  const handleToggle = (menu, key) => {
    if (!menu.items) {
      history.push((menu.layout || "/admin") + menu.path);
      if (open && handleDrawerToggle) {
        handleDrawerToggle();
      }
      return;
    }

    setMenus((prevMenus) =>
      prevMenus.map((item, index) => ({
        ...item,
        open: index === key ? !item.open : false,
      }))
    );
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
        return "Administrador Geral";
    }
  };

  const getInitials = (name) => {
    if (!name) return "SG";
    const parts = String(name).trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderIcon = (iconProp, isActive) => {
    if (!iconProp) return null;
    if (typeof iconProp === "string") {
      return (
        <Icon className={`${classes.menuIcon} ${isActive ? classes.menuIconActive : ""}`}>
          {iconProp}
        </Icon>
      );
    }
    return React.createElement(iconProp, {
      className: `${classes.menuIcon} ${isActive ? classes.menuIconActive : ""}`,
    });
  };

  const renderSubItems = (items) => (
    <List disablePadding className={classes.subMenuList}>
      {items
        .filter((item) => item.visibility !== false)
        .map((prop, key) => {
          const fullPath = prop.layout + prop.path;
          const isActive = activeRoute(fullPath);
          return (
            <NavLink
              to={fullPath}
              key={key}
              onClick={() => {
                if (open && handleDrawerToggle) handleDrawerToggle();
              }}
            >
              <ListItem
                button
                disableRipple
                className={`${classes.subMenuItem} ${
                  isActive ? classes.subMenuItemActive : ""
                }`}
              >
                <span
                  className={`${classes.subMenuDot} ${
                    isActive ? classes.subMenuDotActive : ""
                  }`}
                />
                <span className={classes.menuLabel}>{prop.name}</span>
              </ListItem>
            </NavLink>
          );
        })}
    </List>
  );

  const drawerContent = (
    <>
      <div className={classes.brandHeader}>
        {logo && (
          <div className={classes.brandLogoBox}>
            <img src={logo} alt="Emblema" className={classes.brandLogoImg} />
          </div>
        )}
        <div className={classes.brandTextGroup}>
          <span className={classes.brandTitle}>SGF Institucional</span>
          <span className={classes.brandSubtitle}>Gestão Financeira & Orçamental</span>
        </div>
      </div>

      {userData && (
        <div className={classes.userCard}>
          <div className={classes.userAvatar}>{getInitials(userData.fullName)}</div>
          <div className={classes.userMeta}>
            <span className={classes.userName}>
              {userData.fullName || "Utilizador SGF"}
            </span>
            <span className={classes.userRoleBadge}>
              {getRoleName(userData.accessProfileId)}
            </span>
            {userData.email && (
              <span className={classes.userEmail}>{userData.email}</span>
            )}
          </div>
        </div>
      )}

      <div className={classes.navSectionLabel}>Navegação Principal</div>

      <div className={classes.navScrollContainer}>
        <List disablePadding>
          {menus.map((menu, key) => {
            const parentActive = isParentActive(menu);
            return (
              <React.Fragment key={menu.id || key}>
                <ListItem
                  button
                  disableRipple
                  onClick={() => handleToggle(menu, key)}
                  className={`${classes.parentMenuItem} ${
                    parentActive ? classes.parentMenuItemActive : ""
                  }`}
                >
                  <div className={classes.menuLeftGroup}>
                    {renderIcon(menu.icon, parentActive)}
                    <span className={classes.menuLabel}>{menu.name}</span>
                  </div>
                  {menu.items &&
                    (menu.open ? (
                      <ExpandMoreIcon className={classes.chevronIcon} />
                    ) : (
                      <ChevronRightIcon className={classes.chevronIcon} />
                    ))}
                </ListItem>
                {menu.items && menu.open ? renderSubItems(menu.items) : null}
              </React.Fragment>
            );
          })}
        </List>
      </div>

      <div className={classes.sidebarFooter}>
        <span>
          <span className={classes.statusDot} />
          Sistema Operacional
        </span>
        <span style={{ fontWeight: 700, color: "#0f5132" }}>v2.5</span>
      </div>
    </>
  );

  return (
    <nav aria-label="Menu lateral">
      <Hidden mdUp implementation="css">
        <Drawer
          variant="temporary"
          anchor="left"
          open={Boolean(open)}
          onClose={handleDrawerToggle}
          classes={{ paper: classes.drawerPaper }}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContent}
        </Drawer>
      </Hidden>

      <Hidden smDown implementation="css">
        <Drawer
          anchor="left"
          variant="permanent"
          open
          classes={{ paper: classes.drawerPaper }}
        >
          {drawerContent}
        </Drawer>
      </Hidden>
    </nav>
  );
}

Sidebar.propTypes = {
  handleDrawerToggle: PropTypes.func,
  logo: PropTypes.string,
  image: PropTypes.string,
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool,
  userData: PropTypes.object,
};
