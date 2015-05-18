#!/usr/bin/env node
'use strict';

var mapKeys = require('map-keys');

var argv = mapKeys(require('yargs')
                   .usage('Usage:  $0 [filter_expr]...')
                   .help('help')
                   .argv, function (key) {
                     return key.replace(/-/g, '_');
                   });

console.log(argv);
