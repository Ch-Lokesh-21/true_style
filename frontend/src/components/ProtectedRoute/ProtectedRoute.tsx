import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/store/hooks";
import { ROUTES } from "../../config/constants";
import { toast } from "react-toastify";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isInitializing } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();

  if (isInitializing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (
    allowedRoles &&
    user &&
    user.user_role &&
    !allowedRoles.includes(user.user_role)
  ) {
    toast.warning("You do not have permission to access this page", {
      position: "top-right",
      autoClose: 3000,
      toastId: "permission-denied",
    });
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};
