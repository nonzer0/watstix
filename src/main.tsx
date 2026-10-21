import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { applyTheme, readThemePreference } from './utils/theme';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './index.css';
import './tokens.css';
import './typography.css';

applyTheme(readThemePreference());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
