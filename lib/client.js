// assure there is no duplicate uuid generation (however improbable)
function uuid(obj) {
    var id = Math.uuid(null, 16);
    return !obj[id] ? id : uuid(obj);
}

var socket, api,
    pending = {},

self = module.exports = {
    fs: null,
    listen: function (host, port, ready) {
        host = host || '127.0.0.1';
        port = port || 8888;

        function pass(module, method) {
            return function () {
                var id = uuid(pending),
                    sendData = {
                        id: id,
                        method: module + "-" + method,
                        args: Array.prototype.slice.call(arguments, 0)
                    };

                pending[id] = function (receiveData) {
                    // last argument is always callback in async call
                    var callback = sendData.args.length > 0 ? sendData.args[sendData.args.length - 1] : null;
                    if (callback) {
                        callback.apply(api[module], receiveData.args);
                    }
                };

                socket.send(JSON.stringify(sendData));
            };
        }

        socket = new io.Socket(host, {port: port});
        socket.connect();

        socket.on('connect', function () {
            if (typeof ready === "function") {
                // create module maps (dynamisize later)
                api = {
                    fs: {
                        readFile: pass("fs", "readFile"),
                        writeFile: pass("fs", "writeFile"),
                        stat: pass("fs", "stat")
                    }
                };
                self.fs = api.fs; // hackish
                ready(api);
            }
        });

        socket.on('message', function (message) {
            var data = JSON.parse(message);
            if (pending[data.id]) {
                pending[data.id].call(self, data);
                delete pending[data.id];
            }
        }); 
    } 
};
