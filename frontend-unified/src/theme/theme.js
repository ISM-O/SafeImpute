import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#10b981", // Emerald 500 - matches the SafeImpute teal
      light: "#34d399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#64748b", // Slate 500
      light: "#94a3b8",
      dark: "#475569",
    },
    success: {
      main: "#10b981", 
      light: "#d1fae5", // Light green background for pills
    },
    error: {
      main: "#ef4444",
      light: "#fee2e2",
    },
    warning: {
      main: "#f59e0b",
      light: "#fef3c7",
    },
    info: {
      main: "#3b82f6",
      light: "#dbeafe",
    },
    background: {
      default: "#f8fafc", // Very light grey for main background
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a", // Slate 900
      secondary: "#475569", // Slate 600
      disabled: "#94a3b8",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a" },
    h2: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.01em", color: "#0f172a" },
    h3: { fontSize: "1.25rem", fontWeight: 600, color: "#0f172a" },
    h4: { fontSize: "1.125rem", fontWeight: 600, color: "#0f172a" },
    h5: { fontSize: "1rem", fontWeight: 600, color: "#0f172a" },
    h6: { fontSize: "0.875rem", fontWeight: 600, color: "#475569" },
    body1: { fontSize: "0.9375rem", lineHeight: 1.5, color: "#334155" }, // 15px
    body2: { fontSize: "0.875rem", lineHeight: 1.5, color: "#475569" }, // 14px
    subtitle1: { fontSize: "0.875rem", fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
    button: { textTransform: "none", fontWeight: 500, fontSize: "0.9375rem" },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded buttons like in mockup
          padding: "8px 16px",
          fontWeight: 500,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&:hover": {
            backgroundColor: "#059669",
          },
        },
        outlined: {
          borderColor: "#e2e8f0",
          color: "#475569",
          "&:hover": {
            backgroundColor: "#f8fafc",
            borderColor: "#cbd5e1",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)", // subtle shadow
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "& fieldset": { borderColor: "#e2e8f0" },
            "&:hover fieldset": { borderColor: "#cbd5e1" },
            "&.Mui-focused fieldset": { borderColor: "#10b981" },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
