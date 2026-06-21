import { Box, Typography, Button, TextField, InputAdornment, Grid, Card, CardContent, Chip, LinearProgress, Divider } from "@mui/material";
import { Search, FileUploadOutlined, AutoAwesome, CheckCircleOutline, ErrorOutline, Storage, ArrowForward } from "@mui/icons-material";

const patientsData = [
  {
    id: "PT-10482", status: "Needs review", statusColor: "warning",
    demographics: "64F · Day 2", diagnosis: "Sepsis",
    progress: { observed: 8, toImpute: 4, flagged: 7 },
    badges: [{ label: "3 confident", color: "success" }, { label: "2 uncertain", color: "warning" }],
    time: "8 min ago", dataset: "MIMIC-IV demo"
  },
  {
    id: "PT-10517", status: "Imputed", statusColor: "success",
    demographics: "71M · Day 1", diagnosis: "Septic shock",
    progress: { observed: 8, toImpute: 3, flagged: 8 },
    badges: [{ label: "3 confident", color: "success" }],
    time: "22 min ago", dataset: "MIMIC-IV demo"
  },
  {
    id: "PT-10463", status: "Ready", statusColor: "info",
    demographics: "58F · Day 4", diagnosis: "Pneumonia",
    progress: { observed: 8, toImpute: 2, flagged: 3 },
    badges: [],
    time: "1 h ago", dataset: "PhysioNet 2019"
  },
  {
    id: "PT-10588", status: "Imported", statusColor: "default",
    demographics: "45M · Day 1", diagnosis: "Diabetic ketoacidosis",
    progress: { observed: 8, toImpute: 2, flagged: 6 },
    badges: [],
    time: "34 min ago", dataset: "MIMIC-IV demo"
  },
  {
    id: "PT-10421", status: "Exported", statusColor: "default",
    demographics: "67F · Day 6", diagnosis: "Acute kidney injury",
    progress: { observed: 8, toImpute: 3, flagged: 3 },
    badges: [{ label: "2 confident", color: "success" }],
    time: "1 d ago", dataset: "PhysioNet 2019"
  },
  {
    id: "PT-10605", status: "Needs review", statusColor: "warning",
    demographics: "39M · Day 2", diagnosis: "Polytrauma",
    progress: { observed: 8, toImpute: 3, flagged: 6 },
    badges: [{ label: "1 confident", color: "success" }, { label: "2 uncertain", color: "warning" }],
    time: "3 h ago", dataset: "Synthetic v3"
  }
];

const PatientCard = ({ patient }) => (
  <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', boxShadow: 2 } }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{patient.id}</Typography>
        </Box>
        <Chip 
          label={patient.status} 
          size="small" 
          color={patient.statusColor === 'default' ? 'default' : patient.statusColor}
          variant={patient.statusColor === 'default' ? 'outlined' : 'soft'}
          sx={{ 
            bgcolor: patient.statusColor !== 'default' ? `${patient.statusColor}.light` : undefined, 
            color: patient.statusColor !== 'default' ? `${patient.statusColor}.dark` : undefined,
            fontWeight: 600, border: 'none'
          }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{patient.demographics}</Typography>
      <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>{patient.diagnosis}</Typography>

      {/* Progress Bar Mock */}
      <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', mb: 1, bgcolor: 'grey.200' }}>
        <Box sx={{ width: '40%', bgcolor: 'primary.main' }} />
        <Box sx={{ width: '20%', bgcolor: 'warning.main' }} />
        <Box sx={{ width: '30%', bgcolor: 'error.main' }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', fontWeight: 600 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mr: 0.5 }} /> {patient.progress.observed} observed
        </Typography>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'warning.main', fontWeight: 600 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main', mr: 0.5 }} /> {patient.progress.toImpute} to impute
        </Typography>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'error.main', fontWeight: 600 }}>
          <ErrorOutline sx={{ fontSize: 12, mr: 0.5 }} /> {patient.progress.flagged} flagged
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, minHeight: 24, mb: 2 }}>
        {patient.badges.length > 0 ? patient.badges.map((b, i) => (
          <Chip key={i} label={b.label} size="small" sx={{ 
            height: 20, fontSize: '0.7rem', fontWeight: 600,
            bgcolor: `${b.color}.light`, color: `${b.color}.dark` 
          }} />
        )) : <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>Not yet imputed</Typography>}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
          <Storage sx={{ fontSize: 14, mr: 0.5 }} /> {patient.dataset}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">{patient.time}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
            Open <ArrowForward sx={{ fontSize: 14, ml: 0.5 }} />
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const PatientsPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h1" sx={{ mb: 1 }}>Patients</Typography>
          <Typography variant="body1" color="text.secondary">
            8 panels in this workspace · click any patient to open their lab panel
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<FileUploadOutlined />}>
          Import patients
        </Button>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search MRN or diagnosis..."
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            sx: { borderRadius: 8, bgcolor: 'background.paper', width: 300 }
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
          <Chip label="All 8" color="primary" variant="outlined" sx={{ fontWeight: 600, bgcolor: 'primary.light', color: 'primary.dark', borderColor: 'primary.main' }} />
          <Chip label="Imported 1" variant="outlined" sx={{ fontWeight: 500 }} />
          <Chip label="Ready 2" variant="outlined" sx={{ fontWeight: 500 }} />
          <Chip label="Imputed 1" variant="outlined" sx={{ fontWeight: 500 }} />
          <Chip label="Needs review 2" variant="outlined" sx={{ fontWeight: 500 }} />
          <Chip label="Incomplete 1" variant="outlined" sx={{ fontWeight: 500 }} />
        </Box>
      </Box>

      {/* Grid */}
      <Grid container spacing={3}>
        {patientsData.map((patient) => (
          <Grid item xs={12} sm={6} md={4} key={patient.id}>
            <PatientCard patient={patient} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PatientsPage;
