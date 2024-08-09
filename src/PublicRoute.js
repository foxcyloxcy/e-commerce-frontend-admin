/* eslint-disable react/prop-types */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PublicRoute = ({ isLoggedIn, children }) => {
    const location = useLocation();
    
    if (isLoggedIn) {
      return <Navigate to={location.pathname} />; // Redirect to home or any protected route
    }
    return children;
  };
  
  export default PublicRoute;
  