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
        var
        count = 0,
        id = uuid(pending),
        sendArgs = Array.prototype.slice.call(arguments),
        sendData = {
            id: id,
            method: module + "-" + method,
            args: sendArgs.map(function (arg) { 
                if (typeof arg === "function") {
                    count++;
                    arg = "<Function>";
                }
                return arg;
            })
        };

        pending[id] = function (receiveData) {
            var index = receiveData.callback;

            if (sendArgs.length > 0 && typeof sendArgs[index] === "function") {
                count--;
                if (count <= 0) delete pending[id];
                sendArgs[index].apply(api[module], receiveData.args);
            }
        };

        socket.send(JSON.stringify(sendData));
    };
}

self = module.exports = {
    fs: null,
    listen: function (host, port, ready) {
        host = host || '127.0.0.1';
        port = port || 8888;

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
            }
        }); 
    } 
};
