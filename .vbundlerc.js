module.exports = {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    // file: 'dist/bridge.js',
    format: 'cjs',
    chunkFileNames: 'chunk-[name]-[hash].js',
  },
  external: ['lodash'],
  buildUglify: true,
};
