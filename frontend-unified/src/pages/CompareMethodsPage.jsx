import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
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

const PatientHeader = () => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, bgcolor: "background.paper", p: 2, borderRadius: 3, border: "1px solid #e2e8f0" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <IconButton sx={{ border: "1px solid #e2e8f0" }}>
        <ArrowLeft size={20} />
      </IconButton>
      <Avatar sx={{ bgcolor: "#d1fae5", color: "#059669", width: 40, height: 40, fontWeight: 600, fontSize: "1rem" }}>
        F64
      </Avatar>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h3" sx={{ fontSize: "1.125rem" }}>PT-10482</Typography>
          <Chip
            icon={<WarningCircle size={14} color="#d97706" />}
            label="Needs review"
            size="small"
            sx={{ bgcolor: "#fef3c7", color: "#d97706", fontWeight: 600, fontSize: "0.75rem", height: 24, border: "none" }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          64F · Day 2 · Sepsis · ICU · MIMIC-IV demo
        </Typography>
      </Box>
    </Box>
    <Button variant="outlined" endIcon={<ArrowsLeftRight />} sx={{ borderRadius: "100px", color: "primary.main", borderColor: "primary.main", "&:hover": { borderColor: "primary.dark", bgcolor: "#10b98110" } }}>
      Switch patient
    </Button>
  </Box>
);

const HighlightBanner = () => (
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
          <Typography variant="h4" sx={{ color: "text.secondary", ml: 1 }}>0.458 RMSE</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Lowest error of all four — <strong style={{ color: "#0f172a" }}>4% better</strong> than the next method (<strong>k-NN</strong>, 0.477).
        </Typography>
      </Box>
      <Button variant="outlined" startIcon={<ArrowDown />} size="small" sx={{ borderRadius: 2, color: "text.secondary", borderColor: "#e2e8f0" }}>
        Lower RMSE is better
      </Button>
    </CardContent>
  </Card>
);

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
        {/* Background track */}
        <Box sx={{ width: "100%", height: 24, bgcolor: "#f1f5f9", borderRadius: 1, position: "relative" }}>
          {/* Colored bar */}
          <Box sx={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${percent}%`, bgcolor: color, borderRadius: 1, transition: "width 1s ease-in-out" }} />
        </Box>
      </Box>
      
      <Typography variant="h5" sx={{ width: 50, textAlign: "right" }}>
        {value.toFixed(3)}
      </Typography>
    </Box>
  );
};

const AccuracyCard = () => {
  const maxVal = 0.8; // arbitrary max scale to show visual differences

  return (
    <Card sx={{ borderTop: "none" }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
          <Typography variant="h3">Accuracy across the held-out test set</Typography>
          <Typography variant="body2" color="text.secondary">average RMSE · n = 421</Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <MethodRow rank={1} name="Transformer" color="#0f766e" isModel={true} value={0.458} maxVal={maxVal} />
          <MethodRow rank={2} name="k-NN" color="#3b82f6" value={0.477} maxVal={maxVal} />
          <MethodRow rank={3} name="MICE" color="#8b5cf6" value={0.503} maxVal={maxVal} />
          <MethodRow rank={4} name="Mean" color="#94a3b8" value={0.688} maxVal={maxVal} />
        </Box>
      </CardContent>
    </Card>
  );
};

const CompareMethodsPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <PatientHeader />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ mb: 1 }}>Compare Methods</Typography>
        <Typography variant="body1" color="text.secondary">
          The model vs MICE, k-NN and Mean — predictions for this patient, scored against a held-out test set
        </Typography>
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

      <HighlightBanner />
      <AccuracyCard />
      
    </Box>
  );
};

export default CompareMethodsPage;
