function _parse(command, options) {
    var fs = require('fs'),
        sys = require('sys'),
        modules;

    // TODO: better args/options parsing
    switch (command) {
    case 'server':
        modules = !options["-m"] ? {} : options["-m"].split(",")
                .reduce(function (obj, module) {
                    obj[module] = require(module);
                    return obj;
                }, {});
        
        require('./map').map(modules);
        require('./server').listen({port: options["-p"] ? parseInt(options["-p"], 10) : 8888});
        break;
    case 'build':
        require('./../build/build')();
        break;
    case 'help':
    default:
        sys.print(fs.readFileSync(__dirname + "/../HELP", "utf-8"));
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
