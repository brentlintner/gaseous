var self, bus, gfs,
    fs = require('fs');

function _event(method) {
    return "gaseous-" + method;
}

function _data(id, args) {
    return [{
        id: id,
        args: Array.prototype.slice.call(args, 0)
    }];
}

gfs = {
    readFile: function (filename, encoding, callback, id) {
        fs.readFile(filename, encoding, function (err, data) {
            bus.emit(_event("socket-send"), _data(id, arguments));
        });
    },
    writeFile: function (filename, data, encoding, callback, id) {
        fs.writeFile(filename, data, encoding, function (err) {
            bus.emit(_event("socket-send"), _data(id, arguments));
        });
    },
    stat: function (path, callback, id) {
        fs.stat(path, function (err, stats) {
            bus.emit(_event("socket-send"), _data(id, arguments));
        });
    }
};

self = module.exports = {
    watch: function (observable) {
        var methods = [
            "readFile",
            "writeFile",
            "stat"
        ];
        bus = observable;
        methods.forEach(function (method) {
            bus.on(_event("fs-" + method), gfs[method]);
        });
    }
};
