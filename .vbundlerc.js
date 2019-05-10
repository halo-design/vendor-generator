module.exports = {
  input: 'src/main.js',
  output: {
    file: 'dist/bridge.js',
    format: 'cjs',
  },
  external: ['lodash'],
  buildUglify: true
}