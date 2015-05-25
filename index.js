'use strict';

var codeDumpParser = require('v8-code-dump-parser'),
    concat = require('parse-concat-stream');


var code = function (section) {
  return section.code || section.optimizedCode;
};


var genericMax = function (sections, keyfn, init, less) {
  var reduction = sections.reduce(function (acc, section) {
    var value = keyfn(section);

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
  max: function (sections, keyfn) {
    return genericMax(sections, keyfn, -Infinity,
                      function (a, b) { return a < b; });
  },
  min: function (sections, keyfn) {
    return genericMax(sections, keyfn, +Infinity,
                      function (a, b) { return a > b; });
  }
};


module.exports = function (input, filters, output, cb) {
  input.pipe(concat({ parse: codeDumpParser }, function (err, sections) {
    if (err) throw err;
    var warnings = [];

    filters.forEach(function (filter) {
      var applied = false;
      var keyfn = function (section) {
        var value = code(section)[filter.key];
        if (value != null) {
          applied = true;
        }
        return value;
      };

      if (aggregate.hasOwnProperty(filter.value)) {
        sections = aggregate[filter.value](sections, keyfn);
      }
      else {
        sections = sections.filter(function (section) {
          return keyfn(section) == filter.value;
        });
      }

      if (!applied) {
        warnings.push('Filter on ' + filter.key + ' was not applied because no sections contain this property.');
      }
    });

    output.write(codeDumpParser.stringify(sections));
    cb(warnings);
  }));
};
