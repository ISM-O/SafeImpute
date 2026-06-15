import { Box, Card, CardContent, Typography, Grid, Alert } from "@mui/material";
import { FileText, CheckCircle, WarningCircle } from "@phosphor-icons/react";

const ResultsPage = () => {
  const results = [
    {
      id: 1,
      name: "Analyse Sanguine",
      date: new Date("2024-03-05"),
      status: "Normal",
      doctor: "Dr. Martin",
    },
    {
      id: 2,
      name: "Électrocardiogramme",
      date: new Date("2024-02-20"),
      status: "Normal",
      doctor: "Dr. Sophie",
    },
    {
      id: 3,
      name: "Radiographie Thoracique",
      date: new Date("2024-01-15"),
      status: "Normal",
      doctor: "Dr. Martin",
    },
    {
      id: 4,
      name: "Test Vision",
      date: new Date("2024-03-10"),
      status: "Anormal",
      doctor: "Dr. Dupont",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Mes Résultats Médicaux
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Tous vos résultats médicaux sont disponibles ici. Les résultats anormaux
        sont marqués en rouge.
      </Alert>

      <Grid container spacing={2}>
        {results.map((result) => (
          <Grid item xs={12} sm={6} md={4} key={result.id}>
            <Card
              sx={{
                borderRadius: 2,
                borderLeft: `4px solid ${result.status === "Normal" ? "#10B981" : "#EF4444"}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor:
                        result.status === "Normal" ? "#D4EDDA" : "#F8D7DA",
                    }}
                  >
                    {result.status === "Normal" ? (
                      <CheckCircle size={24} color="#28A745" weight="fill" />
                    ) : (
                      <WarningCircle size={24} color="#DC3545" weight="fill" />
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {result.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      {result.date.toLocaleDateString("fr-FR")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color:
                          result.status === "Normal" ? "#28A745" : "#DC3545",
                      }}
                    >
                      {result.status}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      par {result.doctor}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ResultsPage;
