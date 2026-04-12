import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications, setCurrentPushToken } from '../lib/notifications';
import { api } from '../lib/api';
import { setupAutoSync } from '../lib/offline-api';
import { OfflineIndicator } from '../components/offline-indicator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Setup offline sync
    setupAutoSync();

    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(false);
      
      // Register for push notifications when user logs in
      if (user) {
        const token = await registerForPushNotifications();
        if (token) {
          try {
            // Send token to backend
            await api.post('/api/push-tokens', {
              token,
              deviceType: 'mobile',
            });
            setCurrentPushToken(token);
            console.log('Push token registered with backend');
          } catch (error) {
            console.error('Failed to register push token with backend:', error);
          }
        }
      } else {
        // User logged out - token cleanup is handled in logout function
        setCurrentPushToken(null);
      }
    });

    // Setup notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        
        // Handle notification routing
        const data = response.notification.request.content.data;
        if (data?.screen) {
          router.push(data.screen as any);
        } else if (data?.type === 'test') {
          router.push('/tests');
        } else if (data?.type === 'message') {
          router.push('/(tabs)/messages');
        } else if (data?.type === 'announcement') {
          router.push('/(tabs)/index');
        }
      }
    );

    return () => {
      unsubscribe();
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <StatusBar style="auto" />
        <OfflineIndicator />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
