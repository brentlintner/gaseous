var bus, self;

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

function _map(method, obj) {
    return function () {
        var args = Array.prototype.slice.call(arguments),
            id = args.shift(); // id always at [0]

        args = args.map(function (arg, index) {
            if (arg === "<Function>") {
                arg = _handle(id, index);
            }
            return arg;
        });

        method.apply(obj, args);
    };
}

self = module.exports = {
    watch: function (observable) {
        bus = observable;
    },
    // obj = {moduleName: moduleObj}
    bind: function (obj) {
        Object.keys(obj).forEach(function (module) {
            Object.keys(obj[module]).forEach(function (method) {
                if (typeof obj[module][method] === "function") {
                    bus.on(_event(module + "-" + method), _map(obj[module][method], obj[module]));
                }
            });
        });
        return this;
    }
};
