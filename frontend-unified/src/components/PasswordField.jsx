import { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Eye, EyeSlash } from "@phosphor-icons/react";

const PasswordField = ({
  label = "Password",
  value,
  onChange,
  onBlur,
  error,
  helperText,
  placeholder,
  fullWidth = true,
  disabled = false,
  autoComplete = "current-password",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <TextField
      label={label}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={!!error}
      helperText={helperText}
      placeholder={placeholder}
      fullWidth={fullWidth}
      disabled={disabled}
      autoComplete={autoComplete}
      variant="outlined"
      size="medium"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={handleTogglePassword}
              edge="end"
              disabled={disabled}
              size="small"
              sx={{ mr: 1 }}
            >
              {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

export default PasswordField;
