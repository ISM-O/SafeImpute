import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  CircularProgress
} from "@mui/material";
import {
  ArrowLeft,
  ArrowsLeftRight,
  LockKey,
  ArrowsClockwise,
  Columns,
  Export,
  WarningCircle,
  CheckCircle,
} from "@phosphor-icons/react";
import { CLINICAL_FEATURES } from '../utils/constants';

const PatientHeader = ({ patient, patients, onSelectPatient }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  if (!patient) return null;

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, bgcolor: "background.paper", p: 2, borderRadius: 3, border: "1px solid #e2e8f0" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton sx={{ border: "1px solid #e2e8f0" }}>
          <ArrowLeft size={20} />
        </IconButton>
        <Avatar sx={{ bgcolor: "#d1fae5", color: "#059669", width: 40, height: 40, fontWeight: 600, fontSize: "1rem" }}>
          {patient.demographics === "Unknown" ? "?" : patient.demographics.substring(0, 3)}
        </Avatar>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h3" sx={{ fontSize: "1.125rem" }}>{patient.id}</Typography>
            <Chip
              icon={<CheckCircle size={14} color="#059669" />}
              label="Imputed"
              size="small"
              sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 600, fontSize: "0.75rem", height: 24, border: "none" }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {patient.demographics} · {patient.dataset}
          </Typography>
        </Box>
      </Box>
      <Button 
        variant="outlined" 
        endIcon={<ArrowsLeftRight />} 
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ borderRadius: "100px", color: "primary.main", borderColor: "primary.main", "&:hover": { borderColor: "primary.dark", bgcolor: "#10b98110" } }}
      >
        Switch patient
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {patients.map(p => (
          <MenuItem 
            key={p.id} 
            selected={p.id === patient.id}
            onClick={() => {
              onSelectPatient(p);
              setAnchorEl(null);
            }}
          >
            {p.id}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const LegendBanner = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 4, p: 2, bgcolor: "background.paper", border: "1px solid #e2e8f0", borderRadius: 3, mb: 4, flexWrap: "wrap" }}>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>How to read each band</Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", position: "relative", width: 24, height: 12 }}>
        <Box sx={{ width: "100%", height: 4, bgcolor: "#d1fae5", borderRadius: 2, position: "absolute", top: 4 }} />
        <Box sx={{ width: 8, height: 8, bgcolor: "#10b981", borderRadius: "50%", position: "absolute", left: 8, top: 2, border: "2px solid white" }} />
      </Box>
      <Typography variant="body2"><strong style={{ color: "#059669" }}>Narrow + green</strong> — confident</Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", position: "relative", width: 32, height: 12 }}>
        <Box sx={{ width: "100%", height: 4, bgcolor: "#fef3c7", borderRadius: 2, position: "absolute", top: 4 }} />
        <Box sx={{ width: 8, height: 8, bgcolor: "#f59e0b", borderRadius: "50%", position: "absolute", left: 12, top: 2, border: "2px solid white" }} />
      </Box>
      <Typography variant="body2"><strong style={{ color: "#b45309" }}>Wide + amber</strong> — uncertain</Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 32, height: 16, border: "1px dashed #94a3b8", borderRadius: 1, background: "repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 2px, transparent 2px, transparent 4px)" }} />
      <Typography variant="body2">Shaded = clinical normal range</Typography>
    </Box>
  </Box>
);

const AnalyteCard = ({ feature, value, uncertainty }) => {
  // Compute bounds and ranges
  const rangeStart = value - (2 * uncertainty);
  const rangeEnd = value + (2 * uncertainty);
  const width = (4 * uncertainty).toFixed(2);
  
  // Base normal ranges from features
  const normalStart = feature.refMin;
  const normalEnd = feature.refMax;
  
  // Calculate rendering limits (min and max for the slider)
  // Ensure we show at least the normal range, and pad around the prediction range
  let min = Math.min(normalStart, rangeStart) * 0.9;
  let max = Math.max(normalEnd, rangeEnd) * 1.1;
  
  // If min max are same, pad them
  if (min === max) {
    min -= 10;
    max += 10;
  }

  const isAboveNormal = value > normalEnd;
  const isBelowNormal = value < normalStart;

  // Calculate percentages for visual slider
  const totalRange = max - min;
  const getPercent = (val) => ((val - min) / totalRange) * 100;
  
  const targetPct = Math.max(0, Math.min(100, getPercent(value)));
  const rangeStartPct = Math.max(0, Math.min(100, getPercent(rangeStart)));
  const rangeWidthPct = Math.max(0, Math.min(100, getPercent(rangeEnd))) - rangeStartPct;
  
  const normalStartPct = Math.max(0, Math.min(100, getPercent(normalStart)));
  const normalWidthPct = Math.max(0, Math.min(100, getPercent(normalEnd))) - normalStartPct;

  const isConfident = uncertainty < ((normalEnd - normalStart) * 0.25); // Just a rough heuristic for UI
  const colorBase = isConfident ? "#10b981" : "#f59e0b";
  const colorLight = isConfident ? "#d1fae5" : "#fef3c7";
  const colorText = isConfident ? "#059669" : "#b45309";

  return (
    <Card sx={{ borderTop: `4px solid ${colorBase}`, height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: "1.125rem", mb: 0.5 }}>{feature.name}</Typography>
            <Typography variant="body2" color="text.secondary">{feature.id} · imputed</Typography>
          </Box>
          <Chip
            icon={isConfident ? <CheckCircle weight="fill" size={14} /> : <WarningCircle weight="fill" size={14} />}
            label={isConfident ? "Confident" : "Uncertain"}
            size="small"
            sx={{ bgcolor: colorLight, color: colorText, fontWeight: 600, "& .MuiChip-icon": { color: colorText } }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h1" component="span" sx={{ fontSize: "3rem", fontWeight: 700 }}>
            {value.toFixed(1)}
          </Typography>
          <Typography variant="body1" component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
            {feature.unit}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          95% interval <strong style={{ color: colorText }}>[{rangeStart.toFixed(1)} – {rangeEnd.toFixed(1)}]</strong> · width {width} {feature.unit}
        </Typography>

        {/* Visual Slider */}
        <Box sx={{ position: "relative", height: 60, mb: 2 }}>
          {/* Base line */}
          <Box sx={{ position: "absolute", top: 20, left: 0, right: 0, height: 2, bgcolor: "#e2e8f0" }} />
          
          {/* Normal range shaded */}
          <Box sx={{ 
            position: "absolute", 
            top: 8, 
            left: `${normalStartPct}%`, 
            width: `${normalWidthPct}%`, 
            height: 26, 
            border: "1px dashed #94a3b8", 
            borderRadius: 1, 
            background: "repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 2px, transparent 2px, transparent 4px)" 
          }} />
          
          {/* Prediction range */}
          <Box sx={{ 
            position: "absolute", 
            top: 16, 
            left: `${rangeStartPct}%`, 
            width: `${rangeWidthPct}%`, 
            height: 10, 
            bgcolor: colorLight, 
            borderRadius: 5 
          }} />
          
          {/* Target dot */}
          <Box sx={{ 
            position: "absolute", 
            top: 13, 
            left: `${targetPct}%`, 
            width: 16, 
            height: 16, 
            bgcolor: "white", 
            border: `4px solid ${colorBase}`, 
            borderRadius: "50%",
            transform: "translateX(-50%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }} />
          
          {/* Min/Max labels */}
          <Typography variant="caption" sx={{ position: "absolute", top: 40, left: 0, color: "#94a3b8" }}>{min.toFixed(0)}</Typography>
          <Typography variant="caption" sx={{ position: "absolute", top: 40, right: 0, color: "#94a3b8" }}>{max.toFixed(0)}</Typography>
          <Typography variant="caption" sx={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", color: "#94a3b8" }}>{feature.unit}</Typography>
        </Box>

        {/* Simulated Distribution Chart */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 60 }}>
          <Box sx={{ flex: 1, position: "relative", height: "100%" }}>
            <Typography variant="caption" color="text.disabled" sx={{ position: "absolute", top: -10 }}>Predicted distribution</Typography>
            {/* SVG Bell Curve approximation */}
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: "100%", height: "100%", position: "absolute", bottom: 0 }}>
              <path d={`M 0,40 Q ${targetPct/2},40 ${targetPct},10 T 100,40`} fill={isConfident ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)"} stroke={colorBase} strokeWidth="1" strokeDasharray="2,2" />
              <line x1={targetPct} y1="10" x2={targetPct} y2="40" stroke={colorBase} strokeWidth="1" strokeDasharray="2,2" />
            </svg>
          </Box>
          <Box sx={{ textAlign: "right", ml: 2 }}>
            <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>Normal range</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>{normalStart}–{normalEnd}</Typography>
            {isAboveNormal && (
              <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 700, mt: 0.5, display: "block" }}>Above normal</Typography>
            )}
            {isBelowNormal && (
              <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 700, mt: 0.5, display: "block" }}>Below normal</Typography>
            )}
          </Box>
        </Box>

      </CardContent>
    </Card>
  );
};

const ImputationPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/patients/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Only keep patients that have imputed data
          const imputedPatients = data.filter(p => p.imputed_data && p.imputed_data.imputed);
          setPatients(imputedPatients);
          if (imputedPatients.length > 0) {
            setSelectedPatient(imputedPatients[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (patients.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto", textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">No imputed patients found</Typography>
        <Typography variant="body2" color="text.secondary">Run an imputation from the Overview or Patients page first.</Typography>
      </Box>
    );
  }

  // Get imputed features for selected patient
  const imputedDict = selectedPatient?.imputed_data?.imputed || {};
  const uncertaintyDict = selectedPatient?.imputed_data?.uncertainty || {};
  
  const imputedKeys = Object.keys(imputedDict);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <PatientHeader 
        patient={selectedPatient} 
        patients={patients} 
        onSelectPatient={setSelectedPatient} 
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 3 }}>
        <Box>
          <Typography variant="h1" sx={{ mb: 1 }}>Imputation Results</Typography>
          <Typography variant="body1" color="text.secondary">
            {imputedKeys.length} missing analytes predicted by the masked Transformer
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<LockKey />} sx={{ borderRadius: "100px", color: "text.secondary", borderColor: "#e2e8f0" }}>
            View only
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Columns />} 
            onClick={() => navigate('/compare-methods', { state: { patient: selectedPatient } })}
            sx={{ borderRadius: "100px", color: "primary.main", borderColor: "primary.main" }}
          >
            Compare methods
          </Button>
          <Button variant="contained" startIcon={<Export />} sx={{ borderRadius: "100px", bgcolor: "#e2e8f0", color: "#475569", boxShadow: "none", "&:hover": { bgcolor: "#cbd5e1", boxShadow: "none" } }}>
            Export
          </Button>
        </Box>
      </Box>

      <LegendBanner />

      <Grid container spacing={3}>
        {imputedKeys.map(key => {
          const featureDef = CLINICAL_FEATURES.find(f => f.id === key);
          if (!featureDef) return null;
          
          return (
            <Grid item xs={12} md={4} key={key}>
              <AnalyteCard
                feature={featureDef}
                value={imputedDict[key]}
                uncertainty={uncertaintyDict[key]}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ImputationPage;
