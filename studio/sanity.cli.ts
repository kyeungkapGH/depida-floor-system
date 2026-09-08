import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // 배포 주소: https://depida-floor-system.sanity.studio
  studioHost: 'depida-floor-system',
  deployment: {
    appId: 'ed402h9603yskgbvkhc8d5a3',
  },
  // 개발 중 Cloudflare 터널(HTTPS)로 접속하기 위해 해당 호스트를 허용
  vite: (config) => ({
    ...config,
    server: {
      ...config.server,
      allowedHosts: ['.cojimo.win'],
    },
  }),
})
