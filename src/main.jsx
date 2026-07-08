import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import App from './App.jsx';

// Configuración global de TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          1000 * 60 * 5, // 5 minutos antes de considerar datos como stale
      retry:              1,             // 1 reintento automático ante fallo
      refetchOnWindowFocus: false,       // No refrescar al volver al tab
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
