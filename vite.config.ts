import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function dorarProxy(): Plugin {
  return {
    name: 'dorar-proxy',
    configureServer(server) {
      server.middlewares.use('/api/dorar', async (req, res) => {
        const qs = (req.url || '').split('?')[1] || '';
        const target = `https://dorar.net/dorar_api.json?${qs}`;
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 20000);
          const r = await fetch(target, {
            signal: ctrl.signal,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
              Accept: 'application/json, text/plain, */*',
              'Accept-Language': 'ar,en;q=0.8',
              Referer: 'https://dorar.net/',
            },
          });
          clearTimeout(t);
          const body = await r.text();
          console.log(`[dorar] ${r.status} ${body.length} bytes`);
          res.statusCode = r.status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(body);
        } catch (e: any) {
          console.error('[dorar] FAILED:', e?.cause?.code || e?.message, e?.cause?.message || '');
          res.statusCode = 502;
          res.end(JSON.stringify({ error: String(e?.cause?.code || e?.message) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: { port: 3000, host: '0.0.0.0' },
    plugins: [react(), dorarProxy()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  };
});