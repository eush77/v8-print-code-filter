#!/usr/bin/env node
'use strict';

var applyFilters = require('./');

var optArray = require('opt-array');

var fs = require('fs');


var usage = function (code) {
  console.log('Usage:  $0 [filter_expr]... [file]');
  process.exit(code | 0);
};


(function main(optv) {
  var filters = [];
  var input;

  optv.forEach(function (opt) {
    if (opt.option == 'help') {
      return usage();
    }

    if (!opt.option) {
      if (input) {
        return usage(1);
      }
      else {
        input = opt.value;
        return;
      }
    }

    filters.push({
      key: opt.option.replace(/-/g, '_'),
      value: opt.value
    });
  });

  if (!filters.length) {
    return usage(1);
  }

  input = input ? fs.createReadStream(input) : process.stdin;
  applyFilters(input, filters, process.stdout, function (warnings) {
      warnings.forEach(function (warning) {
        console.error('Warning: ' + warning);
      });
  });
}(optArray(process.argv.slice(2))));
