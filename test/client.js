var s, socket,
    client = require('./../lib/client');

require('./../packages/Math.uuid.js');

module.exports = require('nodeunit').testCase({

    setUp: function (done) {
        s = require('sinon').sandbox.create();
        // just return a mock object if not mocked itself
        global.io = {Socket: function () {
            return socket;
        }};
        done();
    },

    tearDown: function (done) {
        s.restore();
        io = null;
        done();
    },

    "connect creates client and calls ready": function (test) {
        s.mock(io)
            .expects("Socket")
            .once()
            .withExactArgs('127.0.0.1', {port: 8888})
            .returns(socket = {
                connect: s.spy(),
                send: s.mock(),
                on: s.spy()
            });

        // would in reality be async
        client.connect(s.mock().once());

        test.ok(socket.connect.calledOnce, "expected socket.connect to be called once");
        test.ok(socket.on.calledOnce, "expected socket.on to be called once");
        test.ok(socket.on.calledWith('message'), "expected socket.on to be called with message event");
        test.done();
    },

    // TODO: find way to sync this up with other tests (fs in this case)
    "client exposes modules": function (test) {
        s.stub(io, "Socket")
            .returns(socket = {
                connect: s.spy(),
                send: s.spy(),
                on: s.spy(function (type, callback) {
                    if (type === "message") {
                        callback(JSON.stringify({modules: {fs: {readFile: "[Function]"}}}));
                    }
                })
            });

        client.connect(function (lib) {
            test.equal(typeof lib.fs, "object", "fs is not an object");
            test.equal(typeof lib.fs.readFile, "function", "fs.readFile is not a function");
            test.done();
        });
    }

    // TODO: need to decouple message parsing to make this testable (now)
//    "client sends method when receieved": function (test) {
//        var receiveMessage,
//            receiveData = {
//                id: "ID",
//                callback: 2,
//                args: [null, "some file data"]
//            },
//            sendData = {
//                id: "ID",
//                method: "fs-readFile",
//                args: ["some_file", "utf-8", "[Function]"]
//            };
//
//        s.mock(Math)
//            .expects("uuid")
//            .once()
//            .returns("ID");
//
//        s.mock(io)
//            .expects("Socket")
//            .once()
//            .withExactArgs('127.0.0.1', {port: 8888})
//            .returns(socket = {
//                connect: s.spy(),
//                send: s.spy(),
//                on: function (type, callback) {
//                    if (type === "message") {
//                        receiveMessage = callback;
//                    } else {
//                        callback();
//                    }
//                }
//            });
//
//        client.connect(function (lib) {
//            lib.fs.readFile("some_file", "utf-8", function (err, data) {
//                test.strictEqual(data, receiveData.args[1], "unexpected message data");
//                test.done();
//            });
//        });
//
//        test.ok(socket.send.calledOnce, "execpted send to be called once");
//        test.ok(socket.send.calledWithExactly(JSON.stringify(sendData)), "execpted send to be called with stringified packet");
//
//        receiveMessage(JSON.stringify(receiveData));
//    }

});
