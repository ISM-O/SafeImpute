import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import {
  ScienceOutlined,
  PsychologyOutlined,
  QueryStatsOutlined,
  ShieldOutlined
} from '@mui/icons-material';

const steps = [
  {
    label: 'Incomplete Patient Panel',
    description: `A clinician provides a patient's lab panel that contains missing analyte values. This is common due to incomplete testing or missing data.`,
    icon: <ScienceOutlined color="primary" />
  },
  {
    label: 'Masked Transformer Processing',
    description: `The panel is fed into our specialized AI model—a Masked Transformer. Similar to how Large Language Models predict missing words in a sentence, our model analyzes the relationships and correlations between the known lab values to contextually understand the patient's state.`,
    icon: <PsychologyOutlined color="primary" />
  },
  {
    label: 'Prediction with Confidence Scores',
    description: `The model accurately predicts the missing analytes. Crucially, it also generates a rigorous statistical confidence score for every prediction, allowing clinicians to know exactly how reliable the imputation is.`,
    icon: <QueryStatsOutlined color="primary" />
  },
  {
    label: 'Secure Local Inference',
    description: `All computations are performed locally. Your data never leaves your secure hospital network, and differential privacy ensures that the model cannot leak any sensitive training data.`,
    icon: <ShieldOutlined color="primary" />
  }
];

const HowItWorksModal = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight="bold">
          How SafeImpute Works
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" paragraph color="text.secondary">
          SafeImpute utilizes state-of-the-art deep learning to complete laboratory panels reliably and securely. Here is the step-by-step breakdown of what happens behind the scenes.
        </Typography>

        <Stepper orientation="vertical" sx={{ mt: 3 }}>
          {steps.map((step, index) => (
            <Step key={step.label} active={true}>
              <StepLabel icon={step.icon}>
                <Typography variant="h6" fontWeight="600">
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography color="text.secondary" sx={{ mb: 2 }}>{step.description}</Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>

      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained" size="large">
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HowItWorksModal;
