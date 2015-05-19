#!/usr/bin/env node
'use strict';

var yargs = require('yargs'),
    mapKeys = require('map-keys'),
    codeDumpParser = require('v8-code-dump-parser'),
    concat = require('parse-concat-stream');

var fs = require('fs');

var argv = mapKeys(yargs
                   .usage('Usage:  $0 [filter_expr]... [file]')
                   .help('help')
                   .argv, function (key) {
                     return key.replace(/-/g, '_');
                   });


if (argv._.length > 1) {
  console.log(yargs.help());
  process.exit(1);
}

var inputStream = argv._.length ? fs.createReadStream(argv._[0]) : process.stdin;

inputStream.pipe(concat({ parse: codeDumpParser }, function (err, sections) {
  if (err) throw err;

  sections = sections.filter(function (section) {
    var code = section.code || section.optimizedCode;
    return Object.keys(argv).some(function (key) {
      return code[key] == argv[key];
    });
  });

  process.stdout.write(codeDumpParser.stringify(sections));
}));
