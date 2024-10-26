// Soft UI Dashboard React layouts
import Dashboard from "layouts/dashboard";
import ItemsManagementTable from "layouts/ItemsManagementTable";
import ItemsApprovalTable from "layouts/ItemsApprovalTable"
import GenerateDiscountCodes from "layouts/GenerateDiscountCodes";
import Billing from "layouts/billing";
// import VirtualReality from "layouts/virtual-reality";
import RTL from "layouts/rtl";
import Profile from "layouts/profile";
// import Billing from "layouts/billing";
// import VirtualReality from "layouts/virtual-reality";
// import RTL from "layouts/rtl";
import SignIn from "layouts/authentication/sign-in";
// import SignUp from "layouts/authentication/sign-up";


// Soft UI Dashboard React icons
import Shop from "examples/Icons/Shop";
import Office from "examples/Icons/Office";
import Settings from "examples/Icons/Settings";
import Document from "examples/Icons/Document";
// import SpaceShip from "examples/Icons/SpaceShip";
import CustomerSupport from "examples/Icons/CustomerSupport";
// import Settings from "examples/Icons/Settings";
// import Document from "examples/Icons/Document";
// import SpaceShip from "examples/Icons/SpaceShip";
import CreditCard from "examples/Icons/CreditCard";
// import Cube from "examples/Icons/Cube";

const routes = [
  { type: "title", title: "Control Panel", key: "control-panel" },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    component: Dashboard,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Discount Codes",
    key: "generate-discount",
    route: "/generate-discount",
    component: GenerateDiscountCodes,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Items management",
    key: "items-management",
    route: "/items-management",
    component: ItemsManagementTable,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Items for approval",
    key: "items-approval",
    route: "/items-approval",
    component: ItemsApprovalTable,
    noCollapse: true,
  },
  { type: "title", title: "Account Pages", key: "account-pages" },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    route: "/profile",
    component: Profile,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: SignIn,
    noCollapse: true,
  },
  // {
  //   type: "collapse",
  //   name: "Billing",
  //   key: "billing",
  //   route: "/billing",
  //   icon: <CreditCard size="12px" />,
  //   component: <Billing />,
  //   noCollapse: true,
  // },
  // {
  //   type: "collapse",
  //   name: "Virtual Reality",
  //   key: "virtual-reality",
  //   route: "/virtual-reality",
  //   icon: <Cube size="12px" />,
  //   component: <VirtualReality />,
  //   noCollapse: true,
  // },
  // {
  //   type: "collapse",
  //   name: "RTL",
  //   key: "rtl",
  //   route: "/rtl",
  //   icon: <Settings size="12px" />,
  //   component: <RTL />,
  //   noCollapse: true,
  // },
  // {
  //   type: "collapse",
  //   name: "Sign Up",
  //   key: "sign-up",
  //   route: "/authentication/sign-up",
  //   icon: <SpaceShip size="12px" />,
  //   component: <SignUp />,
  //   noCollapse: true,
  // },
];

export default routes;
