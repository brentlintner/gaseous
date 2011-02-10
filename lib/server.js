var bus, _client,
    http = require('http'),
    sys = require('sys'),
    io = require('./../packages/Socket.IO-node'),

self = module.exports = {
    watch: function (observable) {
        bus = observable;
        // modules in ./map will trigger this
        bus.on("gaseous-socket-send", function (packet) {
            _client.send(JSON.stringify(packet));
        });
    },
    bind: function (directory) {
        var server = http.createServer(function (req, res) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end("\\m/");
            }),
            listen = server.listen;

        server.listen = function (port) {
            port = port || 8888;
            sys.puts("created server at 127.0.0.1:" + port + "\n in " + directory);

            listen.call(server, port);

            socket = io.listen(server);
            socket.on('connection', function (client) {
                _client = client;

                var modules = require('./map').modules,
                    moduleList = Object.keys(modules).reduce(function (obj, module) {
                        obj[module] = Object.keys(modules[module]).reduce(function (moduleObject, method) {
                            moduleObject[method] = "[Function]";
                            return moduleObject;
                        }, {});
                        return obj;
                    }, {});

                client.send(JSON.stringify({modules: moduleList}));

                client.on('message', function (message) {
                    var data = JSON.parse(message),
                        args = data.args;
                    args.unshift(data.id);
                    bus.emit("gaseous-" + data.method, args);
                });
            });
        };

        return server;
    }
};
