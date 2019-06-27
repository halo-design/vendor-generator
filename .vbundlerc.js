const proxy = require('http-proxy-middleware');

module.exports = {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    // file: 'dist/bridge.js',
    format: 'cjs',
    chunkFileNames: 'chunk-[name]-[hash].js',
  },
  watch: {
    include: ['src/**/*.js', 'src/**/*.vue', 'src/**/*.scss'],
  },
  plugins: {
    useVuePlugin: true,
    useTypescript: true,
    copyConfig: {
      targets: [{
        src: 'src/index.html',
        dest: 'dist'
      }, {
        src: 'src/assets/**/*',
        dest: 'dist/assets'
      }],
    },
  },
  external: ['vue'],
  buildUglify: true,
  resultNotify: false,
  server: () => ({
    port: 9090,
    middleware: [
      proxy('/media', {
        target: 'https://owlaford.gitee.io/',
        changeOrigin: true,
      }),
    ],
  }),
};
