import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  CircularProgress,
  Chip,
} from "@mui/material";
import { format } from "date-fns";
import { Eye, Download } from "@phosphor-icons/react";
import { DataGrid } from "@mui/x-data-grid";

const ConsultationHistoryPage = () => {
  const [consultations, setConsultations] = useState([
    {
      id: 1,
      date: new Date("2024-01-15"),
      doctor: "Dr. Martin",
      type: "Consultation Générale",
      status: "Complétée",
    },
    {
      id: 2,
      date: new Date("2024-02-20"),
      doctor: "Dr. Sophie",
      type: "Suivi Cardiaque",
      status: "Complétée",
    },
    {
      id: 3,
      date: new Date("2024-03-10"),
      doctor: "Dr. Martin",
      type: "Consultation Générale",
      status: "En attente",
    },
  ]);

  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const columns = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => format(params.value, "dd/MM/yyyy"),
    },
    {
      field: "doctor",
      headerName: "Médecin",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "status",
      headerName: "Statut",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Complétée" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Eye size={16} />}
            onClick={() => {
              setSelectedConsultation(params.row);
              setOpenDialog(true);
            }}
          >
            Voir
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Historique des Consultations
      </Typography>

      <Card sx={{ borderRadius: 2 }}>
        <DataGrid
          rows={consultations}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #E2E8F0",
            },
          }}
        />
      </Card>

      {/* View Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedConsultation && (
          <>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Détails de la Consultation
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {format(selectedConsultation.date, "dd MMMM yyyy")}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Médecin
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedConsultation.doctor}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedConsultation.type}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Statut
                  </Typography>
                  <Chip label={selectedConsultation.status} color="success" />
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setOpenDialog(false)}
                >
                  Fermer
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<Download size={18} />}
                >
                  Télécharger PDF
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ConsultationHistoryPage;
