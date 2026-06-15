import { Box, Container, Button } from "@mui/material";
import { Heart, SignOut } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import authService from "../services/authService";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
      <Container>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Heart size={32} color="#12B589" weight="fill" />
            <Box
              component="h1"
              sx={{ fontSize: "1.5rem", fontWeight: 700, m: 0 }}
            >
              Northwind Health
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<SignOut size={20} />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </Box>

        {/* Welcome Message */}
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 4,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Box
            component="h2"
            sx={{ fontSize: "1.75rem", fontWeight: 700, mb: 2, m: 0 }}
          >
            Welcome, {user?.nom_complet || "User"}!
          </Box>
          <Box component="p" sx={{ color: "#64748B", mb: 0 }}>
            You have successfully logged in to Northwind Health.
          </Box>
          <Box
            component="p"
            sx={{ color: "#94A3B8", fontSize: "0.875rem", mb: 0 }}
          >
            Email: {user?.mail}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
