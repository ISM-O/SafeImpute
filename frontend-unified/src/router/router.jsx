import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ProtectedRoute, { AdminProtectedRoute } from "./ProtectedRoute.jsx";
import SidebarLayout from "../layout/SidebarLayout.jsx";
import RoleBasedRedirect from "./RoleBasedRedirect.jsx";

import OverviewPage from "../pages/OverviewPage.jsx";
import PatientsPage from "../pages/PatientsPage.jsx";
import ImputationPage from "../pages/ImputationPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import CompareMethodsPage from "../pages/CompareMethodsPage.jsx";
import PrivacyReportPage from "../pages/PrivacyReportPage.jsx";
import UsersManagement from "../pages/UsersManagement.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RoleBasedRedirect />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <SidebarLayout />,
        children: [
          {
            path: "/overview",
            element: <OverviewPage />,
          },
          {
            path: "/patients",
            element: <PatientsPage />,
          },
          {
            path: "/imputation",
            element: <ImputationPage />,
          },
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/compare-methods",
            element: <CompareMethodsPage />,
          },
          {
            path: "/privacy-report",
            element: <PrivacyReportPage />,
          },
          {
            path: "/access-users",
            element: (
              <AdminProtectedRoute>
                <UsersManagement />
              </AdminProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
