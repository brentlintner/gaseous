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

    "regisers for readFile": function (test) {
        s.mock(observable)
            .expects("on")
            .once()
            .withArgs("gaseous-fs-readFile");

        gfs.watch(observable);
        test.done();
    },

    "responds to readFile": function (test) {
        var file = "some_file",
            encoding = "utf-8";

        s.mock(fs)
            .expects("readFile")
            .once()
            .withArgs(file, encoding);

        gfs.watch(observable);
        observable.emit("gaseous-fs-readFile", [file, encoding]);
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
            callback({}, sendData.args[1]);
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
    }

});
