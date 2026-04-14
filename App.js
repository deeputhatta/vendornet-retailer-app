import { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import {
  registerForPushNotifications,
  setupNotificationListeners
} from './src/utils/notifications';
import { saveNotification } from './src/screens/NotificationsScreen';

export default function App() {
  useEffect(() => {
    registerForPushNotifications();
    const cleanup = setupNotificationListeners(
      async notification => {
        const { title, body, data } = notification.request.content;
        await saveNotification(title, body, data || {});
      },
      response => console.log('Notification tapped:', response)
    );
    return cleanup;
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}