var s, bus, server,
    io = require('./../packages/Socket.IO-node');

module.exports = require('nodeunit').testCase({

    setUp: function (done) {
        s = require('sinon').sandbox.create();
        bus = require('./../lib/gaseous/observable').Observable();
        server = require('./../lib/gaseous/server');
        s.stub(require('sys'), "puts");
        done();
    },

    tearDown: function (done) {
        s.verifyAndRestore();
        bus = null;
        server = null;
        done();
    },

    "server listenes for socket-send": function (test) {
        var spy = s.spy(bus, "on");
        server.watch(bus);
        test.ok(spy.calledOnce);
        test.ok(spy.calledWith("gaseous-socket-send"));
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

        server.bind("some/dir").listen(8888);

        bus.emit("gaseous-socket-send", [data]);

        setTimeout(function () {
            test.ok(client.send.calledOnce, "expected socket.send to be called once");
            test.ok(client.send.calledWithExactly(JSON.stringify(data)), "expected socket.send to be called once");
            test.done();
        }, 1);
    },

    "bind creates server": function (test) {
        server.watch(bus);
        s.mock(require('http'))
            .expects("createServer")
            .once()
            .returns(42);
        test.equal(server.bind("some/dir"), 42, "server was not created");
        test.done();
    },

    "bind creates server with wrapped listen method": function (test) {
        server.watch(bus);
        var listen = function () {};

        s.mock(require('http'))
            .expects("createServer")
            .once()
            .returns({
                listen: listen
            });

        server.bind("some/dir");

        test.notStrictEqual(server.listen, listen, "expected a wrapped method"); 
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

        server.bind("some/dir").listen(8888);
        test.done();
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
                on: function (type, callback) {
                    callback({
                        on: function (type, callback) {
                            if (type === "message") {
                                callback(data);
                            }
                        }
                    });
                }
            });

        server.bind("some/dir").listen(8888);
        test.done();
    },

    "responds to client message": function (test) {
        server.watch(bus);
        var data = {
                id: "ID",
                method: "fs-readFile",
                args: ["some_file", "utf-8"]
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
                        }
                    });
                }
            });

        s.mock(bus)
            .expects("emit")
            .once()
            .withExactArgs("gaseous-fs-readFile", ["ID", "some_file", "utf-8"]);

        server.bind("some/dir").listen(8888);

        test.done();
    }

});
