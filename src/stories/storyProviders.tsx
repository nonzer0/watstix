import type { Decorator } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import Toaster from '../components/Toaster';

export const mockAuthContext = {
  user: null,
  session: null,
  loading: false,
  signIn: fn(async () => ({ error: null })),
  signUp: fn(async () => ({ error: null })),
  signOut: fn(async () => {}),
  resetPassword: fn(async () => ({ error: null })),
  updatePassword: fn(async () => ({ error: null })),
};

/** Router, auth, confirm and toast hosts — what App.tsx provides at runtime. */
export function withAppProviders(path = '/', initialEntry = path): Decorator {
  return (Story) => (
    <AuthContext.Provider value={mockAuthContext}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path={path} element={<Story />} />
          <Route path="*" element={<Story />} />
        </Routes>
        <ConfirmDialog />
        <Toaster />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}
