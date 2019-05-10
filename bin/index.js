#!/usr/bin/env node
const ora = require('ora');
const fs = require('fs-extra');
const chalk = require('chalk');
const rollup = require('rollup');
const program = require('commander');
const merge = require('lodash/merge');
const notifier = require('node-notifier');
const exportPlugin = require('../config/plugins');
const { getAppPath, getLocalPath } = require('../config/env');

const userConfigPath = getAppPath('.vbundlerc.js');

const notify = (opts, cb) => {
  notifier.notify(
    {
      title: 'Build notification',
      icon: getLocalPath('logo.png'),
      sound: true,
      sound: 'Funk',
      ...opts,
    },
    (err, res) => {
      if (err) throw err;
      if (cb) {
        cb(err, res);
      }
    }
  );
};

const watcher = ({ input, output, external, plugins, watch }) => {
  const watchOptions = {
    include: 'src/**',
    exclude: 'node_modules/**',
  };

  const watcherTask = rollup.watch({
    input,
    output,
    external,
    plugins: exportPlugin({
      isNeedUglify: false,
      ...plugins,
    }),
    watch: merge(watchOptions, watch),
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
        if ('TRAVIS' in process.env && 'CI' in process.env) {
          watcherTask.close();
        }
        break;
      }
      case 'ERROR': {
        spinner.fail('Encountered an error while bundling!');
        break;
      }
      case 'FATAL': {
        spinner.fail('Encountered an unrecoverable error!');
        notify(
          {
            message: 'Encountered an unrecoverable error!',
            wait: false,
            timeout: 1,
          },
          () => {
            watcherTask.close();
            process.exit(0);
          }
        );
        break;
      }
    }
  });

  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      notify(
        {
          message: 'Exit watching mode!',
          wait: false,
          timeout: 1,
        },
        () => {
          watcherTask.close();
          process.exit(0);
        }
      );
    });
  });
};

const build = ({ input, output, external, plugins, buildUglify }) => {
  const inputOptions = {
    input,
    plugins: exportPlugin({
      isNeedUglify: buildUglify,
      ...plugins,
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
      bundle.write(outputOptions).then(res => {
        notify({
          message: 'Compile successful!',
          wait: false,
          timeout: 1,
        });
        spinner.succeed(
          `created ${chalk.yellow.bold(
            output.file || output.dir
          )} in ${chalk.green.bold(
            ((Date.now() - startTime) / 1000).toFixed(2) + 's'
          )}!`
        );

        const maxNameLength = Math.max.apply(
          null,
          res.output.map(file => file.fileName.length)
        );

        const fileList = res.output.map(
          (file, index) =>
            `  ${
              index === res.output.length - 1 ? '└──' : '├──'
            } ${chalk.green.bold(
              file.fileName +
                Array(maxNameLength - file.fileName.length + 1)
                  .fill('')
                  .join(' ')
            )}     ${chalk.yellow.bold(
              (file.code.length / 1024).toFixed(2) + 'KB'
            )}`
        );
        console.log(`  ${chalk.cyan.bold(input)}\n${fileList.join('\n')}\n`);
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
