import { TextField } from "@mui/material";

const AuthTextField = ({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  helperText,
  placeholder,
  fullWidth = true,
  disabled = false,
  autoComplete,
  ...props
}) => {
  return (
    <TextField
      label={label}
      type={type}
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
      {...props}
    />
  );
};

export default AuthTextField;
