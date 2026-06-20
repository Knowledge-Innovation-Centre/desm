const esbuild = require('esbuild');

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch');

// Shared config between the in-app bundle and the standalone-export bundle.
const baseConfig = {
  bundle: true,
  sourcemap: !isProduction, // Enable sourcemaps only for development
  minify: isProduction, // Minify for production
  target: 'es6',
  format: 'esm',
  jsx: 'automatic', // Enables React 17+ JSX Transform
  platform: 'browser',
  outdir: 'app/assets/builds',
  publicPath: '/assets',
  logLevel: 'info',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.ADMIN_ROLE_NAME': JSON.stringify(process.env.ADMIN_ROLE_NAME || null),
    'process.env.MIN_PASSWORD_LENGTH': JSON.stringify(process.env.MIN_PASSWORD_LENGTH || null),
    'process.env.MAPPER_ROLE_NAME': JSON.stringify(process.env.MAPPER_ROLE_NAME || null),
    'process.env.APP_DOMAIN': JSON.stringify(process.env.APP_DOMAIN || null),
  },
  mainFields: ['module', 'main'], // Prioritize ESM over CommonJS
};

// In-app bundle: images are emitted as separate digested files served from /assets.
const appConfig = {
  ...baseConfig,
  entryPoints: ['app/javascript/application.js'],
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.png': 'file',
    '.svg': 'file',
    '.gif': 'file',
    '.jpg': 'file',
  },
  assetNames: 'images/[name]-[hash].digested', // Images go into a subfolder
  define: { ...baseConfig.define, 'process.env.DESM_STATIC': JSON.stringify('false') },
};

// Self-contained export bundles: images are inlined as data URIs and the static API adapter is
// enabled via DESM_STATIC. `static.js` = standalone HTML file; `embed.js` = Shadow DOM snippet.
const selfContainedLoader = {
  '.js': 'jsx',
  '.jsx': 'jsx',
  '.png': 'dataurl',
  '.svg': 'dataurl',
  '.gif': 'dataurl',
  '.jpg': 'dataurl',
};
const selfContainedDefine = {
  ...baseConfig.define,
  'process.env.DESM_STATIC': JSON.stringify('true'),
};

const staticConfig = {
  ...baseConfig,
  entryPoints: ['app/javascript/static.jsx'],
  loader: selfContainedLoader,
  define: selfContainedDefine,
};

const embedConfig = {
  ...baseConfig,
  entryPoints: ['app/javascript/embed.jsx'],
  loader: selfContainedLoader,
  define: selfContainedDefine,
  // IIFE (not ESM): the snippet injects this as a classic <script> that must run synchronously,
  // before the bootstrap script calls window.DesmEmbedRender. A module script would defer and run
  // too late. The bundle assigns the global itself, so no global `globalName` is needed.
  format: 'iife',
};

async function run() {
  const contexts = await Promise.all([
    esbuild.context(appConfig),
    esbuild.context(staticConfig),
    esbuild.context(embedConfig),
  ]);

  if (isWatch) {
    await Promise.all(contexts.map((context) => context.watch()));
  } else {
    await Promise.all(
      contexts.map(async (context) => {
        await context.rebuild();
        await context.dispose();
      })
    );
  }
}

run().catch(() => process.exit(1));
