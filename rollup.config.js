import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: 'src/main.js',
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**',
  },
  output: {
    file: 'dist/bridge.js',
    format: 'cjs',
  },
  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
    commonjs({
      include: 'node_modules/**',
      sourceMap: false,
    }),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
      configFile: false,
      babelrc: false,
      presets: [['@babel/env', { modules: false }]],
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['@babel/proposal-object-rest-spread', { useBuiltIns: true }],
        '@babel/proposal-numeric-separator',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-export-namespace-from',
      ],
    }),
    uglify(),
  ],
  external: ['lodash'],
};
