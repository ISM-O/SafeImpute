import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Users, Calendar, Pulse, Shield } from "@phosphor-icons/react";
import AdminLayout from "../layout/AdminLayout";
// import adminService from "../services/adminService"; // Désactivé pour le mock

const StatCard = ({ icon: Icon, title, value, color }) => (
  <Card sx={{ borderRadius: 2 }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            backgroundColor: `${color}20`,
          }}
        >
          <Icon size={32} color={color} weight="fill" />
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []); // Le tableau vide garantit un seul appel au montage

  const loadStatistics = async () => {
    try {
      // --- DÉBUT DU MOCK ---
      const mockData = await new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              total_users: 142,
              total_admins: 3,
              active_today: 24,
              total_consultations: 89,
            }),
          500, // Simule 500ms de chargement réseau
        ),
      );
      setStats(mockData);
      // --- FIN DU MOCK ---

      // Quand le backend sera prêt, décommente ceci :
      // const data = await adminService.getStatistics();
      // setStats(data);
    } catch (err) {
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {stats && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={Users}
                title="Total Utilisateurs"
                value={stats.total_users || 0}
                color="#0F172A"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={Shield}
                title="Admins"
                value={stats.total_admins || 0}
                color="#12B589"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={Pulse}
                title="Connectés Aujourd'hui"
                value={stats.active_today || 0}
                color="#F59E0B"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={Calendar}
                title="Consultations"
                value={stats.total_consultations || 0}
                color="#EF4444"
              />
            </Grid>
          </Grid>
        )}

        <Card sx={{ mt: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Activité Récente
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Les dernières activités apparaîtront ici...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
