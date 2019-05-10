#!/usr/bin/env node
const ora = require('ora');
const fs = require('fs-extra');
const chalk = require('chalk');
const rollup = require('rollup');
const program = require('commander');
const merge = require('lodash/merge');
const exportPlugin = require('../config/plugins');
const { getAppPath } = require('../config/env');

const userConfigPath = getAppPath('.vbundlerc.js');

const watcher = ({ input, output, external, pluginsConfig, watchConfig }) => {
  const inputOptions = {
    input,
    plugins: exportPlugin({
      isNeedUglify: false,
      ...pluginsConfig,
    }),
    external,
  };

  const watchOptions = {
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**',
    },
  };

  const watcherTask = rollup.watch({
    ...inputOptions,
    output,
    watch: merge(watchOptions, watchConfig),
  });

  const spinner = ora('Compiling for development...');
  let startBuildingStamp;

  watcherTask.on('event', event => {
    switch (event.code) {
      case 'START': {
        startBuildingStamp = Date.now();
        spinner.start();
        spinner.text = 'The watcher is starting...';
        break;
      }
      case 'BUNDLE_START': {
        spinner.text = 'Building an individual bundle...';
        break;
      }
      case 'BUNDLE_END': {
        spinner.text = 'Finished building a bundle...';
        break;
      }
      case 'END': {
        spinner.succeed(
          `Finished building all bundles in ${chalk.greenBright.bold(
            ((Date.now() - startBuildingStamp) / 1000).toFixed(2) + 's'
          )}`
        );
        break;
      }
      case 'ERROR': {
        spinner.fail('Encountered an error while bundling!');
        break;
      }
      case 'FATAL': {
        spinner.fail('Encountered an unrecoverable error!');
        watcherTask.close();
        break;
      }
    }
  });

  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      watcherTask.close();
      console.log(chalk.yellow('Exit watching mode!'))
      process.exit(0);
    });
  });
};

const build = ({ input, output, external, pluginsConfig, buildUglify }) => {
  const inputOptions = {
    input,
    plugins: exportPlugin({
      isNeedUglify: buildUglify,
      ...pluginsConfig,
    }),
    external,
  };

  const outputOptions = {
    output,
  };

  const startTime = Date.now();
  const spinner = ora('Compiling for production...').start();

  rollup
    .rollup(inputOptions)
    .then(bundle => {
      spinner.text = 'Writting file locally...';
      bundle.write(outputOptions).then(() => {
        spinner.succeed(
          `created ${chalk.yellow(output.file)} in ${chalk.green(
            ((Date.now() - startTime) / 1000).toFixed(2) + 's'
          )}!`
        );
        console.log(chalk.cyan.bold(`  ${input} → ${output.file}\n`));
      });
    })
    .catch(err => {
      spinner.fail('Compile failed!');
      throw err;
    });
};

let userConfig = {};

if (fs.existsSync(userConfigPath)) {
  userConfig = require(userConfigPath);
  program
    .command('build')
    .option('-p --production', 'Production mode build bundles')
    .action(cmd => {
      if (cmd.production) {
        build(userConfig);
      } else {
        watcher(userConfig);
      }
    });
  
  program.parse(process.argv);
} else {
  console.log(chalk.red('\nThe config file ".vbundlerc.js" does not exist.\n'));
  process.exit(1);
}