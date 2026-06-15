import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
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
  List as ListIcon,
  House,
  FileText,
  Sliders,
  SignOut,
} from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";
import authService from "../services/authService";

const UserLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Accueil",
      icon: House,
      path: "/home",
    },
    {
      label: "Consultations",
      icon: FileText,
      path: "/consultations",
    },
    {
      label: "Résultats",
      icon: ListIcon,
      path: "/results",
    },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, bgcolor: "#12B589", color: "white" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Northwind Health
        </Typography>
        <Typography variant="caption">Patient Portal</Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
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
        <ListItem
          button
          onClick={() => {
            navigate("/settings");
            setDrawerOpen(false);
          }}
          sx={{
            "&:hover": {
              backgroundColor: "#F0F9FF",
            },
          }}
        >
          <ListItemIcon>
            <Sliders size={24} />
          </ListItemIcon>
          <ListItemText primary="Paramètres" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#12B589",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <ListIcon size={24} />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Northwind Health
          </Typography>

          {/* User Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
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

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: 250,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            marginTop: "64px",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginTop: "64px",
        }}
      >
        <Box sx={{ flex: 1, p: 3, backgroundColor: "#F8FAFC" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout;
