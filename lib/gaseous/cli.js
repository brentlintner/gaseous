function _parse(command, options) {
    var fs = require('fs'),
        sys = require('sys');

    // TODO: better args/options parsing
    switch (command) {
    case 'server':
        require('./server')
            .bind(options["-d"] ? process.cwd() + "/" + options["-d"] : process.cwd())
            .listen(options["-p"] ? parseInt(options["-p"], 10) : 8888);
        break;
    case 'help':
    default:
        sys.puts(fs.readFileSync(__dirname + "/../../README.md", "utf-8")); 
    }
}

module.exports = {
    interpret: function (args) {
        var options = require('argsparser').parse(args),
            command = options["node"] instanceof Array ?
                options["node"].slice(1).join(' ') : null;
        _parse(command, options);
    }
};
