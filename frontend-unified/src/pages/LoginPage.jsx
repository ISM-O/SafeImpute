import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, TextField, CircularProgress } from "@mui/material";
import { WarningCircle, Heartbeat } from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const success = await login(formData.email, formData.password);
    setLoading(false);

    if (success) {
      // RoleBasedRedirect in router will handle the proper routing after login
      navigate("/");
    } else {
      setError("Incorrect email or password");
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      p: 2
    }}>
      <Box sx={{
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        p: { xs: 3, md: 5 },
        width: '100%',
        maxWidth: 400,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
          <Box sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 1.5,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Heartbeat size={28} weight="bold" />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              SafeImpute
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Clinical imputation
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ mb: 1, textAlign: 'center', fontWeight: 600 }}>
          Sign in to your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Secure access for clinical staff and researchers.
        </Typography>

        {error && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            bgcolor: '#fef2f2',
            border: '1px solid #f87171',
            borderRadius: 2,
            color: '#dc2626',
            mb: 3
          }}>
            <WarningCircle size={20} weight="fill" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{error}</Typography>
          </Box>
        )}

        <form onSubmit={handlePasswordLogin}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Work email
          </Typography>
          <TextField
            fullWidth
            name="email"
            type="email"
            placeholder="name@hospital.org"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />

          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Password
          </Typography>
          <TextField
            fullWidth
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
            sx={{ mb: 4 }}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default LoginPage;
