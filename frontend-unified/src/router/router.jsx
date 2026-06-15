import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import ConsultationHistoryPage from "../pages/ConsultationHistoryPage.jsx";
import ResultsPage from "../pages/ResultsPage.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";
import UserLayout from "../layout/UserLayout.jsx";
import ProtectedRoute, { AdminProtectedRoute } from "./ProtectedRoute.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import UsersManagement from "../pages/UsersManagement.jsx";
import AuditLogs from "../pages/AuditLogs.jsx";
import RoleBasedRedirect from "./RoleBasedRedirect.jsx";

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
        element: <UserLayout />,
        children: [
          {
            path: "/home",
            element: <DashboardPage />,
          },
          {
            path: "/consultations",
            element: <ConsultationHistoryPage />,
          },
          {
            path: "/results",
            element: <ResultsPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        path: "/admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/admin/users",
        element: <UsersManagement />,
      },
      {
        path: "/admin/audit-logs",
        element: <AuditLogs />,
      },
    ],
  },
  {
    path: "*",
    element: <LoginPage />,
  },
]);

export default router;
