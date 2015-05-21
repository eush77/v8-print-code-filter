'use strict';

var codeDumpParser = require('v8-code-dump-parser'),
    concat = require('parse-concat-stream');


module.exports = function (input, filters, output) {
  input.pipe(concat({ parse: codeDumpParser }, function (err, sections) {
    if (err) throw err;

    filters.forEach(function (filter) {
      sections = sections.filter(function (section) {
        var code = section.code || section.optimizedCode;
        return code[filter.key] == filter.value;
      });
    });

    output.write(codeDumpParser.stringify(sections));
  }));
};
