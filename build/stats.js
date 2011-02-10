module.exports = function showStats() {
    var glob = require('glob'),
        sys = require('sys'),
        total_lines,
        total_loc;

    function spaces(number) {
        var str = "", i;
        for (i = 0; i < number; i++) {
            str += " ";
        }
        return str;
    }

    function parseFile(file) {
        var lines = 0,
            loc = 0,
            text;

        if (file.match(/\.js$/)) {
            // hack!
            require('fs').readFileSync(file, "utf-8").replace(/\n$/, '').split("\n").forEach(function (line) {
                lines++;
                if (!line.match(/^(\s*|\s*\/\/)$/)) {
                    loc++;
                }
            });

            file = file.replace(/(test|lib)\//, '');

            sys.puts("| " + file + spaces(30 - file.length) + "| " +
                    lines + spaces(7 - String(lines).length) + "| " +
                    loc + spaces(7 - String(loc).length) + "|");

            total_lines = total_lines + lines;
            total_loc = total_loc + loc;
        }
    }

    function collect(globs, callback, index, files) {
        index = index || 0;
        files = files || [];
        if (globs.length > index) {
            glob.glob(globs[index], 0, function (er, arr) {
                collect(globs, callback, index + 1, files.concat(arr));
            });
        } else {
            callback(files);
        }
    }

    function printTotals() {
        sys.puts("+-------------------------------+--------+--------+");
        sys.print("| Total                         |");
        sys.print(" " + total_lines + spaces(7 - String(total_lines).length) + "|");
        sys.puts(" " + total_loc + spaces(7 - String(total_loc).length) + "|");
        sys.puts("+-------------------------------+--------+--------+");
    }

    collect(["lib/*.js"], function (lib) {
        var lib_loc = 0;
        total_lines = 0;
        total_loc = 0;

        sys.puts("+-------------------------------+--------+--------+");
        sys.puts("| Lib                           | Lines  | LOC    |");
        sys.puts("+-------------------------------+--------+--------+");

        lib.forEach(parseFile);

        printTotals();

        lib_loc = total_loc;

        collect(["test/*.js"], function (tests) {
            total_lines = 0;
            total_loc = 0;

            sys.puts("| Tests                         | Lines  | LOC    |");
            sys.puts("+-------------------------------+--------+--------+");

            tests.forEach(parseFile);

            printTotals();

            sys.puts("| Ratio (tests/lib) (" + (total_loc / lib_loc) + ")");
            sys.puts("+-------------------------------+--------+--------+");
        });
    });
};
