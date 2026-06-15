import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Afficher un indicateur pendant la vérification du state d'authentification
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Si l'utilisateur est connecté, on rend les composants enfants (Outlet)
  // Sinon, on le redirige vers la page de connexion
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

// AdminProtectedRoute: Route protégée pour les admins uniquement
export const AdminProtectedRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier si l'utilisateur est superadmin
  if (!user?.is_superadmin) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};
