import type { CapacitorConfig } from '@capacitor/cli';

const isDevServer = process.env.CAPACITOR_DEV_SERVER === 'true';

const config: CapacitorConfig = {
  appId: 'com.waverow.app',
  appName: 'WaveRow',
  webDir: 'out',
  ...(isDevServer
    ? {
        server: {
          url: 'http://172.20.10.2:3000', // changed from localhost to local IP for device access
          cleartext: true,
          androidScheme: 'https',
        },
      }
    : {}),
  plugins: {
    Keyboard: {
      hideFormAccessoryBar: false,
      resize: 'native' as const,
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 0,   // show native splash as briefly as possible
      launchAutoHide: false,   // we call SplashScreen.hide() manually in JS
      backgroundColor: '#006747',
    },
    StatusBar: {
      style: 'dark' as const,
      backgroundColor: '#FAFAF8',
    },
  },
};

export default config;
