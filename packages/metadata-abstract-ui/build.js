'use strict';

const fs = require('fs');
const rollup = require('rollup').rollup;
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const cleanup = require('rollup-plugin-cleanup');
//const webpack = require('webpack');
const path = require('path');
const package_data = require(path.resolve(__dirname, './package.json'));

const external = ['clipboard', 'dataframe', 'cron', 'xlsx'];
const plugins = [
	resolve(),
	replace({PACKAGE_VERSION: `"${package_data.version}"`}),
	cleanup(),
];
const header = `/*!
 ${package_data.name} v${package_data.version}, built:${new Date().toJSON().split('T')[0]}
 © 2014-2024 Evgeniy Malyarov and the Oknosoft team http://www.oknosoft.ru
 metadata.js may be freely distributed under the MIT
 To obtain commercial license and technical support, contact info@oknosoft.ru
 */\n\n`;

return rollup({
  input: path.resolve(__dirname, './src/plugin.js'),
	external,
	plugins,
})
  .then((bundle) => bundle.write({
    format: 'cjs', // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    name: package_data.name.replace(/-/g, '_') + '_plugin',
    banner: header,
    file: path.resolve(__dirname, './index.js'),
    sourcemap: true,
  }))

	.then(() => rollup({
    input: path.resolve(__dirname, './src/meta.js'),
		external,
		plugins,
	}))
  .then((bundle) => bundle.write({
    format: 'cjs', // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    name: package_data.name.replace(/-/g, '_') + '_meta',
    banner: header,
    file: path.resolve(__dirname, './meta.js'),
    sourcemap: true,
  }))

  .then(() => rollup({
    input: path.resolve(__dirname, './src/cron.js'),
    external,
    plugins,
  }))
  .then((bundle) => bundle.write({
    format: 'cjs', // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    name: package_data.name.replace(/-/g, '_') + '_cron',
    banner: header,
    file: path.resolve(__dirname, './cron.js'),
    sourcemap: true,
  }))

  .then(() => rollup({
    input: path.resolve(__dirname, './src/ui.js'),
    external,
    plugins,
  }))
  .then((bundle) => bundle.write({
    format: 'cjs', // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    name: package_data.name.replace(/-/g, '_') + '_ui',
    banner: header,
    file: path.resolve(__dirname, './ui.js'),
    sourcemap: true,
  }))

  .then(() => rollup({
    input: path.resolve(__dirname, './src/row_props.js'),
    external,
    plugins,
  }))
  .then((bundle) => bundle.write({
    format: 'cjs', // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    name: package_data.name.replace(/-/g, '_') + '_row_props',
    banner: header,
    file: path.resolve(__dirname, './row_props.js'),
    sourcemap: true,
  }))

  .then(() => rollup({
    input: path.resolve(__dirname, './src/tabulars.js'),
    external,
    plugins,
  }))
  .then((bundle) => bundle.write({
    format: 'cjs', // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    name: package_data.name.replace(/-/g, '_') + '_tabulars',
    banner: header,
    file: path.resolve(__dirname, './tabulars.js'),
    sourcemap: true,
  }))
  .then(() => {
    // webpack(require('./webpack.config'), (err, stats) => {
    //   if (err || stats.hasErrors()) {
    //     // Handle errors here
    //   }
    //   // Done processing
    // });
  });

