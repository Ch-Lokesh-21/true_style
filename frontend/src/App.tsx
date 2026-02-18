import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './app/store';
import { queryClient } from './lib/queryClient';
import { AppRoutes } from './app/routes';
import { ToastProvider } from './lib/toast';
import { AuthProvider } from './components/AuthProvider/AuthProvider';

export const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
};
