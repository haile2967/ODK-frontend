import AccountsDashboard from "../pages/accounts/AccountsDashboard.js";
/*
import PageAccessManagement from "../pages/accounts/PageRoleMapping.js";
import AdvancedAccessManagement from "../pages/accounts/AdvancedAccessManager.js";

import Roles from "../pages/accounts/Roles.js";
import RoleApiMap from "../pages/accounts/RoleApiMap.js";
import AccountList from "../pages/accounts/AccountList.js";

import ChangePassword from "../pages/accounts/ChangePassword.js";
import ChangeProfile from "../pages/accounts/ChangeProfile.js";

import AssignRolesToAccount from "../pages/accounts/AssignRolesToAccount.js";
import ListOfRolesPrevillages from "../pages/accounts/ListOfEndPoints.js";
import StaffUserProfile from "../pages/accounts/StaffUserProfile.js";
import UserManagementPage from "../pages/accounts/UserManagementPage.js";
*/
export const accountsRoutes = [
  { path: "accounts-dashboard", element: <AccountsDashboard /> },
  /*
  { path: "change-pprofile", element: <ChangeProfile /> },
  { path: "roles", element: <Roles /> },
  { path: "role-api-maps", element: <RoleApiMap /> },
  { path: "account-list", element: <AccountList /> },
  { path: "page-access-management", element: <PageAccessManagement /> },
  { path: "advanced-access-management", element: <AdvancedAccessManagement /> },

  { path: "user-management", element: <UserManagementPage /> },
  { path: "change-password", element: <ChangePassword /> },
  { path: "assign-role-and-account", element: <AssignRolesToAccount /> },
  { path: "list-of-roles-previllages", element: <ListOfRolesPrevillages /> },
  { path: "profile", element: <StaffUserProfile /> },
   */
];
