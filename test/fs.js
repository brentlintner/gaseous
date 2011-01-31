var s, observable,
    fs = require('fs'),
    gfs = require('./../lib/gaseous/fs');

module.exports = require('nodeunit').testCase({

    setUp: function (done) {
        s = require('sinon').sandbox.create();
        observable = require('./../lib/gaseous/observable').Observable();
        done();
    },

    tearDown: function (done) {
        s.verifyAndRestore();
        observable = null;
        done();
    },

    "responds to readFile": function (test) {
        var file = "some_file",
            encoding = "utf-8",
            callback = null,
            id = "1";

        s.mock(fs)
            .expects("readFile")
            .once()
            .withArgs(file, encoding);

        gfs.watch(observable);
        observable.emit("gaseous-fs-readFile", [file, encoding, callback, id]);
        setTimeout(test.done, 1);
    },

    "responds to writeFile": function (test) {
        var file = "some_file",
            data = "why so serious",
            callback = null,
            encoding = "utf-8",
            id = "1";

        s.mock(fs)
            .expects("writeFile")
            .once()
            .withArgs(file, data, encoding);

        gfs.watch(observable);
        observable.emit("gaseous-fs-writeFile", [file, data, encoding, callback, id]);
        setTimeout(test.done, 1);
    },

    "readFile emits data on success": function (test) {
        var fs_readFile = fs.readFile,
            file = "some_file",
            encoding = "utf-8",
            sendData = {
                id: "ID",
                args: [null, "file data"]
            };

        fs.readFile = function (filename, encoding, callback) {
            callback(null, sendData.args[1]);
        };

        // end point where client takes over (see client tests)
        observable.on("gaseous-socket-send",
            s.mock().once().withExactArgs(sendData));

        gfs.watch(observable);

        observable.emit("gaseous-fs-readFile", [file, encoding, null, sendData.id], true);

        setTimeout(function () {
            fs.readFile = fs_readFile;
            test.done();
        }, 1);
    },

    "writeFile emits data on success": function (test) {
        var fs_writeFile = fs.writeFile,
            file = "some_file",
            encoding = "utf-8",
            data = "asdf",
            sendData = {
                id: "ID",
                args: []
            };

        fs.writeFile = function (filename, data, encoding, callback) {
            callback();
        };

        // end point where client takes over (see client tests)
        observable.on("gaseous-socket-send",
            s.mock().once().withExactArgs(sendData));

        gfs.watch(observable);

        observable.emit("gaseous-fs-writeFile", [file, data, encoding, null, sendData.id], true);

        setTimeout(function () {
            fs.writeFile = fs_writeFile;
            test.done();
        }, 1);
    }

});
