import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
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

const LegendBanner = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 4, p: 2, bgcolor: "background.paper", border: "1px solid #e2e8f0", borderRadius: 3, mb: 4 }}>
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

const AnalyteCard = ({ title, sub, value, unit, interval, width, min, max, target, rangeStart, rangeEnd, normalStart, normalEnd, isAboveNormal }) => {
  // Calculate positions for the visual slider
  const totalRange = max - min;
  const getPercent = (val) => ((val - min) / totalRange) * 100;
  
  const targetPct = getPercent(target);
  const rangeStartPct = getPercent(rangeStart);
  const rangeWidthPct = getPercent(rangeEnd) - rangeStartPct;
  
  const normalStartPct = getPercent(normalStart);
  const normalWidthPct = getPercent(normalEnd) - normalStartPct;

  return (
    <Card sx={{ borderTop: "4px solid #10b981", height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: "1.125rem", mb: 0.5 }}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">{sub} · imputed</Typography>
          </Box>
          <Chip
            icon={<CheckCircle weight="fill" size={14} />}
            label="Confident"
            size="small"
            sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 600, "& .MuiChip-icon": { color: "#059669" } }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h1" component="span" sx={{ fontSize: "3rem", fontWeight: 700 }}>
            {value}
          </Typography>
          <Typography variant="body1" component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
            {unit}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          95% interval <strong style={{ color: "#059669" }}>[{rangeStart} – {rangeEnd}]</strong> · width {width} {unit}
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
            bgcolor: "#d1fae5", 
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
            border: "4px solid #10b981", 
            borderRadius: "50%",
            transform: "translateX(-50%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }} />
          
          {/* Min/Max labels */}
          <Typography variant="caption" sx={{ position: "absolute", top: 40, left: 0, color: "#94a3b8" }}>{min}</Typography>
          <Typography variant="caption" sx={{ position: "absolute", top: 40, right: 0, color: "#94a3b8" }}>{max}</Typography>
          <Typography variant="caption" sx={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", color: "#94a3b8" }}>{unit}</Typography>
        </Box>

        {/* Simulated Distribution Chart */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 60 }}>
          <Box sx={{ flex: 1, position: "relative", height: "100%" }}>
            <Typography variant="caption" color="text.disabled" sx={{ position: "absolute", top: -10 }}>Predicted distribution</Typography>
            {/* SVG Bell Curve approximation */}
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: "100%", height: "100%", position: "absolute", bottom: 0 }}>
              <path d={`M 0,40 Q ${targetPct/2},40 ${targetPct},10 T 100,40`} fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
              <line x1={targetPct} y1="10" x2={targetPct} y2="40" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
            </svg>
          </Box>
          <Box sx={{ textAlign: "right", ml: 2 }}>
            <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>Normal range</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>{normalStart}–{normalEnd}</Typography>
            {isAboveNormal && (
              <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 700, mt: 0.5, display: "block" }}>Above normal</Typography>
            )}
          </Box>
        </Box>

      </CardContent>
    </Card>
  );
};

// Extracted Avatar since it's used inside PatientHeader but wasn't imported.
import { Avatar } from "@mui/material";

const ImputationPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <PatientHeader />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 3 }}>
        <Box>
          <Typography variant="h1" sx={{ mb: 1 }}>Imputation Results</Typography>
          <Typography variant="body1" color="text.secondary">
            4 missing analytes predicted by the masked Transformer
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<LockKey />} sx={{ borderRadius: "100px", color: "text.secondary", borderColor: "#e2e8f0" }}>
            View only
          </Button>
          <Button variant="outlined" startIcon={<ArrowsClockwise />} sx={{ borderRadius: "100px", color: "primary.main", borderColor: "primary.main" }}>
            Re-run
          </Button>
          <Button variant="outlined" startIcon={<Columns />} sx={{ borderRadius: "100px", color: "primary.main", borderColor: "primary.main" }}>
            Compare methods
          </Button>
          <Button variant="contained" startIcon={<Export />} sx={{ borderRadius: "100px", bgcolor: "#e2e8f0", color: "#475569", boxShadow: "none", "&:hover": { bgcolor: "#cbd5e1", boxShadow: "none" } }}>
            Export
          </Button>
        </Box>
      </Box>

      <LegendBanner />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <AnalyteCard
            title="C-Reactive Protein"
            sub="CRP"
            value="196"
            unit="mg/L"
            interval="141 – 252"
            width="111.0"
            min={80}
            max={200}
            target={196}
            rangeStart={141}
            rangeEnd={200}
            normalStart={80}
            normalEnd={85}
            isAboveNormal={true}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AnalyteCard
            title="Procalcitonin"
            sub="PCT"
            value="12.3"
            unit="ng/mL"
            interval="8.7 – 16"
            width="7.3"
            min={0}
            max={18}
            target={12.3}
            rangeStart={8.7}
            rangeEnd={16}
            normalStart={0}
            normalEnd={0.5}
            isAboveNormal={true}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AnalyteCard
            title="Lactate"
            sub="Lac"
            value="4.9"
            unit="mmol/L"
            interval="3.6 – 6.3"
            width="2.7"
            min={0.5}
            max={5.5}
            target={4.9}
            rangeStart={3.6}
            rangeEnd={5.5}
            normalStart={0.5}
            normalEnd={2.2}
            isAboveNormal={true}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImputationPage;
