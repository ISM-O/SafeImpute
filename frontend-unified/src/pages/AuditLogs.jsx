import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CircularProgress,
  Alert,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { format } from "date-fns";
import AdminLayout from "../layout/AdminLayout";
// import adminService from "../services/adminService";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterEmail, setFilterEmail] = useState("");

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      // --- DÉBUT DU MOCK ---
      const mockLogs = [
        {
          id: 1,
          email: "admin@northwind.com",
          action: "Connexion Face ID",
          timestamp: new Date().toISOString(),
          ip_address: "192.168.1.10",
          status: "success",
        },
        {
          id: 2,
          email: "docteur@northwind.com",
          action: "Création dossier patient",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ip_address: "192.168.1.15",
          status: "success",
        },
        {
          id: 3,
          email: "inconnu@test.com",
          action: "Tentative de connexion",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          ip_address: "10.0.0.5",
          status: "error",
        },
      ];

      const data = await new Promise((resolve) =>
        setTimeout(() => resolve(mockLogs), 500),
      );
      setLogs(data || []);
      // --- FIN DU MOCK ---
    } catch (err) {
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filterEmail
    ? logs.filter((log) =>
        log.email?.toLowerCase().includes(filterEmail.toLowerCase()),
      )
    : logs;

  const columns = [
    { field: "email", headerName: "Email", flex: 1, minWidth: 150 },
    { field: "action", headerName: "Action", flex: 1, minWidth: 150 },
    {
      field: "timestamp",
      headerName: "Date/Heure",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        try {
          return format(new Date(params.value), "dd/MM/yyyy HH:mm:ss");
        } catch {
          return params.value;
        }
      },
    },
    { field: "ip_address", headerName: "Adresse IP", flex: 1, minWidth: 150 },
    {
      field: "status",
      headerName: "Statut",
      width: 100,
      renderCell: (params) => (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: params.value === "success" ? "#D4EDDA" : "#F8D7DA",
            color: params.value === "success" ? "#155724" : "#721C24",
            fontSize: "0.85rem",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {params.value === "success" ? "Succès" : "Erreur"}
        </Box>
      ),
    },
  ];

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
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Audit Log - Historique d'Activité
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Filtrer par email"
              size="small"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" onClick={() => setFilterEmail("")}>
              Réinitialiser
            </Button>
          </Stack>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <DataGrid
            rows={filteredLogs.map((log, idx) => ({
              ...log,
              id: log.id || idx,
            }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": { borderBottom: "1px solid #E2E8F0" },
            }}
          />
        </Card>

        <Box
          sx={{
            mt: 3,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Card sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Total d'entrées
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {filteredLogs.length}
            </Typography>
          </Card>
          <Card sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Succès
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#10B981" }}>
              {filteredLogs.filter((l) => l.status === "success").length}
            </Typography>
          </Card>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default AuditLogs;
