var socket, api,
    pending = {},
    self;

// assure there is no duplicate uuid generation (however improbable)
function uuid(obj) {
    var id = Math.uuid(null, 16);
    return !obj[id] ? id : uuid(obj);
}

function pass(module, method) {
    return function () {
        var count = 0,
            id = uuid(pending),
            sendArgs = Array.prototype.slice.call(arguments),
            sendData = {
                id: id,
                method: module + "-" + method,
                args: sendArgs.map(function (arg) { 
                    if (typeof arg === "function") {
                        count++;
                        arg = "[Function]";
                    }
                    return arg;
                })
            };

        pending[id] = function (receiveData) {
            var index = receiveData.callback;

            if (sendArgs.length > 0 && typeof sendArgs[index] === "function") {
                count--;
                if (count <= 0) delete pending[id];
                sendArgs[index].apply(self.modules[module], receiveData.args);
            }
        };

        socket.send(JSON.stringify(sendData));
    };
}

function _load(modules, ready) {
    Object.keys(modules).forEach(function (module) {
        Object.keys(modules[module]).forEach(function (method) {
            modules[module][method] = pass(module, method);
        });
    });

    if (typeof ready === "function") {
        ready(self.modules = modules);
    }
}

self = module.exports = {
    modules: null,
    connect: function (ready, options) {
        if (!options) options = {};
        options.host = options.host || '127.0.0.1';
        options.port = options.port || 8888;

        socket = new io.Socket(options.host, {port: options.port});
        socket.connect();

        // socket.on('connect', function () {});
        // socket.on('disconnect', function () {});

        socket.on('message', function (message) {
            var data = JSON.parse(message);
            if (data.modules) {
                _load(data.modules, ready);
            } else if (data.id && pending[data.id]) {
                pending[data.id].call(self, data);
            }
        }); 
    } 
};
