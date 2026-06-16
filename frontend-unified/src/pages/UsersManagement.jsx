import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Pen, Trash } from "@phosphor-icons/react";
import AdminLayout from "../layout/AdminLayout";
// import adminService from "../services/adminService";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [permissions, setPermissions] = useState({
    can_view: true,
    can_edit: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // --- DÉBUT DU MOCK ---
      const mockUsers = [
        {
          id: 1,
          nom_complet: "Ismaël Gansonre",
          mail: "ismael@northwind.com",
          can_view: true,
          can_edit: true,
        },
        {
          id: 2,
          nom_complet: "Dr. Bandoss",
          mail: "bandoss@northwind.com",
          can_view: true,
          can_edit: false,
        },
        {
          id: 3,
          nom_complet: "Alice Admin",
          mail: "alice@northwind.com",
          can_view: true,
          can_edit: true,
        },
      ];

      const data = await new Promise((resolve) =>
        setTimeout(() => resolve(mockUsers), 500),
      );
      setUsers(data || []);
      // --- FIN DU MOCK ---
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setPermissions({
      can_view: user.can_view,
      can_edit: user.can_edit,
    });
    setOpenDialog(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    try {
      // --- MOCK SAUVEGARDE ---
      // On met à jour l'état local au lieu d'appeler l'API
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id ? { ...u, ...permissions } : u,
      );
      setUsers(updatedUsers);
      setOpenDialog(false);
      // --- FIN MOCK ---
    } catch (err) {
      setError("Failed to update permissions");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) {
      try {
        // --- MOCK SUPPRESSION ---
        // On retire l'utilisateur de l'état local
        const filteredUsers = users.filter((u) => u.id !== userId);
        setUsers(filteredUsers);
        // --- FIN MOCK ---
      } catch (err) {
        setError("Failed to delete user");
      }
    }
  };

  const columns = [
    { field: "nom_complet", headerName: "Nom", flex: 1, minWidth: 150 },
    { field: "mail", headerName: "Email", flex: 1, minWidth: 200 },
    {
      field: "can_view",
      headerName: "Voir",
      width: 80,
      renderCell: (params) => (params.value ? "✓" : "✗"),
    },
    {
      field: "can_edit",
      headerName: "Éditer",
      width: 80,
      renderCell: (params) => (params.value ? "✓" : "✗"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Pen size={16} />}
            onClick={() => handleEditClick(params.row)}
          >
            Éditer
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Trash size={16} />}
            onClick={() => handleDeleteUser(params.row.id)}
          >
            Supprimer
          </Button>
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
          Gestion des Utilisateurs
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card sx={{ borderRadius: 2 }}>
          <DataGrid
            rows={users}
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
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Modifier les Permissions</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nom"
              value={selectedUser?.nom_complet || ""}
              disabled
              fullWidth
            />
            <TextField
              label="Email"
              value={selectedUser?.mail || ""}
              disabled
              fullWidth
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Permissions
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.can_view}
                    onChange={(e) =>
                      setPermissions({
                        ...permissions,
                        can_view: e.target.checked,
                      })
                    }
                  />
                }
                label="Peut voir les données"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.can_edit}
                    onChange={(e) =>
                      setPermissions({
                        ...permissions,
                        can_edit: e.target.checked,
                      })
                    }
                  />
                }
                label="Peut éditer les données"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            onClick={handleSavePermissions}
            variant="contained"
            color="primary"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersManagement;
