import { useState, forwardRef } from "react";
import { TextField, IconButton, InputAdornment, Box } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type PasswordFieldProps = Omit<TextFieldProps, "type"> & {
  label: string;
  required?: boolean;
};

export const PasswordField = forwardRef<HTMLDivElement, PasswordFieldProps>(
  ({ label, required = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
      setShowPassword((prev) => !prev);
    };

    const handleMouseDownPassword = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
    };

    return (
      <TextField
        {...props}
        ref={ref}
        type={showPassword ? "text" : "password"}
        label={
          <Box component="span">
            {label}{" "}
            {required && (
              <Box component="span" sx={{ color: "error.main" }}>
                *
              </Box>
            )}
          </Box>
        }
        InputProps={{
          ...props.InputProps,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  },
);

PasswordField.displayName = "PasswordField";
