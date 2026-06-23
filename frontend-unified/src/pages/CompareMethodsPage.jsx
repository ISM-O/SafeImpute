import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem
} from "@mui/material";
import {
  ArrowLeft,
  ArrowsLeftRight,
  ArrowsClockwise,
  Export,
  WarningCircle,
  CheckCircle,
  LockKey,
  Info,
  ArrowDown,
} from "@phosphor-icons/react";

const PatientHeader = ({ patient, patients, onSelectPatient, navigate }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  if (!patient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, bgcolor: "background.paper", p: 2, borderRadius: 3, border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate('/imputation')} sx={{ border: "1px solid #e2e8f0" }}>
            <ArrowLeft size={20} />
          </IconButton>
          <Typography variant="body2" color="text.secondary">No patient selected</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, bgcolor: "background.paper", p: 2, borderRadius: 3, border: "1px solid #e2e8f0" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate('/imputation', { state: { patient } })} sx={{ border: "1px solid #e2e8f0" }}>
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

const HighlightBanner = ({ transformerRmse, nextBestRmse, nextBestName }) => {
  const percentBetter = Math.round(((nextBestRmse - transformerRmse) / nextBestRmse) * 100);
  
  return (
    <Card sx={{ mb: 4, borderTop: "none" }}>
      <CardContent sx={{ p: 3, display: "flex", alignItems: "flex-start", gap: 3 }}>
        <Box sx={{ bgcolor: "#10b981", color: "white", p: 2, borderRadius: 3, display: "flex" }}>
          <CheckCircle size={32} weight="fill" color="white" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.disabled", letterSpacing: "0.05em" }}>
              MOST ACCURATE METHOD · 421 HELD-OUT PATIENTS
            </Typography>
            <Info size={16} color="#94a3b8" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography variant="h2" sx={{ m: 0 }}>Transformer</Typography>
            <Chip label="OUR MODEL" size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: "#d1fae5", color: "#059669", borderRadius: 1 }} />
            <Typography variant="h4" sx={{ color: "text.secondary", ml: 1 }}>{transformerRmse.toFixed(3)} RMSE</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Lowest error of all four — <strong style={{ color: "#0f172a" }}>{percentBetter}% better</strong> than the next method (<strong>{nextBestName}</strong>, {nextBestRmse.toFixed(3)}).
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowDown />} size="small" sx={{ borderRadius: 2, color: "text.secondary", borderColor: "#e2e8f0" }}>
          Lower RMSE is better
        </Button>
      </CardContent>
    </Card>
  );
};

const MethodRow = ({ rank, name, color, isModel, value, maxVal }) => {
  const percent = (value / maxVal) * 100;
  
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
      <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, mr: 2 }}>
        {rank}
      </Box>
      <Typography variant="body1" sx={{ width: 120, fontWeight: 600, color: isModel ? "primary.main" : "text.primary" }}>
        {name}
      </Typography>
      
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", mr: 4 }}>
        <Box sx={{ width: "100%", height: 24, bgcolor: "#f1f5f9", borderRadius: 1, position: "relative" }}>
          <Box sx={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${percent}%`, bgcolor: color, borderRadius: 1, transition: "width 1s ease-in-out" }} />
        </Box>
      </Box>
      
      <Typography variant="h5" sx={{ width: 50, textAlign: "right" }}>
        {value.toFixed(3)}
      </Typography>
    </Box>
  );
};

const AccuracyCard = ({ metrics }) => {
  const methods = [
    { name: "Transformer", value: metrics.transformer_rmse, color: "#0f766e", isModel: true },
    { name: "k-NN", value: metrics.knn_rmse, color: "#3b82f6", isModel: false },
    { name: "MICE", value: metrics.mice_rmse, color: "#8b5cf6", isModel: false },
    { name: "Mean", value: metrics.mean_rmse, color: "#94a3b8", isModel: false }
  ].sort((a, b) => a.value - b.value);

  // Dynamically calculate maxVal based on the worst performing method to ensure bars fit
  const maxVal = Math.max(...methods.map(m => m.value)) * 1.1; 

  return (
    <Card sx={{ borderTop: "none" }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
          <Typography variant="h3">Accuracy across the held-out test set</Typography>
          <Typography variant="body2" color="text.secondary">average RMSE</Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {methods.map((m, idx) => (
            <MethodRow 
              key={m.name} 
              rank={idx + 1} 
              name={m.name} 
              color={m.color} 
              isModel={m.isModel} 
              value={m.value} 
              maxVal={maxVal} 
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const CompareMethodsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(location.state?.patient || null);
  
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch patients
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
          if (!selectedPatient && imputedPatients.length > 0) {
            setSelectedPatient(imputedPatients[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };
    fetchPatients();
  }, []);

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/evaluate/metrics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to fetch evaluation metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Determine next best method for the banner dynamically
  const methodsExcludingTransformer = [
    { name: "k-NN", value: metrics?.knn_rmse || 0.477 },
    { name: "MICE", value: metrics?.mice_rmse || 0.503 },
    { name: "Mean", value: metrics?.mean_rmse || 0.688 }
  ].sort((a, b) => a.value - b.value);
  
  const nextBest = methodsExcludingTransformer[0];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <PatientHeader 
        patient={selectedPatient} 
        patients={patients} 
        onSelectPatient={setSelectedPatient} 
        navigate={navigate} 
      />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ mb: 1 }}>Compare Methods</Typography>
        <Typography variant="body1" color="text.secondary">
          The model vs MICE, k-NN and Mean — predictions for this patient, scored against a held-out test set
        </Typography>
        {metrics?.is_from_cache && (
          <Chip 
            label="Showing static benchmark results (evaluation cache missing)" 
            size="small" 
            sx={{ mt: 1, bgcolor: "#fffbeb", color: "#b45309", border: "1px solid #fef3c7" }} 
          />
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 4 }}>
        <Button variant="outlined" startIcon={<LockKey />} sx={{ borderRadius: "100px", color: "text.secondary", borderColor: "#e2e8f0" }}>
          View & export
        </Button>
        <Button variant="outlined" startIcon={<ArrowsClockwise />} sx={{ borderRadius: "100px", color: "primary.main", borderColor: "primary.main" }}>
          Re-run models
        </Button>
        <Button variant="contained" startIcon={<Export />} sx={{ borderRadius: "100px", bgcolor: "#10b981", color: "white", boxShadow: "none", "&:hover": { bgcolor: "#059669", boxShadow: "none" } }}>
          Export
        </Button>
      </Box>

      {metrics && (
        <>
          <HighlightBanner 
            transformerRmse={metrics.transformer_rmse} 
            nextBestRmse={nextBest.value} 
            nextBestName={nextBest.name}
          />
          <AccuracyCard metrics={metrics} />
        </>
      )}
      
    </Box>
  );
};

export default CompareMethodsPage;
