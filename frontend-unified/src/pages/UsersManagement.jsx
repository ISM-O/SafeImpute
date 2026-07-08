import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {
  MagnifyingGlass,
  Plus,
  LockKey,
  ArrowRight,
  Circle,
} from "@phosphor-icons/react";
import PermissionMatrixModal from "../components/PermissionMatrixModal";

const RoleLegend = ({ role, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Circle size={10} weight="fill" color={color} />
    <Typography
      variant="body2"
      sx={{ color: "text.secondary", fontWeight: 500 }}
    >
      {role}
    </Typography>
  </Box>
);

const fetchUsers = async () => {
  const { data } = await apiClient.get("/users");
  return data;
};

const UsersManagement = () => {
  const {
    data: users = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Add User State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState(null);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "Clinicien" });

  const handleAddUser = async () => {
    try {
      setAddingUser(true);
      setAddUserError(null);
      await apiClient.post("/users", newUser);
      setIsAddUserModalOpen(false);
      setNewUser({ email: "", password: "", role: "Clinicien" });
      refetch();
    } catch (err) {
      setAddUserError(err.response?.data?.detail || "Failed to add user");
    } finally {
      setAddingUser(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Invited":
        return "warning";
      case "Deactivated":
        return "default";
      default:
        return "default";
    }
  };

  const getAvatarColor = (name) => {
    // Generate a consistent color based on name string for variety
    const colors = [
      "#10b981",
      "#6366f1",
      "#ec4899",
      "#f59e0b",
      "#3b82f6",
      "#8b5cf6",
      "#14b8a6",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">Failed to load users.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Header Area */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h1" sx={{ mb: 0.5 }}>
            Access & Users
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {users.length} people · click anyone to view and update their
            permissions
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<LockKey />}
            sx={{ borderRadius: "100px" }}
          >
            Full access
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus />}
            sx={{ borderRadius: "100px" }}
            onClick={() => setIsAddUserModalOpen(true)}
          >
            Add user
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <TextField
          placeholder="Search people..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: { xs: "100%", sm: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlass size={20} color="#94a3b8" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: "flex", gap: 3 }}>
          <RoleLegend role="Admin" color="#10b981" />
          <RoleLegend role="Clinician" color="#6366f1" />
          <RoleLegend role="Researcher" color="#ec4899" />
        </Box>
      </Box>

      {/* Users Grid */}
      <Grid container spacing={3}>
        {filteredUsers.map((user) => (
          <Grid item xs={12} md={6} key={user.id}>
            <Card
              sx={{
                borderTop: `4px solid ${user.color}`,
                cursor: "pointer",
                "&:hover": {
                  boxShadow:
                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                  transform: "translateY(-2px)",
                },
                opacity: user.status === "Deactivated" ? 0.7 : 1,
              }}
              onClick={() => handleOpenModal(user)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: getAvatarColor(user.name),
                        width: 48,
                        height: 48,
                        fontSize: "1.2rem",
                      }}
                    >
                      {getInitials(user.name)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{ mb: 0.5, fontSize: "1.125rem" }}
                      >
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={user.status}
                    size="small"
                    color={getStatusColor(user.status)}
                    icon={
                      user.status === "Active" ? (
                        <Circle
                          weight="fill"
                          size={10}
                          style={{ marginLeft: 6, color: "inherit" }}
                        />
                      ) : undefined
                    }
                    sx={{
                      fontWeight: 600,
                      borderRadius: "100px",
                      bgcolor:
                        user.status === "Active"
                          ? "#d1fae5"
                          : user.status === "Invited"
                            ? "#fef3c7"
                            : "#f1f5f9",
                      color:
                        user.status === "Active"
                          ? "#059669"
                          : user.status === "Invited"
                            ? "#d97706"
                            : "#64748b",
                      border: "none",
                    }}
                  />
                </Box>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: user.color,
                      bgcolor: `${user.color}15`,
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                    }}
                  >
                    {user.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.description}
                  </Typography>
                </Box>



                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                    pt: 2,
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Circle size={12} /> {user.lastActive}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    Manage access <ArrowRight size={14} />
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Permission Matrix Modal */}
      {selectedUser && (
        <PermissionMatrixModal
          open={isModalOpen}
          onClose={handleCloseModal}
          user={selectedUser}
          onUserUpdated={() => refetch()}
        />
      )}
      
      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {addUserError && <Typography color="error" sx={{ mb: 2 }}>{addUserError}</Typography>}
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
          />
          <TextField
            select
            fullWidth
            label="Role"
            margin="normal"
            value={newUser.role}
            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            SelectProps={{ native: true }}
          >
            <option value="Clinicien">Clinicien</option>
            <option value="Chercheur">Chercheur</option>
            <option value="Admin">Admin</option>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsAddUserModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddUser} disabled={addingUser}>
            {addingUser ? "Adding..." : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersManagement;
