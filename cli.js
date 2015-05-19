#!/usr/bin/env node
'use strict';

var mapKeys = require('map-keys'),
    codeDumpParser = require('v8-code-dump-parser'),
    concat = require('parse-concat-stream');

var argv = mapKeys(require('yargs')
                   .usage('Usage:  $0 [filter_expr]...')
                   .help('help')
                   .argv, function (key) {
                     return key.replace(/-/g, '_');
                   });


process.stdin.pipe(concat({ parse: codeDumpParser }, function (err, sections) {
  if (err) throw err;

  sections = sections.filter(function (section) {
    var code = section.code || section.optimizedCode;
    return Object.keys(argv).some(function (key) {
      return code[key] == argv[key];
    });
  });

  process.stdout.write(codeDumpParser.stringify(sections));
}));
