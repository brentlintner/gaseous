var bus,
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

function _map(method) {
    return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        // remove callback placeholder 
        args.pop();
        // push on generic callback handler
        // and pass in message id (always first arg)
        args.push(_handle(args.shift()));
        fs[method].apply(fs, args);
    }
}

module.exports = function (observable) {
    bus = observable;
    var api = {};

    var methods = Object.keys(fs).filter(function (prop) {
        return typeof fs[prop] === "function" ? true : false;
    });

    methods.forEach(function (method) {
        api[method] = _map(method);
        bus.on("gaseous-fs-" + method, api[method]);
    });

    return api;
};
