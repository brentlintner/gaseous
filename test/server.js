var s, bus, server,
    io = require('./../packages/Socket.IO-node');

module.exports = require('nodeunit').testCase({

    setUp: function (done) {
        s = require('sinon').sandbox.create();
        bus = require('./../lib/observable').Observable();
        server = require('./../lib/server');
        s.stub(require('sys'), "puts");
        done();
    },

    tearDown: function (done) {
        s.verifyAndRestore();
        bus = null;
        server = null;
        done();
    },

    "server listens for socket-send": function (test) {
        var spy = s.spy(bus, "on");
        server.watch(bus);
        test.ok(spy.calledOnce);
        test.ok(spy.calledWith("gaseous-socket-send"));
        test.done();
    },

    "listen creates server": function (test) {
        server.watch(bus);

        s.mock(require('http'))
            .expects("createServer")
            .once()
            .returns({
                listen: s.mock().once().withExactArgs(8888)
            });

        s.stub(io, "listen")
            .returns({
                on: s.stub()
            });

        server.listen();
        test.done();
    },

    "listen creates custom server": function (test) {
        server.watch(bus);

        var customServer = {
            listen: s.mock().once().withExactArgs(8787)
        };

        s.mock(require('http'))
            .expects("createServer")
            .never();

        s.stub(io, "listen")
            .returns({
                on: s.stub()
            });

        server.listen({
            port: 8787, 
            server: customServer
        });

        test.done();
    },

    "listen uses a socket.io server": function (test) {
        server.watch(bus);
        s.mock(require('http'))
            .expects("createServer")
            .once()
            .returns({
                listen: s.mock().once().withExactArgs(8888)
            });

        s.mock(io)
            .expects("listen")
            .once()
            .returns({
                on: s.mock().once().withArgs("connection")
            });

        server.listen();
        test.done();
    },

    "sends message on socket-send": function (test) {
        server.watch(bus);
        var data = {
                id: "ID",
                method: "readFile",
                args: []
            },
            socket, client;

        s.mock(require('http'))
            .expects("createServer")
            .once()
            .returns({
                listen: s.mock().once().withExactArgs(8888)
            });

        s.mock(io)
            .expects("listen")
            .once()
            .returns(socket = {
                // socket (connection)
                on: function (type, callback) {
                    callback(client = {
                        // client (message, connect etc)
                        on: function (type, callback) {
                            if (type === "message") {
                                // invoke a one time message synchronously
                                callback(JSON.stringify(data));
                            }
                        },
                        send: s.spy()
                    });
                }
            });

        server.listen({port: 8888});

        bus.emit("gaseous-socket-send", [data]);

        setTimeout(function () {
            // initially sends out list of modules available (if any)
            test.ok(client.send.calledTwice, "expected socket.send to be called once");
            test.ok(client.send.getCall(1).calledWithExactly(JSON.stringify(data)), "expected socket.send to be called once");
            test.done();
        }, 1);
    },

    "listens for client message": function (test) {
        server.watch(bus);
        var data = JSON.stringify({
            id: "ID",
            method: "fs-readFile",
            args: []
        });

        s.mock(require('http'))
            .expects("createServer")
            .once()
            .returns({
                listen: s.mock().once().withExactArgs(8888)
            });

        s.mock(io)
            .expects("listen")
            .once()
            .returns({
                // socket
                on: function (type, callback) {
                    // client
                    callback({
                        on: function (type, callback) {
                            if (type === "message") {
                                callback(data);
                            }
                        },
                        send: s.stub()
                    });
                }
            });

        server.listen();
        test.done();
    },

    "responds to client message": function (test) {
        server.watch(bus);
        var data = {
                id: "ID",
                method: "fs-readFile",
                args: ["some_file", "utf-8", "[Function]"]
            },
            socket, client;

        s.stub(require('http'), "createServer")
            .returns({
                listen: s.mock().once().withExactArgs(8888)
            });

        s.mock(io)
            .expects("listen")
            .once()
            .returns(socket = {
                // socket (connection)
                on: function (type, callback) {
                    callback(client = {
                        // client (message, connect etc)
                        on: function (type, callback) {
                            if (type === "message") {
                                // invoke a one time message synchronously
                                callback(JSON.stringify(data));
                            }
                        },
                        send: s.stub()
                    });
                }
            });

        s.mock(bus)
            .expects("emit")
            .once()
            .withExactArgs("gaseous-fs-readFile", ["ID", "some_file", "utf-8", "[Function]"]);

        server.listen();

        test.done();
    }

});
