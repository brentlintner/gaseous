var self, bus, gfs,
    fs = require('fs');

function _event(method) {
    return "gaseous-" + method;
}

function _send(id, args) {
    bus.emit(_event("socket-send"), [{
        id: id,
        args: Array.prototype.slice.call(args, 0)
    }]);
}

function _handle(id) {
    return function () {
        _send(id, arguments);
    };
}

gfs = {
    readFile: function (id, filename, encoding, callback) {
        fs.readFile(filename, encoding, _handle(id));
    },
    writeFile: function (id, filename, data, encoding, callback) {
        fs.writeFile(filename, data, encoding, _handle(id));
    },
    stat: function (id, path, callback) {
        fs.stat(path, _handle(id));
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
