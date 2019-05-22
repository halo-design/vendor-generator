const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const vuePlugin = require('rollup-plugin-vue');
const { terser } = require('rollup-plugin-terser');
const typescript = require('rollup-plugin-typescript');
const sass = require('rollup-plugin-sass');
const autoprefixer = require('autoprefixer');
const rollupPostcss = require('rollup-plugin-postcss');
const copy = require('rollup-plugin-copy');
const postcss = require('postcss');
const cssnano = require('cssnano');
const merge = require('lodash/merge');

const exportPlugin = ({
  resolveConfig,
  commonjsConfig,
  babelConfig,
  terserConfg,
  typescriptConfig,
  postcssConfig,
  cssConfig,
  copyConfig,
  isNeedUglify,
  useVuePlugin,
  useTypescript,
  browsersList
}) => {
  const postPlugins = [
    autoprefixer({
      browsers: browsersList || ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
    }),
  ];

  if (isNeedUglify) {
    postPlugins.push(
      cssnano({
        reduceIdents: false,
        safe: true,
      })
    );
  }

  const defaultStyleConfig = {
    processor: css =>
      postcss(postPlugins)
        .process(css, { from: undefined })
        .then(result => result.css),
  };

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
    rollupPostcss(
      merge(
        {
          plugins: postPlugins,
          extract: true,
        },
        postcssConfig
      )
    ),
    sass(merge(defaultStyleConfig, cssConfig)),
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

  if (useTypescript) {
    const babelOpt = baseOpts.pop();
    baseOpts.push(
      typescript(
        merge(
          {
            lib: ['es5', 'es6', 'dom'],
            target: 'es5',
          },
          typescriptConfig
        ),
        babelOpt
      )
    );
  }

  if (useVuePlugin) {
    baseOpts.push(vuePlugin());
  }

  baseOpts.push(
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    })
  );

  if (isNeedUglify) {
    baseOpts.push(terser(merge({}, terserConfg)));
  }

  if (copyConfig) {
    baseOpts.push(copy(merge({}, copyConfig)));
  }

  return baseOpts;
};

module.exports = exportPlugin;
