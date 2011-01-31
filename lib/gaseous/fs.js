var self, bus, gfs,
    fs = require('fs');

function _event(method) {
    return "gaseous-" + method;
}

gfs = {
    readFile: function (filename, encoding, callback, id) {
        fs.readFile(filename, encoding, function (err, data) {
            bus.emit(_event("socket-send"), [{
                id: id,
                args: Array.prototype.slice.call(arguments, 0)
            }]);
        });
    }
};

self = module.exports = {
    watch: function (observable) {
        bus = observable;
        bus.on(_event("fs-readFile"), gfs.readFile);
    }
};
