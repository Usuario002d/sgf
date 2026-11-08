import React, { useEffect, useState } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footer/Footer.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import SgfAutoTablePaginator from "components/Pagination/SgfAutoTablePaginator.js";

import routes, { filterRoutes } from "routes.js";
import styles from "./adminStyle.js";
import logo from "assets/img/brasao.png";

const useStyles = makeStyles(styles);

export default function Admin({ ...rest }) {
  const classes = useStyles();
  const mainPanel = React.createRef();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getSavedUser = () => {
    try {
      return JSON.parse(localStorage.getItem("userData")) || null;
    } catch (e) {
      return null;
    }
  };

  const [userData] = useState(getSavedUser);
  const filteredRoutes = filterRoutes(routes, userData);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const resizeFunction = () => {
    if (window.innerWidth >= 960) {
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    // Restore 100% native browser zoom and natural responsive scrolling
    document.body.style.zoom = "100%";
    document.body.style.overflow = "auto";
    document.body.style.backgroundColor = "#eef3f0";

    // Ensure browser tab favicon uses the main emblem icon (brasao.png)
    const setFavicon = () => {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.type = "image/png";
      link.href = logo;
    };
    setFavicon();

    window.addEventListener("resize", resizeFunction);
    return function cleanup() {
      window.removeEventListener("resize", resizeFunction);
    };
  }, []);

  const getMenuItems = () => {
    const menuItems = [];
    filterRoutes(routes, userData).forEach((menu) => {
      if (menu.items) {
        menu.items.forEach((menuItem) => {
          menuItems.push(menuItem);
        });
      } else {
        menuItems.push(menu);
      }
    });
    return menuItems;
  };

  const switchRoutes = (
    <Switch>
      {getMenuItems().map((menuItem, key) => {
        if (menuItem.layout === "/admin") {
          return (
            <Route
              path={menuItem.layout + menuItem.path}
              component={menuItem.component}
              key={key}
            />
          );
        }
        return null;
      })}
      <Redirect from="/admin" to="/admin/dashboard" />
    </Switch>
  );

  return (
    <div className={classes.wrapper}>
      <Sidebar
        routes={filteredRoutes}
        logoText={"SGF"}
        logo={logo}
        handleDrawerToggle={handleDrawerToggle}
        open={mobileOpen}
        userData={userData}
        {...rest}
      />
      <div className={classes.mainPanel} ref={mainPanel}>
        <Navbar
          routes={filteredRoutes}
          handleDrawerToggle={handleDrawerToggle}
          userData={userData}
          {...rest}
        />
        <main className={classes.content}>
          <div>{switchRoutes}</div>
        </main>
        <SgfAutoTablePaginator />
        <Footer />
      </div>
    </div>
  );
}
