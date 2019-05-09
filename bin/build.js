const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const { uglify } = require('rollup-plugin-uglify');

const inputOptions = {
  input: 'src/main.js',
  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    commonjs({
      include: 'node_modules/**',
      sourceMap: false
    }),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
      configFile: false,
      babelrc: false,
      presets: [
        ['@babel/env', { 'modules': false }]
      ],
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['@babel/proposal-object-rest-spread', { useBuiltIns: true }],
        '@babel/proposal-numeric-separator',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-export-namespace-from'
      ]
    }),
    uglify()
  ],
  external: ['lodash']
};

const outputOptions = {
  output: {
    file: 'dist/bridge.js',
    format: 'cjs'
  }
};

const watchOptions = {
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  }
};

const build = () => {
  rollup.rollup(inputOptions).then(bundle => {
    bundle.write(outputOptions).then(result => {
      console.log(result);
    })
  });
};

build();