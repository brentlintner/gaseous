var bus, self,
    modules = {};

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

        method.apply(obj, args.map(function (arg, index) {
            if (arg === "[Function]") arg = _handle(id, index);
            return arg;
        }));
    };
}

self = module.exports = {
    modules: {},
    watch: function (observable) {
        bus = observable;
    },
    // obj = {moduleName: moduleObj}
    bind: function (obj) {
        Object.keys(obj).forEach(function (module) {
            self.modules[module] = self.modules[module] || {};

            Object.keys(obj[module]).forEach(function (method) {
                if (typeof obj[module][method] === "function") {
                    self.modules[module][method] = _map(obj[module][method], obj[module])
                    bus.on(_event(module + "-" + method), self.modules[module][method]);
                }
            });
        });
        return this;
    }
};
