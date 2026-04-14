import { useEffect } from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { PermissionProvider } from './src/context/PermissionContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PermissionProvider>
          <AppNavigator />
        </PermissionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}