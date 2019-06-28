#!/usr/bin/env node
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const rollup = require('rollup');
const program = require('commander');
const merge = require('lodash/merge');
const notifier = require('node-notifier');
const exportPlugin = require('../config/plugins');
const gzipSize = require('gzip-size');
const liveServer = require('live-server');
const ui = require('cliui')();
const prettyBytes = require('pretty-bytes');
const { getAppPath, getLocalPath } = require('../config/env');

const userConfigPath = getAppPath('.vbundlerc.js');

const clearConsole = () => {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
  );
};

const getOptions = Opts => (typeof Opts === 'function' ? Opts() : Opts);

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

const watcher = (
  { input, output, external, plugins, watch, resultNotify },
  onceCallback
) => {
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

  const killThread = () => {
    watcherTask.close();
    process.exit(0);
  };

  const spinner = ora('Building for development...');
  let startBuildingStamp;
  let firstTime = true;

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
        if (!onceCallback) {
          clearConsole();
        }
        spinner.succeed(
          `Finished building all bundles in ${chalk.greenBright.bold(
            ((Date.now() - startBuildingStamp) / 1000).toFixed(2) + 's'
          )}!`
        );

        if (firstTime) {
          firstTime = false;
          if (onceCallback) {
            onceCallback();
          }
        }

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
        if (resultNotify) {
          notify(
            {
              message: 'Encountered an unrecoverable error!',
              wait: false,
              timeout: 1,
            },
            killThread
          );
        } else {
          console.log(chalk.red.bold('Encountered an unrecoverable error!'));
          killThread();
        }
        break;
      }
    }
  });

  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      if (resultNotify) {
        notify(
          {
            message: 'Exit watching mode!',
            wait: false,
            timeout: 1,
          },
          killThread
        );
      } else {
        console.log(chalk.yellow.bold('\nExit watching mode!\n'));
        killThread();
      }
    });
  });
};

const build = ({
  input,
  output,
  external,
  plugins,
  buildUglify,
  resultNotify,
}) => {
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
  const spinner = ora('Building for production...').start();

  rollup
    .rollup(inputOptions)
    .then(bundle => {
      spinner.text = 'Writting file locally...';
      bundle.write(outputOptions).then(res => {
        spinner.succeed(
          `created ${chalk.yellow.bold(
            output.file || output.dir
          )} in ${chalk.green.bold(
            ((Date.now() - startTime) / 1000).toFixed(2) + 's'
          )}!`
        );

        const jsBundles = res.output.filter(file => 'code' in file);
        const assetFiles = res.output.filter(file => 'isAsset' in file);

        let outputDir = '';
        if (output.file) {
          outputDir = output.file;
          outputDir = outputDir.replace(path.basename(outputDir), '');
        } else {
          outputDir = output.dir + '/';
        }

        ui.div(
          {
            width: 30,
            text: chalk.cyan.bold('File'),
            padding: [1, 0, 1, 0],
          },
          {
            width: 20,
            text: chalk.cyan.bold('Size'),
            padding: [1, 0, 1, 0],
            align: 'right',
          },
          {
            width: 20,
            text: chalk.cyan.bold('Gzipped'),
            padding: [1, 0, 1, 0],
            align: 'right',
          }
        );

        jsBundles.map(file => {
          ui.div(
            {
              width: 30,
              text: chalk.green(outputDir + file.fileName),
            },
            {
              width: 20,
              text: chalk.white(prettyBytes(file.code.length / 1024)),
              align: 'right',
            },
            {
              width: 20,
              text: chalk.white(prettyBytes(gzipSize.sync(file.code))),
              align: 'right',
            }
          );
        });

        assetFiles.map(file => {
          ui.div(
            {
              width: 30,
              text: chalk.blue(outputDir + file.fileName),
            },
            {
              width: 20,
              text: chalk.white(
                prettyBytes(file.source.toString('utf8').length)
              ),
              align: 'right',
            },
            {
              width: 20,
              text: chalk.white(prettyBytes(gzipSize.sync(file.source))),
              align: 'right',
            }
          );
        });

        console.log(ui.toString());

        if (resultNotify) {
          notify({
            message: 'Build complete.',
            wait: false,
            timeout: 1,
          });
        } else {
          console.log(
            `\n${chalk.black.bgGreen(' DONE ')} ${chalk.white(
              'Build complete.\n'
            )}`
          );
        }
      });
    })
    .catch(err => {
      spinner.fail('Build failed!');
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

  program.command('serve').action(() => {
    watcher(userConfig, () => {
      liveServer.start(
        merge(
          {
            open: false,
            root: userConfig.output.dir || '/dist',
          },
          getOptions(userConfig.server)
        )
      );
    });
  });

  program.parse(process.argv);
} else {
  console.log(chalk.red('\nThe config file ".vbundlerc.js" does not exist.\n'));
  process.exit(1);
}
