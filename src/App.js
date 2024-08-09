import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import SoftBox from "components/SoftBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import routes from "routes";
import { useSoftUIController, setMiniSidenav, setOpenConfigurator } from "context";
import brand from "assets/images/reloved_icon.png";
import ProtectedRoute from "ProtectedRoute";
import PublicRoute from "PublicRoute"; // Import the PublicRoute component

export default function App() {
  const [controller, dispatch] = useSoftUIController();
  const { miniSidenav, direction, layout, openConfigurator, sidenavColor } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState("");
  const [userToken, setUserToken] = useState("");
  
  const storedIsLoggedIn = localStorage.getItem(`isLoggedIn`);
  const storedUserData = localStorage.getItem(`userData`);
  const storedUserToken = localStorage.getItem(`userToken`);

  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleClick = async () => {
    if (storedIsLoggedIn) {
      setIsLoggedIn(storedIsLoggedIn === "true");
    }
    if (storedUserData) {
      setUserData(storedUserData);
    }
    if (storedUserToken) {
      setUserToken(storedUserToken);
    }
  };

  const handleClickLogout = async () => {
    localStorage.removeItem(`userData`);
    localStorage.removeItem(`userToken`);
    localStorage.removeItem(`isLoggedIn`);

    setIsLoggedIn(false);
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);

    if (storedIsLoggedIn) {
      setIsLoggedIn(storedIsLoggedIn === "true");
    }
    if (storedUserData) {
      setUserData(storedUserData);
    }
    if (storedUserToken) {
      setUserToken(storedUserToken);
    }

  }, [direction, handleClick]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return (
          <Route
            exact
            path={route.route}
            element={
              isLoggedIn ? (
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <route.component 
                    isLoggedIn={isLoggedIn} 
                    userData={userData} 
                    userToken={userToken} 
                    refreshParent={handleClick} 
                    refreshParentLogout={handleClickLogout} 
                  />
                </ProtectedRoute>
              ) : (
                <PublicRoute isLoggedIn={isLoggedIn}>
                  <route.component 
                    isLoggedIn={isLoggedIn} 
                    userData={userData} 
                    userToken={userToken} 
                    refreshParent={handleClick} 
                    refreshParentLogout={handleClickLogout} 
                  />
                </PublicRoute>
              )
            }
            key={route.key}
          />
        );
      }

      return null;
    });

  const configsButton = (
    <SoftBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.5rem"
      height="3.5rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="default" color="inherit">
        settings
      </Icon>
    </SoftBox>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={brand}
              brandName="Reloved"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(routes)}
          <Route
            path="*"
            element={<Navigate to="/authentication/sign-in" />}
          />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={brand}
            brandName="Reloved"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        <Route
          path="*"
          element={<Navigate to="/authentication/sign-in" />}
        />
      </Routes>
    </ThemeProvider>
  );
}
