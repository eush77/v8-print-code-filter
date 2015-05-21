'use strict';

var codeDumpParser = require('v8-code-dump-parser'),
    concat = require('parse-concat-stream');


var code = function (section) {
  return section.code || section.optimizedCode;
};


var genericMax = function (sections, key, init, less) {
  var reduction = sections.reduce(function (acc, section) {
    var value = code(section)[key];

    if (less(acc.value, value)) {
      return {
        value: value,
        sections: [section]
      };
    }
    else if (value == acc.value) {
      acc.sections.push(section);
    }

    return acc;
  }, {
    value: init,
    sections: []
  });

  return reduction.sections;
};


var aggregate = {
  max: function (sections, key) {
    return genericMax(sections, key, -Infinity, function (a, b) { return a < b; });
  },
  min: function (sections, key) {
    return genericMax(sections, key, +Infinity, function (a, b) { return a > b; });
  }
};


module.exports = function (input, filters, output) {
  input.pipe(concat({ parse: codeDumpParser }, function (err, sections) {
    if (err) throw err;

    filters.forEach(function (filter) {
      if (aggregate.hasOwnProperty(filter.value)) {
        sections = aggregate[filter.value](sections, filter.key);
        return;
      }

      sections = sections.filter(function (section) {
        return code(section)[filter.key] == filter.value;
      });
    });

    output.write(codeDumpParser.stringify(sections));
  }));
};
