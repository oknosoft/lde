'use strict';

const fs = require('fs');
const rollup = require('rollup').rollup;
const resolve = require('rollup-plugin-node-resolve');
const builtins = require('rollup-plugin-node-builtins');
const replace = require('rollup-plugin-replace');
const cleanup = require('rollup-plugin-cleanup');
const path = require('path');
const package_data = require(path.resolve(__dirname, './package.json'));

const external = ['moment', 'alasql', 'pouchdb*', 'xlsx'];
const plugins = [
  resolve({preferBuiltins: true}),
  builtins(),
  replace({PACKAGE_VERSION: `"${package_data.version}"`}),
  cleanup(),
];
const header = `/*!
 ${package_data.name} v${package_data.version}, built:${new Date().toJSON().split('T')[0]}
 © 2014-2024 Evgeniy Malyarov and the Oknosoft team http://www.oknosoft.ru
 metadata.js may be freely distributed under the MIT
 To obtain commercial license and technical support, contact info@oknosoft.ru
 */\n`;

return rollup({
  input: path.resolve(__dirname, './src/transition.js'),
	external,
	plugins,
})
	.then((bundle) => bundle.write({
		format: 'umd', // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    name: '$p',
    banner: header,
    globals: {
      'alasql': 'alasql',
      'moment': 'moment',
    },
    file: path.resolve(__dirname, './index.js'),
    sourcemap: true,
	}));

