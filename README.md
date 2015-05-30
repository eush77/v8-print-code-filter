[![npm](https://nodei.co/npm/v8-print-code-filter.png)](https://nodei.co/npm/v8-print-code-filter/)

# v8-print-code-filter

[![Dependency Status][david-badge]][david]

Filter [V8][v8] dump generated by `--print-code` or `--print-opt-code` by name, source position, optimization id and so on.

[v8]: https://code.google.com/p/v8-wiki/

[david]: https://david-dm.org/eush77/v8-print-code-filter
[david-badge]: https://david-dm.org/eush77/v8-print-code-filter.png

## Example

```
$ v8-print-code-filter --name fs.writeSync example/print_code
$ node --print-code example/source.js |v8-print-code-filter --optimization-id=1
$ v8-print-code-filter --source-position=96 example/print_opt_code
```

## CLI

```
Usage:  v8-print-code-filter [filter_expr]... [file]
```

Each `filter_expr` is a combination of an option key and value and describes a single attribute line.

E.g. `--source-position=96` matches the following code section:

```
--- Raw source ---
...

--- Optimized code ---
optimization_id = 1
source_position = 96
kind = OPTIMIZED_FUNCTION
name = add
...
```

Two special values for numeric attributes are available:

- `max` removes from selection all but entries with maximum value;
- `min` removes all but entries with minimum value.

Multiple expressions are applied in sequence, so that `--source-position=96 --optimization-id=max` selects entries with `source_position` equal to `96` and, among those, with maximum possible `optimization_id`.

## API

### `sections = printCodeFilter(sections, filters, [opts])`

- `sections` — parse tree in [v8-code-dump-parser][v8-code-dump-parser] format.
- `filters` — array of `{key: 'key', value: 'value'}` objects.
- `opts.onWarning(warning)` — optional callback for warning handling.

Returns new section tree.

[v8-code-dump-parser]: https://github.com/eush77/v8-code-dump-parser

## Related

- [v8-print-code-highlighter] — dual JavaScript + ASM syntax highlighter for V8 dumps.

[v8-print-code-highlighter]: https://github.com/eush77/v8-print-code-highlighter

## Install

```
npm install -g v8-print-code-filter
```

## License

MIT
