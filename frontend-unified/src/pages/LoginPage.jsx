import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { Warning } from "@phosphor-icons/react";

import AuthCard from "../components/AuthCard";
import AuthField from "../components/AuthField";
import FaceIdButton from "../components/FaceIdButton";
import FaceIdModal from "../components/FaceIdModal";
import authService from "../services/authService";
import { useAuth } from "../hooks/useAuth";

// --- Styled Components locaux pour la page ---
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const ForgotLink = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  margin-top: -4px;
`;

const StyledLink = styled(Link)`
  font-size: 13px;
  color: #1a7a5e;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
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

const FooterText = styled.div`
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: #5a5e65;
`;

// --- Composant Principal ---
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, setAuthError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [faceEmail, setFaceEmail] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      const response = await authService.loginWithPassword(
        formData.email,
        formData.password,
      );

      login(response.user, response.access_token);

      // Rediriger vers le dashboard admin ou utilisateur selon le rôle
      if (response.user?.is_superadmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.detail || "Login failed. Please try again.";
      setApiError(errorMsg);
      setAuthError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceIdClick = async () => {
    if (!formData.email) {
      setApiError("Please enter your email first to use Face ID");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setApiError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.checkEmail(formData.email);
      // Correspondance avec ton backend (face_id_enrolled)
      if (!response.face_id_enrolled) {
        setApiError(
          "Face ID is not enrolled for this email. Please register first.",
        );
        setLoading(false);
        return;
      }
      setFaceEmail(formData.email);
      setFaceModalOpen(true);
    } catch (error) {
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.detail || "Email verification failed.";
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceCapture = async (faceDescriptor) => {
    setFaceLoading(true);
    setApiError(null);

    try {
      const response = await authService.loginWithFace(
        faceEmail,
        Array.from(faceDescriptor),
      );

      login(response.user, response.access_token);
      setFaceModalOpen(false);

      // Rediriger vers le dashboard admin ou utilisateur selon le rôle
      if (response.user?.is_superadmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error) {
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.detail || "Face ID authentication failed.";
      setApiError(errorMsg);
      setAuthError(errorMsg);
    } finally {
      setFaceLoading(false);
    }
  };

  return (
    <>
      <AuthCard
        title="Sign in to Northwind Health"
        subtitle="Secure access for clinical staff."
      >
        {apiError && (
          <ErrorMsg>
            <Warning size={20} weight="fill" />
            {apiError}
          </ErrorMsg>
        )}

        <Form onSubmit={handlePasswordLogin}>
          <AuthField
            name="email"
            label="Work email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            helperText={errors.email}
            disabled={loading || faceLoading}
          />

          <AuthField
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            helperText={errors.password}
            disabled={loading || faceLoading}
          />

          <ForgotLink>
            <StyledLink to="/forgot-password">Forgot password?</StyledLink>
          </ForgotLink>

          <SubmitBtn type="submit" disabled={loading || faceLoading}>
            {loading ? "Signing in..." : "Sign in"}
          </SubmitBtn>
        </Form>

        <FaceIdButton
          onClick={handleFaceIdClick}
          loading={faceLoading}
          disabled={loading}
        />

        <FooterText>
          Vous n'avez pas de compte ?{" "}
          <StyledLink to="/register" style={{ fontWeight: 600 }}>
            S'inscrire ici
          </StyledLink>
        </FooterText>
      </AuthCard>

      <FaceIdModal
        open={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onCapture={handleFaceCapture}
      />
    </>
  );
};

export default LoginPage;
