
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.448fa2e9e7664ec7a928e6759e7082eb',
  appName: 'controle-financeiro-w3',
  webDir: 'dist',
  server: {
    url: 'https://448fa2e9-e766-4ec7-a928-e6759e7082eb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
