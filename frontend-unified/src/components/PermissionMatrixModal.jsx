import { useState, useEffect } from "react";
import apiClient from "../api/client";
import { useAuth } from "../hooks/useAuth";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  IconButton,
  Chip,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem
} from "@mui/material";
import { X, WarningCircle, Circle, Key, Check } from "@phosphor-icons/react";

const getAccess = (role, featureRoles) => featureRoles.includes(role);

const getModules = (role) => [
  { id: "overview", name: "Overview", view: getAccess(role, ["Admin", "Chercheur", "Clinicien"]) },
  { id: "patients", name: "Patients", view: getAccess(role, ["Admin", "Chercheur", "Clinicien"]) },
  { id: "imputation", name: "Imputation", view: getAccess(role, ["Admin", "Chercheur", "Clinicien"]) },
  { id: "dashboard", name: "Dashboard", view: getAccess(role, ["Admin", "Chercheur"]) },
  { id: "compare_methods", name: "Compare Methods", view: getAccess(role, ["Admin", "Chercheur", "Clinicien"]) },
  { id: "privacy_report", name: "Privacy Report", view: getAccess(role, ["Admin", "Chercheur", "Clinicien"]) },
  { id: "access_users", name: "Access & Users", view: getAccess(role, ["Admin"]) },
];

const PermissionMatrixModal = ({ open, onClose, user, onUserUpdated }) => {
  const { user: currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.role || "Clinicien");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setSelectedRole(user.role);
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    if (selectedRole !== user.role) {
      try {
        setSaving(true);
        await apiClient.put(`/users/${user.id}/role`, { role: selectedRole });
        onUserUpdated && onUserUpdated();
      } catch (err) {
        console.error("Failed to update role", err);
      } finally {
        setSaving(false);
      }
    }
    onClose();
  };

  const getInitials = (name) => name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Avatar sx={{ bgcolor: user.color, width: 48, height: 48, fontSize: "1.2rem" }}>
            {getInitials(user.name)}
          </Avatar>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="h3">{user.name}</Typography>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={currentUser?.email === user.email}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  bgcolor: `${user.color}15`,
                  color: user.color,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiSelect-select": { py: 0, pl: 1, pr: 3 }
                }}
              >
                <MenuItem value="Clinicien">Clinicien</MenuItem>
                <MenuItem value="Chercheur">Chercheur</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 0 }}>
        {/* User Stats Row */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
          <Chip
            icon={<Circle weight="fill" size={8} />}
            label="Active"
            size="small"
            sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 600, "& .MuiChip-icon": { color: "#059669" } }}
          />
          <Typography variant="caption" color="text.disabled" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Circle size={10} /> Active now
          </Typography>
        </Box>

        {/* Warning Banner */}
        <Box sx={{ bgcolor: "#fff7ed", color: "#b45309", p: 2, borderRadius: 2, mb: 3, display: "flex", gap: 1.5, alignItems: "center" }}>
          <WarningCircle size={20} color="#f59e0b" />
          <Typography variant="body2">
            Changes apply to <strong>this user only</strong> — the {user.role} role baseline is unchanged.
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: "text.disabled", letterSpacing: "0.05em", mb: 1, display: "block", textTransform: "uppercase" }}>
          Permission Matrix <span style={{ marginLeft: 8 }}>"-" = not applicable</span>
        </Typography>

        {/* Permissions Table */}
        <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>MODULE</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary" }}>Access</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getModules(selectedRole).map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontWeight: 500, color: "text.primary", borderBottom: "1px solid #f1f5f9", py: 2 }}>{row.name}</TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #f1f5f9", py: 2 }}>
                    {row.view ? (
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <Check weight="bold" color="#10b981" />
                        <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600 }}>Yes</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <X weight="bold" color="#94a3b8" />
                        <Typography variant="body2" sx={{ color: "text.disabled", fontWeight: 600 }}>No</Typography>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, borderTop: "1px solid #e2e8f0" }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionMatrixModal;
