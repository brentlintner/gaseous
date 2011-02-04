var s, observable,
    fs = require('fs'),
    gfs = require('./../lib/gaseous/fs');

// tests that an fs event calls it's respective fs method
function _fsRespondsTo(method, fsArgs, eventArgs, test) {
    s.mock(fs)
        .expects(method)
        .once()
        .withArgs.apply(s, fsArgs);

    gfs.watch(observable);
    observable.emit("gaseous-fs-" + method, eventArgs);
    setTimeout(test.done, 1);
}

// tests that a fs method emits socket-send properly after being called
function _emitsDataOnCall(method, sendData, eventArgs, mockMethod, test) {
    var fs_method = fs.stat;

    // manually mock to return immediate callback call
    fs[method] = mockMethod;

    // end point where client takes over (see client tests)
    observable.on("gaseous-socket-send",
        s.mock().once().withExactArgs(sendData));

    gfs.watch(observable);
    observable.emit("gaseous-fs-" + method, eventArgs, true);

    setTimeout(function () {
        fs[method] = fs_method;
        test.done();
    }, 1);
}

module.exports = require('nodeunit').testCase({

    // null is used as a placeholder for a callback function (for form)
    // since any callbacks get stripped out in the client

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

    "readFile": function (test) {
        var sendData = {
                id: "ID",
                args: [null, "file data"]
            },
            args = ["some_file", "utf-8", null, sendData.id];

        _emitsDataOnCall("readFile", sendData, args, function (filename, encoding, callback) {
            callback.apply(callback, sendData.args);
        }, test);
    },

    "writeFile": function (test) {
        var sendData = {
                id: "ID",
                args: []
            },
            args = ["some_file", "file_data", "utf-8", null, sendData.id];

        _emitsDataOnCall("writeFile", sendData, args, function (filename, data, encoding, callback) {
            callback.apply(callback, sendData.args);
        }, test);
    },

    "stat": function (test) {
        var sendData = {
                id: "ID",
                args: [null, {}]
            },
            args = ["some_path", null, sendData.id];

        _emitsDataOnCall("stat", sendData, args, function (path, callback) {
            callback.apply(callback, sendData.args);
        }, test);
    }

});
