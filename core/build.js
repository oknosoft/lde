'use strict';

const fs = require('fs');
const {rollup} = require('rollup');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const cleanup = require('rollup-plugin-cleanup');
const webpack = require('webpack');
const path = require('path');
const package_data = require(path.resolve(__dirname, './package.json'));

const external = ['events', 'moment', 'dayjs', 'camelcase'];
const plugins = [
  nodeResolve({preferBuiltins: true}),
	replace({PACKAGE_VERSION: `"${package_data.version}"`}),
	cleanup(),
];
const banner = `/*!
 ${package_data.name} v${package_data.version}, built:${new Date().toISOString().split('T')[0]}
 © 2014-2023 Evgeniy Malyarov and the Oknosoft team http://www.oknosoft.ru
 metadata.js may be freely distributed under the MIT
 To obtain commercial license and technical support, contact info@oknosoft.ru
 */\n\n`;

return rollup({
  input: path.resolve(__dirname, './src/index.js'),
	external,
	plugins,
})
  .then((bundle) => bundle.write({
    dir: path.resolve(__dirname, './dist'),
    format: 'es', // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    banner,
    sourcemap: true,
  }));

