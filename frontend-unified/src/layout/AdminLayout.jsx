import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  SignOut,
  List as ListIcon,
  Users,
  ChartBar,
} from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: ChartBar,
      path: "/admin/dashboard",
    },
    {
      label: "Utilisateurs",
      icon: Users,
      path: "/admin/users",
    },
    {
      label: "Audit Log",
      icon: ListIcon,
      path: "/admin/audit-logs",
    },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, bgcolor: "#0F172A", color: "white" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Northwind Health
        </Typography>
        <Typography variant="caption">Admin Panel</Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => {
              navigate(item.path);
            }}
            sx={{
              "&:hover": {
                backgroundColor: "#F0F9FF",
              },
            }}
          >
            <ListItemIcon>
              <item.icon size={24} />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar avec contraste corrigé (color: white) */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#0F172A",
          color: "white",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Admin Panel
          </Typography>

          {/* User Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: "#12B589",
                cursor: "pointer",
              }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              {user?.nom_complet?.charAt(0).toUpperCase()}
            </Avatar>

            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user?.nom_complet}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" color="textSecondary">
                  {user?.mail}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <SignOut size={20} style={{ marginRight: 8 }} />
                Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer fixé en mode "permanent" */}
      <Drawer
        variant="permanent"
        anchor="left"
        open={true}
        sx={{
          width: 250,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            marginTop: "64px",
            borderRight: "1px solid #E2E8F0",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content décalé de 250px pour laisser la place au menu */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginTop: "64px",
        }}
      >
        <Box sx={{ flex: 1, p: 3, backgroundColor: "#F1F5F9" }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
