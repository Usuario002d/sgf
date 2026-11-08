import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";

// Import layouts
import Admin from "./layouts/Admin.js";
import LoginPage from "./layouts/Login.js";
import AccountsPlanPage from "views/PlanAndBudget/AccountsPlan/Index.js";

import "assets/css/material-dashboard-react.css?v=1.10.0";
import "assets/css/sgf-modern-theme.css";

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route path="/admin" component={Admin} />
        <Route path="/planandbudget/select" component={AccountsPlanPage} />
        <Route path="/" component={LoginPage} />
        <Redirect from="*" to="/" />
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
