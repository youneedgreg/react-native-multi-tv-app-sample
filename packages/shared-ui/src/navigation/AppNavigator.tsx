import React, { useEffect, StrictMode } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { Platform } from 'react-native';
import { MenuProvider } from '../components/MenuContext';
import { GoBackConfiguration } from '../app/remote-control/GoBackConfiguration';
import RootNavigator from './RootNavigator';
import { CheckinProvider, CheckinWatcher } from '../jirani/CheckinWatcher';

export interface AppNavigatorProps {
  fontsLoaded?: boolean;
  onReady?: () => void;
}

export default function AppNavigator({ fontsLoaded = true, onReady }: AppNavigatorProps) {
  useEffect(() => {
    // Import remote control config for TV platforms
    if (Platform.isTV) {
      try {
        require('../app/configureRemoteControl');
      } catch (error) {
        console.warn('Remote control configuration not available:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded && onReady) {
      onReady();
    }
  }, [fontsLoaded, onReady]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <StrictMode>
      <NavigationContainer theme={DarkTheme}>
        <MenuProvider>
          <CheckinProvider>
            <GoBackConfiguration />
            <CheckinWatcher />
            <RootNavigator />
          </CheckinProvider>
        </MenuProvider>
      </NavigationContainer>
    </StrictMode>
  );
}
