import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContextProvider from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Colors';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading assets or checking authentication
    const init = async () => {
      try {
        // Add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Initialization failed', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>EduConnect</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthContextProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
