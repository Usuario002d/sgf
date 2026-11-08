import React from "react";
import { Route, Redirect } from "react-router-dom";

const PrivateRoute = ({ component: Component, requiredPermission, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const rawUser = localStorage.getItem("userData") || localStorage.getItem("user") || "{}";
  let user = {};
  try {
    user = JSON.parse(rawUser) || {};
  } catch (e) {
    user = {};
  }

  const hasPermission = () => {
    if (!requiredPermission) return true;
    if (user?.isAdmin) return true;
    return user?.permissions?.[requiredPermission] === true;
  };

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }

        if (!hasPermission()) {
          return <Redirect to="/admin/dashboard" />;
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;
