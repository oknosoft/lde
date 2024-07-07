'use strict';

const fs = require('fs');
const rollup = require('rollup').rollup;
const resolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const cleanup = require('rollup-plugin-cleanup');
const path = require('path');
const package_data = require(path.resolve(__dirname, './package.json'));

const external = ['events', 'pouchdb-*'];
const plugins = [
	resolve(),
	replace({PACKAGE_VERSION: `"${package_data.version}"`}),
	cleanup(),
];
const header = `/*!
 ${package_data.name} v${package_data.version}, built:${new Date().toISOString().split('T')[0]}
 © 2014-2023 Evgeniy Malyarov and the Oknosoft team https://oknosoft.ru
 metadata.js may be freely distributed under the MIT
 To obtain commercial license and technical support, contact info@oknosoft.ru
 */\n\n`;

return rollup({
  input: path.resolve(__dirname, './src/index.js'),
	external,
	plugins,
})
	.then((bundle) => bundle.write({
		format: 'cjs', // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
    name: package_data.name.replace(/-/g, '_'),
		banner: header,
    file: path.resolve(__dirname, './dist/index.js'),
    sourcemap: true,
	}));

