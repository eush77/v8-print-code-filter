#!/usr/bin/env node
'use strict';

var applyFilters = require('./');

var help = require('help-version')(usage()).help,
    optArray = require('opt-array'),
    codeDumpParser = require('v8-code-dump-parser'),
    concat = require('parse-concat-stream');

var fs = require('fs');


function usage() {
  return 'Usage:  v8-print-code-filter [filter_expr]... [file]';
}


(function main(optv) {
  var filters = [];
  var input;

  optv.forEach(function (opt) {
    if (!opt.option) {
      if (input) {
        return help(1);
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
    return help(1);
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
