import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.ats',
  appName: 'etimeworking',
  webDir: 'www'
,
    android: {
       buildOptions: {
          keystorePath: '/Users/andres/Desktop/UOC/TFM/Mi_TFM/APP/etimeworking/etimeworking.jks',
          keystoreAlias: 'etimeworking',
       }
    }
  };

export default config;
