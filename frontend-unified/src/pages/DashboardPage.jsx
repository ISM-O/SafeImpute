import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import { Heart, ArrowRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickLinks = [
    {
      title: "Mes Consultations",
      description: "Voir l'historique de vos consultations",
      icon: "📋",
      path: "/consultations",
    },
    {
      title: "Résultats",
      description: "Consulter vos derniers résultats",
      icon: "📊",
      path: "/results",
    },
    {
      title: "Paramètres",
      description: "Gérer votre profil et préférences",
      icon: "⚙️",
      path: "/settings",
    },
  ];

  return (
    <Box>
      {/* Welcome Card */}
      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #12B589 0%, #0A7D5A 100%)",
          color: "white",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Heart size={40} weight="fill" />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Bienvenue, {user?.nom_complet}!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Accédez à votre portail de santé
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Accès Rapide
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickLinks.map((link) => (
          <Grid item xs={12} sm={6} md={4} key={link.path}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(18, 181, 137, 0.15)",
                },
                borderRadius: 2,
              }}
              onClick={() => navigate(link.path)}
            >
              <CardContent>
                <Box sx={{ fontSize: "2rem", mb: 1 }}>{link.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {link.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  {link.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "#12B589",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Accéder
                  </Typography>
                  <ArrowRight size={16} style={{ marginLeft: 4 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stats */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Statistiques
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#12B589" }}
              >
                5
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Consultations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#12B589" }}
              >
                12
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Résultats
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#12B589" }}
              >
                100%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Face ID Enrôlé
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#12B589" }}
              >
                ✓
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Dossier Complet
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
