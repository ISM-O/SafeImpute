import React from "react";
import styled from "styled-components";
import { Camera } from "@phosphor-icons/react";

const border = "#d1d9e0";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-top: 8px;
`;

const SeparatorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Line = styled.div`
  flex: 1;
  height: 1px;
  background: ${border};
`;

const OrText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.04em;
`;

const FaceIdBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px;
  background: white;
  border: 1.5px solid ${border};
  border-radius: 10px;
  color: #192343;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FaceIdButton = ({ onClick, loading, disabled }) => (
  <Wrapper>
    <SeparatorRow>
      <Line />
      <OrText>OR</OrText>
      <Line />
    </SeparatorRow>

    <FaceIdBtn type="button" onClick={onClick} disabled={disabled || loading}>
      <Camera size={20} color="currentColor" weight="regular" />
      {loading ? "Loading..." : "Sign in with Face ID"}
    </FaceIdBtn>
  </Wrapper>
);

export default FaceIdButton;
