#!/usr/bin/env node
'use strict';

var applyFilters = require('./');

var optArray = require('opt-array'),
    codeDumpParser = require('v8-code-dump-parser'),
    concat = require('parse-concat-stream');

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

  (input = input ? fs.createReadStream(input) : process.stdin)
    .pipe(concat({ parse: codeDumpParser }, function (err, sections) {
      if (err) throw err;

      var onWarning = function (warning) {
        console.error('Warning: ' + warning);
      };

      sections = applyFilters(sections, filters, { onWarning: onWarning });
      process.stdout.write(codeDumpParser.stringify(sections));
    }));
}(optArray(process.argv.slice(2))));
