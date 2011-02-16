module.exports = function () {
    var files = Array.prototype.slice.call(arguments),
        args = files.length > 0 ? files : ["test/", "lib/", "build"],
        options = ["--config", "build/.jslintrc", "--reporter", "build/reporter.js"],
        sys = require('sys'),
        cmd;

    cmd = require('child_process').spawn('nodelint', args.concat(options));
    cmd.stdout.on('data', sys.print);
    cmd.stderr.on('data', sys.print);
};
