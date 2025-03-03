import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lyn.bh',
  appName: 'lyn-bh',
  webDir: 'dist'
,
    android: {
       buildOptions: {
          keystorePath: '/home/ishad/project/lyn-bh/lynbh-release-key.jks',
          keystoreAlias: 'lynbh',
       }
    },
  };

export default config;
