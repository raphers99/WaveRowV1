import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.waverow.app',
  appName: 'WaveRow',
  webDir: 'out',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    Keyboard: {
      hideFormAccessoryBar: true,
      resize: 'body' as const,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#006747',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark' as const,
      backgroundColor: '#FAFAF8',
    },
  },
};

export default config;
