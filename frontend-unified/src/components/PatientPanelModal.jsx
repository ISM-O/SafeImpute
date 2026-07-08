import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogContent, Box, Typography, Button, IconButton,
  Switch, TextField, Chip, CircularProgress, Tooltip
} from '@mui/material';
import { Close, Storage, CheckCircle, WarningAmber, PlayArrow, UploadFile, ScienceOutlined } from '@mui/icons-material';

import { CLINICAL_FEATURES } from '../utils/constants';

const PatientPanelModal = ({ open, onClose, patient }) => {
  const [patientId, setPatientId] = useState('');
  const [observedData, setObservedData] = useState({});
  const [imputeMask, setImputeMask] = useState(new Set(CLINICAL_FEATURES.map(f => f.id))); // Impute missing by default
  const [isImputing, setIsImputing] = useState(false);
  const [imputationResults, setImputationResults] = useState(null);
  const [viewState, setViewState] = useState('input'); // 'input' or 'results'
  const fileInputRef = useRef(null);

  // Reset state when patient changes or modal opens
  useEffect(() => {
    if (open && patient) {
      setPatientId(patient.id === 'New Patient' ? '' : patient.id);
      
      const initObserved = patient.observedData || {};
      setObservedData(initObserved);
      
      const initResults = patient.imputationResults || null;
      setImputationResults(initResults);
      
      const newMask = new Set();
      if (initResults && initResults.imputed) {
        CLINICAL_FEATURES.forEach(f => {
           // If it was observed
           if (initObserved[f.id] !== undefined && initObserved[f.id] !== '') {
             newMask.add(f.id);
           }
           // If it was imputed, it was selected for imputation
           else if (initResults.imputed[f.id] !== undefined) {
             newMask.add(f.id);
           }
           // Otherwise it was unchecked (ignored)
        });
        setImputeMask(newMask);
        setViewState('results');
      } else {
        setImputeMask(new Set(CLINICAL_FEATURES.map(f => f.id)));
        setViewState('input');
      }
    }
  }, [open, patient]);

  const handleToggleImpute = (featureId) => {
    setImputeMask(prev => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  const handleValueChange = (featureId, value) => {
    setObservedData(prev => ({
      ...prev,
      [featureId]: value
    }));
  };

  const getStatus = (feature, value) => {
    if (value === '' || value === undefined) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (num < feature.refMin) return { label: 'Low', color: 'warning' };
    if (num > feature.refMax) return { label: 'High', color: 'warning' };
    return { label: 'In range', color: 'success' };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length > 1) {
        const isPsv = file.name.toLowerCase().endsWith('.psv');
        const separator = isPsv ? '|' : ',';
        const headers = lines[0].split(separator).map(h => h.trim());

        // Auto-extract patient ID from filename for new patients
        if (patient.id === 'New Patient') {
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          setPatientId(fileNameWithoutExt);
        }

        const newObserved = { ...observedData };

        // Loop through all rows to get the latest non-NaN value for each feature
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(separator).map(v => v.trim());
          headers.forEach((header, index) => {
            if (values[index] && values[index].toLowerCase() !== 'nan' && CLINICAL_FEATURES.some(f => f.id === header)) {
              newObserved[header] = values[index];
            }
          });
        }

        setObservedData(newObserved);
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  const handleReImpute = async () => {
    setIsImputing(true);
    setImputationResults(null);
    try {
      const token = localStorage.getItem('token');

      // Only include features that are both missing (no value) AND marked to be imputed
      const maskArray = Array.from(imputeMask).filter(id => {
        const val = observedData[id];
        return val === undefined || val === null || String(val).trim() === '';
      });

      const payload = {
        observed: Object.keys(observedData).reduce((acc, key) => {
          const val = observedData[key];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            acc[key] = parseFloat(val);
          }
          return acc;
        }, {}),
        mask: maskArray,
        patient_id: patientId || undefined
      };

      const response = await fetch('http://localhost:8000/impute/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Imputation failed');

      const data = await response.json();
      setImputationResults(data);
      setViewState('results');
    } catch (error) {
      console.error(error);
      alert('Imputation failed. Please check the backend server logs for the actual ML inference error.');
    } finally {
      setIsImputing(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}>
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography component="div" variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            SafeImpute &gt; Patients &gt;
            {patient.id === 'New Patient' ? (
              <TextField
                size="small"
                placeholder="Enter Patient ID"
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                sx={{ mx: 1, width: 150, '& .MuiInputBase-root': { height: 24, fontSize: '0.875rem' } }}
              />
            ) : (
              <span style={{ margin: '0 8px' }}>{patient.id}</span>
            )}
            &gt; <Box component="span" sx={{ fontWeight: 600, color: 'text.primary', ml: 1 }}>Patient Panel</Box>
          </Typography>
          <Chip icon={<Storage sx={{ fontSize: 16 }} />} label={patient.dataset || 'Custom'} size="small" variant="outlined" />
          <Chip icon={<ScienceOutlined sx={{ fontSize: 16 }} />} label="Transformer · loaded" size="small" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600, border: 'none' }} />
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 0, bgcolor: 'grey.50' }}>
        <Box sx={{ p: 3 }}>
          {CLINICAL_FEATURES.map((feature, idx) => {
            const rawValue = observedData[feature.id];
            const hasValue = rawValue !== undefined && rawValue !== '';
            const wantsToImpute = imputeMask.has(feature.id);
            const status = getStatus(feature, rawValue);

            const resultValue = imputationResults?.imputed?.[feature.id];
            const resultUncertainty = imputationResults?.uncertainty?.[feature.id];

            const isImputedState = !hasValue && wantsToImpute;
            const isIgnoredState = !hasValue && !wantsToImpute;

            return (
              <Box key={feature.id} sx={{
                display: 'flex', alignItems: 'center', py: 1.5, px: 2,
                bgcolor: isImputedState ? 'transparent' : 'background.paper',
                borderBottom: idx < CLINICAL_FEATURES.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                backgroundImage: isImputedState
                  ? 'repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 10px, #fafafa 10px, #fafafa 20px)'
                  : 'none',
              }}>
                <Box sx={{ width: 220 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{feature.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Ref {feature.refMin}-{feature.refMax}</Typography>
                </Box>

                <Box sx={{ width: 100, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{feature.unit}</Typography>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  {viewState === 'results' && isImputedState && resultValue !== undefined ? (
                    <Box textAlign="center" sx={{ width: 150 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {resultValue.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ± {resultUncertainty.toFixed(2)}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <TextField
                        size="small"
                        placeholder="--"
                        value={rawValue || ''}
                        onChange={(e) => handleValueChange(feature.id, e.target.value)}
                        sx={{ width: 100, bgcolor: 'background.paper' }}
                        inputProps={{ style: { textAlign: 'center', fontWeight: 600 } }}
                      />

                      {!hasValue && (
                        <Box sx={{ width: 130 }}>
                          {wantsToImpute ? (
                            <Typography variant="body2" sx={{ color: 'warning.main', fontStyle: 'italic', fontWeight: 600 }}>
                              ⚡ will be imputed
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic', fontWeight: 600 }}>
                              🚫 ignored
                            </Typography>
                          )}
                        </Box>
                      )}
                    </>
                  )}
                </Box>

                <Box sx={{ width: 120, display: 'flex', justifyContent: 'center' }}>
                  {status ? (
                    <Chip
                      icon={status.color === 'warning' ? <WarningAmber sx={{ fontSize: 16 }} /> : <CheckCircle sx={{ fontSize: 16 }} />}
                      label={status.label}
                      size="small"
                      sx={{ bgcolor: `${status.color}.light`, color: `${status.color}.dark`, fontWeight: 600, border: 'none' }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.disabled">--</Typography>
                  )}
                </Box>

                <Box sx={{ width: 150, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                  {!hasValue && (
                    <Tooltip title="Toggle whether the model should estimate this value">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color={wantsToImpute ? 'text.secondary' : 'text.disabled'}>
                          Impute?
                        </Typography>
                        <Switch
                          checked={wantsToImpute}
                          onChange={() => handleToggleImpute(feature.id)}
                          color="primary"
                          disabled={viewState === 'results'}
                        />
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </DialogContent>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.paper' }}>
        <Box
          sx={{
            flex: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2,
            display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer',
            '&:hover': { bgcolor: 'grey.50' }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadFile color="action" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Replace this panel from CSV / PSV</Typography>
            <Typography variant="caption" color="text.secondary">Drag a CSV or PSV here, or browse to overwrite these values.</Typography>
          </Box>
          <input
            type="file"
            accept=".csv,.psv"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </Box>

        {imputationResults && (
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Results available
          </Typography>
        )}

        <Button
          variant="outlined"
          color="primary"
          startIcon={isImputing ? <CircularProgress size={20} /> : <PlayArrow />}
          onClick={handleReImpute}
          disabled={isImputing}
          sx={{ borderRadius: 8, px: 3 }}
        >
          Re-impute
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={!imputationResults}
          onClick={() => setViewState(viewState === 'results' ? 'input' : 'results')}
          sx={{ borderRadius: 8, px: 3 }}
        >
          {viewState === 'results' ? 'Edit Inputs' : 'View results'}
        </Button>
      </Box>
    </Dialog>
  );
};

export default PatientPanelModal;
