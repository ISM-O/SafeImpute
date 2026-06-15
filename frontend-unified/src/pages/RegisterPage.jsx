import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { Warning, CheckCircle } from "@phosphor-icons/react";

import AuthCard from "../components/AuthCard";
import AuthField from "../components/AuthField";
import FaceIdButton from "../components/FaceIdButton";
import FaceIdModal from "../components/FaceIdModal";
import authService from "../services/authService";
import { useAuth } from "../hooks/useAuth";

// --- Styled Components ---
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const StepIndicator = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #1a7a5e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
  text-align: center;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: #1a7a5e;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.2s,
    transform 0.1s;
  margin-top: 10px;

  &:hover:not(:disabled) {
    background: #155f49;
  }
  &:active:not(:disabled) {
    transform: scale(0.985);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SecondaryBtn = styled(SubmitBtn)`
  background: white;
  color: #192343;
  border: 1.5px solid #d1d9e0;

  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  & > * {
    margin-top: 0;
  }
`;

const ErrorMsg = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #f87171;
  border-radius: 8px;
  font-size: 13px;
  color: #dc2626;
  margin-bottom: 16px;
`;

const TextCenter = styled.div`
  text-align: center;
  font-size: 14px;
  color: #5a5e65;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const SummaryBox = styled.div`
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  font-size: 13px;
  color: #38445b;
  margin-bottom: 20px;
`;

const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FooterText = styled.div`
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: #5a5e65;
`;

const StyledLink = styled(Link)`
  font-size: 13px;
  color: #1a7a5e;
  text-decoration: none;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
  }
`;

// --- Composant Principal ---
const RegisterPage = () => {
  const navigate = useNavigate();
  const { login, setAuthError } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    nom_complet: "",
    email: "",
    password: "",
    confirmPassword: "",
    faceDescriptor: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

  const steps = ["Account Details", "Face ID Enrollment", "Confirmation"];

  const validateStep0 = () => {
    const newErrors = {};

    if (!formData.nom_complet) {
      newErrors.nom_complet = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    if (activeStep === 0) {
      if (validateStep0()) {
        setActiveStep(1);
        setApiError(null);
      }
    }
  };

  const handleFaceCapture = async (faceDescriptor) => {
    setFormData((prev) => ({
      ...prev,
      faceDescriptor: Array.from(faceDescriptor),
    }));
    setFaceModalOpen(false);
    setActiveStep(2);
  };

  const handleRegister = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await authService.register({
        nom_complet: formData.nom_complet,
        email: formData.email,
        password: formData.password,
        face_descriptor: formData.faceDescriptor,
        is_admin: false,
        view_only: true,
        view_and_edit: false,
        is_superadmin: false,
      });

      login(response.user, response.access_token);
      navigate("/home");
    } catch (error) {
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.detail || "Registration failed. Please try again.";
      setApiError(errorMsg);
      setAuthError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthCard title="Create Account" subtitle="Sign up with your work email">
        {apiError && (
          <ErrorMsg>
            <Warning size={20} weight="fill" />
            {apiError}
          </ErrorMsg>
        )}

        <StepIndicator>
          Step {activeStep + 1} of 3: {steps[activeStep]}
        </StepIndicator>

        {/* Step 0: Account Details */}
        {activeStep === 0 && (
          <Form onSubmit={handleNextStep}>
            <AuthField
              name="nom_complet"
              label="Full name"
              value={formData.nom_complet}
              onChange={handleInputChange}
              error={errors.nom_complet}
              helperText={errors.nom_complet}
              disabled={loading}
            />

            <AuthField
              name="email"
              label="Work email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              helperText={errors.email}
              disabled={loading}
            />

            <AuthField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              helperText={errors.password}
              disabled={loading}
            />

            <AuthField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
            />

            <SubmitBtn type="submit" disabled={loading}>
              Next: Enroll Face ID
            </SubmitBtn>
          </Form>
        )}

        {/* Step 1: Face ID Enrollment */}
        {activeStep === 1 && (
          <div>
            <TextCenter>
              Let's set up your Face ID for secure authentication. You can skip
              this step and configure it later in your dashboard.
            </TextCenter>

            <FaceIdButton
              onClick={() => setFaceModalOpen(true)}
              disabled={loading}
            />

            <ButtonGroup>
              <SecondaryBtn onClick={() => setActiveStep(2)} disabled={loading}>
                Skip
              </SecondaryBtn>
              <SubmitBtn
                onClick={() => setActiveStep(2)}
                disabled={!formData.faceDescriptor || loading}
              >
                Continue
              </SubmitBtn>
            </ButtonGroup>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {activeStep === 2 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <CheckCircle
                size={48}
                color="#10B981"
                weight="fill"
                style={{ marginBottom: "8px" }}
              />
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#192343",
                }}
              >
                Ready to go!
              </div>
            </div>

            <SummaryBox>
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: "12px",
                  color: "#1a7a5e",
                }}
              >
                Account Summary
              </div>
              <SummaryItem>
                <CheckCircle size={16} color="#10B981" />
                Name: {formData.nom_complet}
              </SummaryItem>
              <SummaryItem>
                <CheckCircle size={16} color="#10B981" />
                Email: {formData.email}
              </SummaryItem>
              <SummaryItem>
                <CheckCircle
                  size={16}
                  color={formData.faceDescriptor ? "#10B981" : "#94A3B8"}
                />
                Face ID: {formData.faceDescriptor ? "Enrolled" : "Skipped"}
              </SummaryItem>
            </SummaryBox>

            <SubmitBtn onClick={handleRegister} disabled={loading}>
              {loading ? "Creating Account..." : "Complete Registration"}
            </SubmitBtn>
          </div>
        )}

        {/* Footer Link (Only visible on step 0) */}
        {activeStep === 0 && (
          <FooterText>
            Already have an account?{" "}
            <StyledLink to="/login">Sign in</StyledLink>
          </FooterText>
        )}
      </AuthCard>

      <FaceIdModal
        open={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onCapture={handleFaceCapture}
        title="Enroll Face ID"
        mode="register"
      />
    </>
  );
};

export default RegisterPage;
