'use strict';


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


module.exports = function (sections, filters, opts) {
  opts = opts || {};
  opts.onWarning = opts.onWarning || Function.prototype;

  filters.forEach(function (filter) {
    if (!sections.length) {
      return;
    }

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
      opts.onWarning('Filter on ' + filter.key +
                     ' was not applied because no sections contain this property.');
    }
    else if (!sections.length) {
      opts.onWarning('Result set after filter on ' + filter.key + ' is empty.');
    }
  });

  return sections;
};
