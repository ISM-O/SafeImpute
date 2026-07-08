import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Chip, CircularProgress, Alert } from "@mui/material";
import { PlayArrow, DownloadOutlined, LockOpenOutlined, CheckCircle, InfoOutlined, WarningAmber } from "@mui/icons-material";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const buildHistogramData = (realArr, synthArr, binsCount = 15) => {
  if (!realArr || !synthArr || realArr.length === 0 || synthArr.length === 0) return [];
  
  const allVals = [...realArr, ...synthArr];
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const step = (max - min) / binsCount;
  
  const bins = Array.from({ length: binsCount }, (_, i) => ({
    min: min + i * step,
    max: min + (i + 1) * step,
    real: 0,
    synth: 0,
    label: (min + i * step).toFixed(2)
  }));
  
  realArr.forEach(v => {
    const binIdx = Math.min(Math.floor((v - min) / step), binsCount - 1);
    bins[binIdx].real += 1;
  });
  
  synthArr.forEach(v => {
    const binIdx = Math.min(Math.floor((v - min) / step), binsCount - 1);
    bins[binIdx].synth += 1;
  });
  
  return bins;
};

const PrivacyReportPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/privacy/report', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No privacy report found. Please run the audit script first.");
        }
        throw new Error("Failed to load privacy report.");
      }
      
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExport = () => {
    if (!reportData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "privacy_report.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>
        <Typography variant="h1" sx={{ mb: 2 }}>Privacy Report</Typography>
        <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchReport}>Retry</Button>
      </Box>
    );
  }

  if (!reportData) return null;

  const histogramData = buildHistogramData(
    reportData.nn_distance.real_to_real, 
    reportData.nn_distance.imputed_to_train
  );

  const isMiaSafe = reportData.mia.auc <= reportData.mia.target;
  const isDpSgdEnabled = reportData.dp_sgd.enabled;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h1" sx={{ mb: 1 }}>Privacy Report</Typography>
          <Typography variant="body1" color="text.secondary">
            Patient data protection audit · SafeImpute Internal
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<LockOpenOutlined />} color="success" sx={{ fontWeight: 600 }}>
            Audit generated at {new Date(reportData.timestamp).toLocaleTimeString()}
          </Button>
          <Button variant="contained" color="primary" startIcon={<DownloadOutlined />} onClick={handleExport}>
            Export report
          </Button>
        </Box>
      </Box>

      {/* Main Banner */}
      <Box sx={{ 
        bgcolor: isMiaSafe ? 'success.light' : 'warning.light', 
        color: isMiaSafe ? 'success.dark' : 'warning.dark', 
        borderRadius: 3, p: 3, mb: 4, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: '1px solid', borderColor: isMiaSafe ? 'success.main' : 'warning.main'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: isMiaSafe ? 'success.main' : 'warning.main', color: 'white', p: 1, borderRadius: 2, display: 'flex' }}>
            {isMiaSafe ? <CheckCircle /> : <WarningAmber />}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>Privacy checks {isMiaSafe ? 'passed' : 'failed'}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {isMiaSafe 
                ? "No patient can be re-identified from this model, and no training record was memorized."
                : "The model may have memorized training records."}
            </Typography>
          </Box>
        </Box>
        <Chip 
          icon={isMiaSafe ? <CheckCircle fontSize="small" sx={{ color: 'success.main' }} /> : <WarningAmber fontSize="small" sx={{ color: 'warning.main' }} />} 
          label={isMiaSafe ? "All clear" : "Review required"} 
          variant="outlined" 
          sx={{ bgcolor: 'white', borderColor: isMiaSafe ? 'success.main' : 'warning.main', color: isMiaSafe ? 'success.dark' : 'warning.dark', fontWeight: 600 }} 
        />
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
                {isMiaSafe ? (
                  <Chip label="Safe" size="small" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }} icon={<CheckCircle fontSize="small" />} />
                ) : (
                  <Chip label="Warning" size="small" sx={{ bgcolor: 'warning.light', color: 'warning.dark', fontWeight: 600 }} icon={<WarningAmber fontSize="small" />} />
                )}
              </Box>
              
              <Box sx={{ height: 160, position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={[{ value: reportData.mia.auc * 100 }, { value: (1 - reportData.mia.auc) * 100 }]} 
                      cx="50%" cy="100%" startAngle={180} endAngle={0} 
                      innerRadius={80} outerRadius={100} stroke="none" dataKey="value"
                    >
                      <Cell fill={isMiaSafe ? "#10b981" : "#f59e0b"} />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', bottom: 10, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{reportData.mia.auc.toFixed(3)}</Typography>
                  <Typography variant="caption" sx={{ color: isMiaSafe ? 'success.main' : 'warning.main', fontWeight: 600 }}>≈ random</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 4, mb: 2 }}>
                <Typography variant="caption" color="text.disabled">0.50</Typography>
                <Typography variant="caption" color="text.disabled">1.0</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                Attack AUC <b>{reportData.mia.auc.toFixed(3)}</b> — {isMiaSafe ? "inside the safe zone" : "outside the safe zone"} around {reportData.mia.target}.
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
                  Traceability (NN-Dist) <InfoOutlined sx={{ ml: 1, fontSize: 16, color: 'text.disabled' }} />
                </Typography>
                <Chip label="No copies" size="small" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }} icon={<CheckCircle fontSize="small" />} />
              </Box>
              
              <Box sx={{ height: 160, mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={histogramData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="real" stroke="#94a3b8" fill="#e2e8f0" strokeWidth={2} />
                    <Area type="monotone" dataKey="synth" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 4, bgcolor: '#94a3b8', mr: 1, borderRadius: 2 }} /> real → real
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 4, bgcolor: '#10b981', mr: 1, borderRadius: 2 }} /> imputed → train
                  </Typography>
                </Box>
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
                {isDpSgdEnabled ? (
                  <Chip label={`ε = ${reportData.dp_sgd.epsilon.toFixed(1)}`} size="small" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }} icon={<CheckCircle fontSize="small" />} />
                ) : (
                  <Chip label="DP-SGD Off" size="small" sx={{ bgcolor: 'grey.200', color: 'text.secondary', fontWeight: 600 }} />
                )}
              </Box>
              
              {isDpSgdEnabled ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Epsilon (ε)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{reportData.dp_sgd.epsilon.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Delta (δ)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{reportData.dp_sgd.delta}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Clipping Norm</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{reportData.dp_sgd.clipping_norm}</Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Model was not trained with Differential Privacy.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PrivacyReportPage;
