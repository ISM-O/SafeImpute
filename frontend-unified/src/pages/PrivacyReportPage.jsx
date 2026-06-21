import { Box, Typography, Button, Grid, Card, CardContent, Chip } from "@mui/material";
import { PlayArrow, DownloadOutlined, LockOpenOutlined, CheckCircle, InfoOutlined } from "@mui/icons-material";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const traceabilityData = [
  { name: '0', real: 10, synth: 12 },
  { name: '1', real: 30, synth: 28 },
  { name: '2', real: 45, synth: 50 },
  { name: '3', real: 80, synth: 75 },
  { name: '4', real: 100, synth: 105 },
  { name: '5', real: 70, synth: 65 },
  { name: '6', real: 40, synth: 42 },
  { name: '7', real: 20, synth: 18 },
  { name: '8', real: 5, synth: 8 },
];

const PrivacyReportPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ mb: 1 }}>Privacy Report</Typography>
          <Typography variant="body1" color="text.secondary">
            Patient data protection audit · MIMIC-IV demo
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<LockOpenOutlined />} color="success" sx={{ fontWeight: 600 }}>
            Can run
          </Button>
          <Button variant="outlined" startIcon={<PlayArrow />}>
            Run audit
          </Button>
          <Button variant="contained" color="primary" startIcon={<DownloadOutlined />}>
            Export report
          </Button>
        </Box>
      </Box>

      {/* Main Banner */}
      <Box sx={{ 
        bgcolor: 'success.light', color: 'success.dark', borderRadius: 3, p: 3, mb: 4, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: '1px solid', borderColor: 'success.main'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: 'success.main', color: 'white', p: 1, borderRadius: 2, display: 'flex' }}>
            <CheckCircle />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>Privacy checks passed · 3/3</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No patient can be re-identified from this model, and no training record was memorized.</Typography>
          </Box>
        </Box>
        <Chip icon={<CheckCircle fontSize="small" sx={{ color: 'success.main' }} />} label="All clear" variant="outlined" sx={{ bgcolor: 'white', borderColor: 'success.main', color: 'success.dark', fontWeight: 600 }} />
      </Box>

      {/* Cards Grid */}
      <Grid container spacing={3}>
        {/* Membership inference */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="subtitle1" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}>
                  Membership inference <InfoOutlined sx={{ ml: 1, fontSize: 16, color: 'text.disabled' }} />
                </Typography>
                <Chip label="Safe" size="small" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }} icon={<CheckCircle fontSize="small" />} />
              </Box>
              
              <Box sx={{ height: 160, position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ value: 51 }, { value: 49 }]} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={100} stroke="none" dataKey="value">
                      <Cell fill="#10b981" />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', bottom: 10, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>0.51</Typography>
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>≈ random</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <Typography variant="caption" color="text.disabled">0.50</Typography>
                <Typography variant="caption" color="text.disabled">1.0</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Attack AUC <b>0.51</b> — inside the safe zone around 0.50.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Traceability */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}>
                  Traceability <InfoOutlined sx={{ ml: 1, fontSize: 16, color: 'text.disabled' }} />
                </Typography>
                <Chip label="No copies" size="small" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }} icon={<CheckCircle fontSize="small" />} />
              </Box>
              
              <Box sx={{ height: 160, mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={traceabilityData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="real" stroke="#94a3b8" fill="#e2e8f0" strokeWidth={2} />
                    <Area type="monotone" dataKey="synth" stroke="#10b981" fill="none" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 4, bgcolor: '#94a3b8', mr: 1, borderRadius: 2 }} /> real → real
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 4, bgcolor: '#10b981', mr: 1, borderRadius: 2 }} /> synth → real
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Hitting rate <Box component="span" sx={{ color: 'success.main' }}>0%</Box>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Differential privacy */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}>
                  Differential privacy <InfoOutlined sx={{ ml: 1, fontSize: 16, color: 'text.disabled' }} />
                </Typography>
                <Chip label="ε = 3.0" size="small" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }} icon={<CheckCircle fontSize="small" />} />
              </Box>
              
              <Box sx={{ height: 160, position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ value: 20 }, { value: 50 }, { value: 30 }]} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={100} stroke="none" dataKey="value">
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', bottom: 10, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>ε = 3.0</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, mb: 3 }}>
                <Typography variant="caption" color="text.disabled">private</Typography>
                <Typography variant="caption" color="text.disabled">accurate</Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, bgcolor: 'success.light', p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Private RMSE</Typography>
                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1 }}>0.56</Typography>
                </Box>
                <Box sx={{ flex: 1, bgcolor: 'grey.100', p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Non-private</Typography>
                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1 }}>0.458</Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" align="center">
                Privacy costs <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>+0.11 RMSE</Box> at this budget.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PrivacyReportPage;
