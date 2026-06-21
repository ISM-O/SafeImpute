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
} from "@mui/material";
import { X, WarningCircle, Circle, Key } from "@phosphor-icons/react";

const modules = [
  { section: "START" },
  { id: "overview", name: "Overview", view: true, edit: null, run: null, export: null, manage: null },
  { section: "SAFEIMPUTE" },
  { id: "patient_panel", name: "Patient Panel", view: true, edit: true, run: true, export: true, manage: null },
  { id: "imputation", name: "Imputation", view: true, edit: null, run: true, export: true, manage: null },
  { id: "evaluation", name: "Evaluation", view: true, edit: null, run: true, export: true, manage: null },
  { id: "privacy_report", name: "Privacy Report", view: true, edit: null, run: true, export: true, manage: null },
  { id: "compare_methods", name: "Compare Methods", view: true, edit: null, run: null, export: true, manage: null },
  { section: "ADMINISTRATION" },
  { id: "datasets_models", name: "Datasets & Models", view: true, edit: true, run: null, export: null, manage: true },
  { id: "users_access", name: "Users & Access", view: true, edit: null, run: null, export: null, manage: true },
  { id: "activity_logs", name: "Activity Logs", view: true, edit: null, run: null, export: true, manage: null },
];

const PermissionSwitch = ({ checked, disabled }) => {
  if (disabled === null) {
    return <Typography sx={{ color: "text.disabled", textAlign: "center" }}>-</Typography>;
  }
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Switch
        checked={checked}
        size="small"
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": { color: "primary.main" },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "primary.main" },
        }}
      />
    </Box>
  );
};

const PermissionMatrixModal = ({ open, onClose, user }) => {
  if (!user) return null;

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
              <Chip
                label={user.role}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  bgcolor: `${user.color}15`,
                  color: user.color,
                  border: "none",
                }}
              />
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
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Chip
            icon={<Circle weight="fill" size={8} />}
            label="Active"
            size="small"
            sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 600, "& .MuiChip-icon": { color: "#059669" } }}
          />
          <Chip
            icon={<Key size={14} />}
            label={`${user.accessLevel} / ${user.maxAccess} permissions`}
            size="small"
            sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 500 }}
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
                <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary" }}>View<br/><span style={{fontSize: "0.7rem", color: "#10b981"}}>all</span></TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary" }}>Edit<br/><span style={{fontSize: "0.7rem", color: "#10b981"}}>all</span></TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary" }}>Run<br/><span style={{fontSize: "0.7rem", color: "#10b981"}}>all</span></TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary" }}>Export<br/><span style={{fontSize: "0.7rem", color: "#10b981"}}>all</span></TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary" }}>Manage<br/><span style={{fontSize: "0.7rem", color: "#10b981"}}>all</span></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.map((row, index) => {
                if (row.section) {
                  return (
                    <TableRow key={`sec-${index}`}>
                      <TableCell colSpan={5} sx={{ py: 2, borderBottom: "1px solid #f1f5f9" }}>
                        <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.05em" }}>
                          {row.section}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2, borderBottom: "1px solid #f1f5f9" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                          <Typography variant="caption" color="text.disabled">master</Typography>
                          <Switch defaultChecked size="small" sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "primary.main" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "primary.main" } }} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                }
                return (
                  <TableRow key={row.id}>
                    <TableCell sx={{ fontWeight: 500, color: "text.primary", borderBottom: "1px solid #f1f5f9" }}>{row.name}</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}><PermissionSwitch checked={row.view} disabled={row.view} /></TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}><PermissionSwitch checked={row.edit} disabled={row.edit} /></TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}><PermissionSwitch checked={row.run} disabled={row.run} /></TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}><PermissionSwitch checked={row.export} disabled={row.export} /></TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #f1f5f9" }}><PermissionSwitch checked={row.manage} disabled={row.manage} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, borderTop: "1px solid #e2e8f0" }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onClose}>
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionMatrixModal;
