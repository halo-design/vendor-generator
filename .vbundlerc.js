module.exports = {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    // file: 'dist/bridge.js',
    format: 'cjs',
    chunkFileNames: 'chunk-[name]-[hash].js',
  },
  watch: {
    include: 'src/**/*.js',
  },
  plugins: {
    useVuePlugin: true,
  },
  external: ['lodash'],
  buildUglify: true,
};
