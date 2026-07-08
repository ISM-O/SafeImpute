import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Chip } from "@mui/material";
import { PlayArrow, InsertChartOutlined, ShieldOutlined, SpeedOutlined, ArrowForwardIos, MedicalServicesOutlined, ScienceOutlined, QueryStatsOutlined } from "@mui/icons-material";
import PatientPanelModal from '../components/PatientPanelModal';
import HowItWorksModal from '../components/HowItWorksModal';

const OverviewPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  return (
    <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 1000, margin: "0 auto" }}>
      {/* Hero Section */}
      <Box sx={{ mb: 6 }}>
        <Chip 
          icon={<ShieldOutlined fontSize="small" />} 
          label="Secure imputation of incomplete lab panels" 
          color="success" 
          variant="outlined" 
          sx={{ mb: 2, borderRadius: '4px', bgcolor: 'success.light', color: 'success.dark', border: 'none', fontWeight: 600 }}
        />
        <Typography variant="h1" sx={{ mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1, fontWeight: 700 }}>
          Lab panels arrive full of gaps.
          <br />
          SafeImpute fills them in.
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', color: 'text.secondary', maxWidth: 800 }}>
          SafeImpute utilizes a specialized <b>Masked Transformer</b> architecture to analyze incomplete laboratory panels. By understanding the complex correlations between different analytes, the model accurately predicts missing values while attaching a rigorous <b>confidence score</b> to each prediction. All processing happens locally, ensuring that sensitive patient data never leaves your secure environment.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PlayArrow />} 
            size="large" 
            sx={{ px: 4, py: 1.5 }}
            onClick={() => setIsModalOpen(true)}
          >
            Open a patient & try it
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<InsertChartOutlined />} 
            size="large" 
            sx={{ px: 4, py: 1.5 }}
            onClick={() => setIsHowItWorksOpen(true)}
          >
            See how it works
          </Button>
        </Box>
      </Box>

      {/* What it promises */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          WHAT IT PROMISES · IN ONE MINUTE
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: 'background.default', border: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark', display: 'flex', mr: 2 }}>
                    <QueryStatsOutlined />
                  </Box>
                  <Typography variant="h6" sx={{ color: 'text.primary' }}>Accurate</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Fills the gaps better than the textbook fills (mean, k-NN, MICE) — lower error on every analyte.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: 'background.default', border: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark', display: 'flex', mr: 2 }}>
                    <ShieldOutlined />
                  </Box>
                  <Typography variant="h6" sx={{ color: 'text.primary' }}>Secure</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  No data leaves the hospital. Differential privacy ensures no training record was memorized.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', bgcolor: 'background.default', border: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark', display: 'flex', mr: 2 }}>
                    <SpeedOutlined />
                  </Box>
                  <Typography variant="h6" sx={{ color: 'text.primary' }}>Fast</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Runs directly in the browser or on lightweight local servers. Instant results for clinicians.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Workflow */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
          HOW THE PIECES CONNECT · CLICK ANY STEP
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          
          <Card sx={{ flex: 1, minWidth: 200, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 600 }}>
                <MedicalServicesOutlined fontSize="small" sx={{ mr: 1 }} /> STEP 1
              </Typography>
              <Typography variant="h6">Patients</Typography>
              <Typography variant="body2" color="text.secondary">Pick a patient with missing labs</Typography>
            </CardContent>
          </Card>
          
          <ArrowForwardIos sx={{ color: 'text.disabled', fontSize: '1rem', display: { xs: 'none', md: 'block' } }} />

          <Card sx={{ flex: 1, minWidth: 200, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 600 }}>
                <ScienceOutlined fontSize="small" sx={{ mr: 1 }} /> STEP 2
              </Typography>
              <Typography variant="h6">Panel</Typography>
              <Typography variant="body2" color="text.secondary">See what's missing and select analytes</Typography>
            </CardContent>
          </Card>

          <ArrowForwardIos sx={{ color: 'text.disabled', fontSize: '1rem', display: { xs: 'none', md: 'block' } }} />

          <Card sx={{ flex: 1, minWidth: 200, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 600 }}>
                <InsertChartOutlined fontSize="small" sx={{ mr: 1 }} /> STEP 3
              </Typography>
              <Typography variant="h6">Imputation</Typography>
              <Typography variant="body2" color="text.secondary">Run transformer and review confidence</Typography>
            </CardContent>
          </Card>

        </Box>
      </Box>

      {/* Patient Panel Modal */}
      <PatientPanelModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        patient={{ id: 'New Patient', dataset: 'Custom Input' }} 
      />

      <HowItWorksModal 
        open={isHowItWorksOpen} 
        onClose={() => setIsHowItWorksOpen(false)} 
      />
    </Box>
  );
};

export default OverviewPage;
