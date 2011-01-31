// assure there is no duplicate uuid generation (however improbable)
function uuid(obj) {
    var id = Math.uuid(undefined, 16);
    return !obj[id] ? id : uuid(obj);
}

var socket, api,
    pending = {},

self = module.exports = {
    fs: undefined,
    listen: function (host, port, ready) {
        host = host || '127.0.0.1';
        port = port || 8888;

        function pass(method) {
            return function () {
                var id = uuid(pending),
                    sendData = {
                        id: id,
                        method: method,
                        args: Array.prototype.slice.call(arguments, 0)
                    };

                pending[id] = function (receiveData) {
                    // TODO: agnostisize (only for readFile who can have callback arg at 1/2 index)
                    var callback = sendData.args.length > 2 ?
                                    sendData.args[2] : sendData.args[1];
                    if (typeof callback === "function") {
                        callback.apply(api.fs, receiveData.args);
                    }
                };

                socket.send(JSON.stringify(sendData));
            };
        }

        socket = new io.Socket(host, {port: port});

        socket.connect();
        console.log("gaseous :: listening on " + host + ":" + port);

        socket.on('connect', function () {
            console.log("gaseous :: connected");
            if (typeof ready === "function") {
                // create module maps (dynamisize later)
                api = {
                    fs: {
                        readFile: pass("readFile")
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
