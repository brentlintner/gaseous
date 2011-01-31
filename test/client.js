var s, socket;

require('./../packages/Math.uuid.js');

module.exports = require('nodeunit').testCase({

    setUp: function (done) {
        s = require('sinon').sandbox.create();
        client = require('./../lib/gaseous/client');
        s.stub(console, "log"); // hide all console logs, beware!
        // just return a mock object if not mocked itself
        global.io = {Socket: function () {
            return socket;
        }};
        done();
    },

    tearDown: function (done) {
        s.restore();
        client = null;
        io = null;
        done();
    },

    "listen creates client and calls ready": function (test) {
        s.mock(io)
            .expects("Socket")
            .once()
            .withExactArgs('127.0.0.1', {port: 8888})
            .returns(socket = {
                connect: s.spy(),
                send: s.mock(),
                on: function (type, callback) {
                    if (type === "connect") callback();
                }
            });

        client.listen(null, null, s.mock().once());

        test.ok(socket.connect.calledOnce, "expected socket.connect to be called once");
        test.done();
    },

    "client calls ready once connected": function (test) {
        s.mock(io)
            .expects("Socket")
            .once()
            .withExactArgs('127.0.0.1', {port: 8888})
            .returns(socket = {
                connect: s.spy(),
                send: s.spy(),
                on: s.spy(function (type, callback) {
                    if (type === "connect") callback();
                })
            });

        client.listen(null, null, function (lib) {
            // just checking one method for now
            test.equal(typeof lib.fs, "object", "fs is not an object");
            test.equal(typeof lib.fs.readFile, "function", "fs.readFile is not a function");
            test.done();
        });

        test.ok(socket.on.calledTwice, "expected socket.on to be called once");
        test.ok(socket.on.calledWith('message'), "expected socket.on to be called with message event");
    },

    "client sends method when receieved": function (test) {
        var receiveMessage,
            receiveData = {
                id: "ID",
                args: [null, "some file data"]
            },
            sendData = {
                id: "ID",
                method: "readFile",
                args: ["some_file", "utf-8", null]
            };

        s.mock(Math)
            .expects("uuid")
            .once()
            .returns("ID");

        s.mock(io)
            .expects("Socket")
            .once()
            .withExactArgs('127.0.0.1', {port: 8888})
            .returns(socket = {
                connect: s.spy(),
                send: s.spy(),
                on: function (type, callback) {
                    if (type === "message") {
                        receiveMessage = callback;
                    } else {
                        callback();
                    }
                }
            });

        client.listen(null, null, function (lib) {
            // just using readFile for now
            lib.fs.readFile("some_file", "utf-8", function (err, data) {
                test.strictEqual(data, receiveData.args[1], "unexpected message data");
                test.done();
            });
        });

        test.ok(socket.send.calledOnce, "execpted send to be called once");
        test.ok(socket.send.calledWithExactly(JSON.stringify(sendData)), "execpted send to be called with stringified packet");

        receiveMessage(JSON.stringify(receiveData));
    }

});
