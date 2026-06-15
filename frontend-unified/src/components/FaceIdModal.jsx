import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { X, CheckCircle, XCircle } from "@phosphor-icons/react";
import Webcam from "react-webcam";
import {
  loadFaceApiModels,
  extractFaceDescriptor,
} from "../services/faceAuthService";

const teal = "#1a7a5e";

// ─── Animations ───────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const popIn = keyframes`
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1);   opacity: 1; }
`;

// ─── Styled Components ─────────────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;
  font-family: "DM Sans", "Helvetica Neue", sans-serif;
`;

const Modal = styled.div`
  background: white;
  border-radius: 18px;
  padding: 28px 32px 32px;
  width: 300px;
  height: 330px;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  position: relative;
  animation: ${slideUp} 0.28s cubic-bezier(0.34, 1.3, 0.64, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  &:hover {
    background: #e5e7eb;
    color: #1f2937;
  }
`;

const Title = styled.h2`
  font-size: 17px;
  font-weight: 600;
  color: #1a1f2e;
  margin: 0;
  letter-spacing: -0.01em;
`;

const ScannerOuter = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: #1e2330;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  & video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
  }
`;

const ScanLine = styled.div`
  position: absolute;
  left: 12%;
  right: 12%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    teal,
    #34d399,
    teal,
    transparent
  );
  z-index: 2;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
  animation: ${keyframes`
    0% { top: 15%; }
    50% { top: 85%; }
    100% { top: 15%; }
  `} 2.5s ease-in-out infinite;
`;

const ScanMsg = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  text-align: center;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ $value }) => $value}%;
  background: linear-gradient(90deg, ${teal}, #34d399);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ResultWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #1e2330;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: ${popIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const ResultMsg = styled.p`
  font-size: 15px;
  font-weight: 500;
  color: ${({ $success }) => ($success ? "#2eec70" : "#dc2626")};
  margin: 0;
`;

// ─── Composant React ───────────────────────────────────────────
const FaceIdModal = ({ open, onClose, onCapture }) => {
  // Tous les hooks sont appelés en premier, c'est obligatoire !
  const [status, setStatus] = useState("initializing");
  const [scanProgress, setScanProgress] = useState(0);
  const [localError, setLocalError] = useState("");
  const webcamRef = useRef(null);

  useEffect(() => {
    // Si la modale est fermée, on ne lance pas la caméra, on s'arrête là.
    if (!open) return;

    let isMounted = true;

    const performScan = async () => {
      try {
        if (isMounted) setStatus("initializing");

        await loadFaceApiModels();
        if (isMounted) setStatus("scanning");

        const progressInterval = setInterval(() => {
          setScanProgress((prev) => (prev < 85 ? prev + 10 : 85));
        }, 500);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        const faceDescriptor = await extractFaceDescriptor(webcamRef);

        clearInterval(progressInterval);

        if (isMounted) {
          setScanProgress(100);
          setStatus("success");
          setTimeout(() => {
            onCapture(faceDescriptor);
          }, 1500);
        }
      } catch (err) {
        if (isMounted) {
          setStatus("failed");
          setLocalError(err.message || "Failed to detect face.");
          setTimeout(() => {
            setStatus("scanning");
            setLocalError("");
          }, 3000);
        }
      }
    };

    performScan();

    return () => {
      isMounted = false;
    };
  }, [open, onCapture]); // On a ajouté `open` dans les dépendances

  const handleClose = () => {
    setStatus("initializing");
    setScanProgress(0);
    onClose();
  };

  // Le return anticipé est maintenant placé APRES tous les hooks
  if (!open) return null;

  return (
    <Overlay>
      <Modal>
        <CloseBtn onClick={handleClose} aria-label="Fermer">
          <X size={14} weight="bold" />
        </CloseBtn>

        <Title>Face ID Authentication</Title>

        {/* ── Initialisation (Chargement Modèles) ── */}
        {status === "initializing" && (
          <>
            <ScannerOuter>
              <div style={{ color: "white", fontSize: "12px" }}>
                Loading AI Models...
              </div>
            </ScannerOuter>
            <ScanMsg>Please wait...</ScanMsg>
            <ProgressTrack>
              <ProgressFill $value={0} />
            </ProgressTrack>
          </>
        )}

        {/* ── Scanning (Webcam Active) ── */}
        {status === "scanning" && (
          <>
            <ScannerOuter>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "user",
                  width: 400,
                  height: 400,
                }}
              />
              <ScanLine />
            </ScannerOuter>
            <ScanMsg>
              {localError || "Look directly at the camera. Hold still..."}
            </ScanMsg>
            <ProgressTrack>
              <ProgressFill $value={scanProgress} />
            </ProgressTrack>
          </>
        )}

        {/* ── Succès ── */}
        {status === "success" && (
          <>
            <ScannerOuter>
              <ResultWrap>
                <CheckCircle size={56} color="#2eec70" weight="fill" />
              </ResultWrap>
            </ScannerOuter>
            <ResultMsg $success>Identity verified</ResultMsg>
            <ProgressTrack>
              <ProgressFill $value={100} />
            </ProgressTrack>
          </>
        )}

        {/* ── Échec ── */}
        {status === "failed" && (
          <>
            <ScannerOuter>
              <ResultWrap>
                <XCircle size={56} color="#ef4444" weight="fill" />
              </ResultWrap>
            </ScannerOuter>
            <ResultMsg>{localError}</ResultMsg>
            <ProgressTrack>
              <ProgressFill $value={0} />
            </ProgressTrack>
          </>
        )}
      </Modal>
    </Overlay>
  );
};

export default FaceIdModal;
