const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const { uglify } = require('rollup-plugin-uglify');
const merge = require('lodash/merge');

const exportPlugin = ({
  resolveConfig,
  commonjsConfig,
  babelConfig,
  uglifyConfg,
  isNeedUglify,
}) => {
  const baseOpts = [
    resolve(
      merge(
        {
          customResolveOptions: {
            moduleDirectory: 'node_modules',
          },
        },
        resolveConfig
      )
    ),
    commonjs(
      merge(
        {
          include: 'node_modules/**',
          sourceMap: false,
        },
        commonjsConfig
      )
    ),
    babel(
      merge(
        {
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
        },
        babelConfig
      )
    ),
  ];

  if (isNeedUglify) {
    baseOpts.push(uglify(merge({}, uglifyConfg)));
  }

  return baseOpts;
};

module.exports = exportPlugin;
