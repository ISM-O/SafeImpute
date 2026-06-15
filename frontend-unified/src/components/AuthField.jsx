import React, { useState } from "react";
import styled from "styled-components";
import { Eye, EyeSlash } from "@phosphor-icons/react";

const border = "#d1d9e0";
const textMid = "#38445b";
const textDark = "#020000";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 16px;
`;

const FloatingLabel = styled.label`
  position: absolute;
  left: 14px;
  top: ${({ $active }) => ($active ? "-8px" : "50%")};
  transform: ${({ $active }) =>
    $active ? "translateY(0)" : "translateY(-50%)"};
  font-size: ${({ $active }) => ($active ? "12px" : "14px")};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${textMid};
  background: white;
  padding: 0 4px;
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 1;
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  padding-right: ${({ $hasToggle }) => ($hasToggle ? "46px" : "16px")};
  font-size: 14px;
  color: ${textDark};
  background: ${({ $focused }) => ($focused ? "#f8fafc" : "white")};
  border: 1.5px solid
    ${({ $focused, $hasError }) =>
      $hasError ? "#ef4444" : $focused ? "#1a7a5e" : border};
  border-radius: 9px;
  outline: none;
  font-family: inherit;
  transition:
    border-color 0.2s,
    background 0.2s;

  &::placeholder {
    color: transparent;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ToggleBtn = styled.button`
  position: absolute;
  right: 13px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${textMid};
  display: flex;
  align-items: center;
  padding: 0;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

const HelperText = styled.span`
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
  margin-left: 4px;
`;

const AuthField = ({
  label,
  type = "text",
  value,
  onChange,
  name,
  error,
  helperText,
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isActive = focused || (value && value.length > 0);
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <Wrapper>
      <FloatingLabel htmlFor={name} $active={isActive} $focused={focused}>
        {label}
      </FloatingLabel>
      <InputGroup>
        <StyledInput
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          $focused={focused}
          $hasError={!!error}
          $hasToggle={type === "password"}
          disabled={disabled}
          {...props}
        />
        {type === "password" && (
          <ToggleBtn
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            disabled={disabled}
          >
            {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
          </ToggleBtn>
        )}
      </InputGroup>
      {helperText && <HelperText>{helperText}</HelperText>}
    </Wrapper>
  );
};

export default AuthField;
