import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { palette, radius, spacing, typography } from '@/src/constants/theme';
import { initializeDatabase } from '@/src/database/database';
import { initializeStorage } from '@/src/services/storage.service';

export default function RootLayout() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const initialize = useCallback(async () => {
    try {
      setStatus('loading');
      initializeStorage();
      await initializeDatabase();
      setStatus('ready');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao inicializar o armazenamento local.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {status === 'ready' ? (
          <>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ animation: 'none' }} />
              <Stack.Screen name="highlights" options={{ animation: 'none' }} />
              <Stack.Screen name="profile" options={{ animation: 'none' }} />
              <Stack.Screen name="reader/[bookId]" options={{ animation: 'fade' }} />
            </Stack>
            <StatusBar style="dark" />
          </>
        ) : (
          <View style={styles.stateContainer}>
            {status === 'loading' ? (
              <>
                <ActivityIndicator size="small" color={palette.accent} />
                <Text style={styles.stateText}>Preparando sua biblioteca…</Text>
              </>
            ) : (
              <>
                <Text style={styles.errorTitle}>Não foi possível abrir a biblioteca</Text>
                <Text style={styles.stateText}>{message}</Text>
                <Pressable onPress={() => void initialize()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.paper },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: palette.paper,
  },
  errorTitle: { color: palette.ink, fontSize: typography.title, fontWeight: '600', textAlign: 'center' },
  stateText: { color: palette.muted, fontSize: typography.body, lineHeight: 24, textAlign: 'center' },
  retryButton: {
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accent,
  },
  retryText: { color: palette.surface, fontSize: typography.body, fontWeight: '600' },
});
