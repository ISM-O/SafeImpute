import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import { Check } from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";

const SettingsPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nom_complet: user?.nom_complet || "",
    email: user?.mail || "",
    phone: "+33 6 XX XX XX XX",
  });
  const [saved, setSaved] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Paramètres du Compte
      </Typography>

      {saved && (
        <Alert
          severity="success"
          icon={<Check size={20} />}
          sx={{ mb: 3 }}
          onClose={() => setSaved(false)}
        >
          Paramètres enregistrés avec succès!
        </Alert>
      )}

      {/* Profile Section */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Informations Personnelles
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Nom Complet"
              name="nom_complet"
              value={formData.nom_complet}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              label="Email"
              name="email"
              value={formData.email}
              disabled
              fullWidth
            />

            <TextField
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
            />

            <Button variant="contained" color="primary" onClick={handleSave}>
              Enregistrer
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Sécurité
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ pb: 2, borderBottom: "1px solid #E2E8F0" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Mot de Passe
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mb: 2, display: "block" }}
              >
                Changez votre mot de passe régulièrement pour plus de sécurité
              </Typography>
              <Button variant="outlined" size="small">
                Changer le Mot de Passe
              </Button>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Face ID
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mb: 2, display: "block" }}
              >
                ✓ Face ID est enrôlé pour votre compte
              </Typography>
              <Button variant="outlined" size="small" color="warning">
                Réenrôler Face ID
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Préférences
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ pb: 2, borderBottom: "1px solid #E2E8F0" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Notifications Email
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Recevoir des alertes pour les nouveaux résultats
              </Typography>
            </Box>

            <Box sx={{ pb: 2, borderBottom: "1px solid #E2E8F0" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Langue
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Français
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Thème
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Clair (par défaut)
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card sx={{ mt: 4, borderRadius: 2, borderLeft: "4px solid #EF4444" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1, color: "#EF4444" }}
          >
            Zone Dangereuse
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Supprimer votre compte est une action irréversible
          </Typography>
          <Button variant="outlined" color="error">
            Supprimer le Compte
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
