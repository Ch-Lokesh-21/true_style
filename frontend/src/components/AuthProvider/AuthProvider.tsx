import { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../app/store/hooks";
import {
  setAccessToken,
  logout,
  setInitializationComplete,
} from "../../app/store/slices/authSlice";
import { CircularProgress, Box } from "@mui/material";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { authService } from "../../features/auth/services/authService";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (hasInitialized.current) {
        return;
      }
      hasInitialized.current = true;

      if (!isAuthenticated) {
        try {
          const response = await authService.refreshToken();
          dispatch(setAccessToken(response.access_token));
        } catch (error) {
          dispatch(logout());

          const isNetworkError =
            error &&
            typeof error === "object" &&
            "request" in error &&
            !("response" in error);

          const axiosError = error as AxiosError<{ detail?: string }>;
          const errorMessage = axiosError.response?.data?.detail || "";
          const isNoCookieError = errorMessage === "No refresh cookie";

          if (!isNetworkError && !isNoCookieError) {
            toast.warning("Your session has expired. Please login again.", {
              position: "top-right",
              autoClose: 4000,
              toastId: "session-expired",
            });
          }
        }
      } else {
        dispatch(setInitializationComplete());
      }
      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};
