// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://depida.com',
  // 기존 정적 사이트와 동일하게 페이지마다 별도 폴더/파일로 출력
  build: {
    format: 'directory',
  },
  // 개발 서버(astro dev)를 cloudflare 터널(depida.cojimo.win) 뒤에서 구동
  server: {
    port: 4321,
    host: true,
  },
  vite: {
    server: {
      // 터널 호스트 허용 (미설정 시 "Blocked request" 차단됨)
      allowedHosts: ['depida.cojimo.win'],
      // HMR 웹소켓을 https 터널(wss/443) 경유로 연결
      hmr: {
        host: 'depida.cojimo.win',
        protocol: 'wss',
        clientPort: 443,
      },
    },
  },
});
