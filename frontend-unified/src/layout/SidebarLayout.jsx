import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Compass,
  Users,
  MagicWand,
  ChartBar,
  Columns,
  ShieldCheck,
  UserGear,
  SignOut,
  Heartbeat,
} from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";

const drawerWidth = 260;

const menuSections = [
  {
    id: 1,
    title: "1 START HERE",
    items: [
      { label: "Overview", icon: Compass, path: "/overview" },
    ],
  },
  {
    id: 2,
    title: "2 PATIENT WORKFLOW",
    items: [
      { label: "Patients", icon: Users, path: "/patients" },
      { label: "Imputation", icon: MagicWand, path: "/imputation" },
    ],
  },
  {
    id: 3,
    title: "3 PROOF IT WORKS",
    items: [
      { label: "Dashboard", icon: ChartBar, path: "/dashboard", hiddenRoles: ["Clinicien"] },
      { label: "Compare Methods", icon: Columns, path: "/compare-methods" },
      { label: "Privacy Report", icon: ShieldCheck, path: "/privacy-report" },
    ],
  },
  {
    id: 4,
    title: "4 ADMINISTRATION",
    items: [
      { label: "Access & Users", icon: UserGear, path: "/access-users", adminOnly: true },
    ],
  },
];

const SidebarLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo Area */}
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 1,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Heartbeat size={24} weight="bold" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: "text.primary" }}>
            SafeImpute
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Clinical imputation
          </Typography>
        </Box>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, pb: 2 }}>
        {menuSections.map((section) => {
          // Filter admin items if not admin and check hiddenRoles
          const visibleItems = section.items.filter(
            (item) => {
              if (item.adminOnly && user?.role !== "Admin") return false;
              if (item.hiddenRoles && item.hiddenRoles.includes(user?.role)) return false;
              return true;
            }
          );

          if (visibleItems.length === 0) return null;

          return (
            <Box key={section.id} sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 1,
                  display: "block",
                  color: "text.disabled",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                {section.title}
              </Typography>
              <List disablePadding>
                {visibleItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <ListItem
                      button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        py: 1,
                        px: 2,
                        bgcolor: isActive ? "rgba(16, 185, 129, 0.1)" : "transparent",
                        color: isActive ? "primary.main" : "text.secondary",
                        "&:hover": {
                          bgcolor: isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActive ? "primary.main" : "text.secondary",
                        }}
                      >
                        <item.icon size={20} weight={isActive ? "fill" : "regular"} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: "0.9375rem",
                          fontWeight: isActive ? 600 : 500,
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      <Divider />

      {/* User Profile Area */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40, fontSize: "1rem", fontWeight: 600 }}>
          {getInitials(user?.nom_complet || user?.email || "User")}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", noWrap: true }}>
            {user?.nom_complet || user?.email?.split('@')[0] || "User"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            {user?.role || "User"}
          </Typography>
        </Box>
        <IconButton onClick={handleLogout} size="small" sx={{ color: "text.secondary" }}>
          <SignOut size={20} />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Permanent Drawer for Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default SidebarLayout;
