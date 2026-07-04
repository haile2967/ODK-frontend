import AccountsDashboard from "../pages/accounts/AccountsDashboard.js";
import UserManagementCard from "../pages/accounts/UserManagementCard.jsx";
import RoleManagementCard from "../pages/accounts/RoleManagementCard.jsx";
import ChangePasswordCard from "../pages/accounts/ChangePasswordCard.jsx";
import ResetPasswordCard from "../pages/accounts/ResetPasswordCard.jsx";
import AccountListCard from "../pages/accounts/AccountListCard.jsx";

// Keep old imports commented out if needed later for reference
/*
import PageAccessManagement from "../pages/accounts/PageRoleMapping.js";
import AdvancedAccessManagement from "../pages/accounts/AdvancedAccessManager.js";
import Roles from "../pages/accounts/Roles.js";
import RoleApiMap from "../pages/accounts/RoleApiMap.js";
import ChangeProfile from "../pages/accounts/ChangeProfile.js";
import AssignRolesToAccount from "../pages/accounts/AssignRolesToAccount.js";
import ListOfRolesPrevillages from "../pages/accounts/ListOfEndPoints.js";
import StaffUserProfile from "../pages/accounts/StaffUserProfile.js";
*/

export const accountsRoutes = [
  { path: "accounts-dashboard", element: <AccountsDashboard /> },
  { path: "accounts-dashboard/user-management", element: <UserManagementCard /> },
  { path: "accounts-dashboard/role-management", element: <RoleManagementCard /> },
  { path: "accounts-dashboard/change-password", element: <ChangePasswordCard /> },
  { path: "accounts-dashboard/reset-password", element: <ResetPasswordCard /> },
  { path: "accounts-dashboard/account-list", element: <AccountListCard /> },
  
  /*
  { path: "change-pprofile", element: <ChangeProfile /> },
  { path: "roles", element: <Roles /> },
  { path: "role-api-maps", element: <RoleApiMap /> },
  { path: "page-access-management", element: <PageAccessManagement /> },
  { path: "advanced-access-management", element: <AdvancedAccessManagement /> },
  { path: "assign-role-and-account", element: <AssignRolesToAccount /> },
  { path: "list-of-roles-previllages", element: <ListOfRolesPrevillages /> },
  { path: "profile", element: <StaffUserProfile /> },
  */
];
