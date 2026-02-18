import { Navigate} from 'react-router-dom';
import { useAppSelector } from '../../app/store/hooks';
import { ROUTES } from '../../config/constants';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user) {
    const redirectPath = user.user_role === 'admin' ? ROUTES.ADMIN.HOME : ROUTES.HOME;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
