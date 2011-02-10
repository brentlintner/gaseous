var bus,
    fs = require('fs');

function _event(method) {
    return "gaseous-" + method;
}

function _send(id, args, index) {
    bus.emit(_event("socket-send"), [{
        id: id,
        callback: index,
        args: Array.prototype.slice.call(args)
    }]);
}

function _handle(id, index) {
    return function () {
        _send(id, arguments, index);
    };
}

function _map(method) {
    return function () {
        var args = Array.prototype.slice.call(arguments),
            id = args.shift(); // id always at [0]

        args = args.map(function (arg, index) {
            if (arg === "<Function>") {
                arg = _handle(id, index);
            }
            return arg;
        });

        fs[method].apply(fs, args);
    };
}

module.exports = function (observable) {
    bus = observable;
    var methods = Object.keys(fs).filter(function (prop) {
            return typeof fs[prop] === "function" ? true : false;
        }),
        api = {};

    methods.forEach(function (method) {
        api[method] = _map(method);
        bus.on(_event("fs-" + method), api[method]);
    });

    return api;
};
