/* eslint-disable react/prop-types */
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isLoggedIn, children }) => {

  if (!isLoggedIn) {
    return <Navigate to="/authentication/sign-in" />;
  }

  return children;
};

export default ProtectedRoute;
