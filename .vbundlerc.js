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
    cssConfig: {
      extract: true,
    },
    sassConfig: {
      output: 'dist/app.css',
    },
  },
  external: ['lodash'],
  buildUglify: true,
  resultNotify: false,
};
