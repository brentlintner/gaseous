var s, observable,
    map = require('./../lib/map'),
    fs = require('fs');

// tests that a fs method emits socket-send properly after being called
function _emitsDataOnCall(method, sendData, eventArgs, mockMethod, test) {
    var fs_method = fs[method];

    // manually mock to return immediate callback call
    fs[method] = mockMethod;

    // end point where client takes over (see client tests)
    observable.on("gaseous-socket-send",
        s.mock().once().withExactArgs(sendData));

    map.watch(observable);
    map.map({fs: fs});

    observable.emit("gaseous-fs-" + method, eventArgs, true);

    setTimeout(function () {
        fs[method] = fs_method;
        test.done();
    }, 1);
}

module.exports = require('nodeunit').testCase({

    // some random tests for map (started with fs)

    setUp: function (done) {
        s = require('sinon').sandbox.create();
        observable = require('./../lib/observable').Observable();
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
                callback: 2,
                args: [null, "file data"]
            },
            args = [sendData.id, "some_file", "utf-8", "[Function]"];

        _emitsDataOnCall("readFile", sendData, args, function (filename, encoding, callback) {
            callback.apply(callback, sendData.args);
        }, test);
    },

    "writeFile": function (test) {
        var sendData = {
                id: "ID",
                callback: 3,
                args: []
            },
            args = [sendData.id, "some_file", "file_data", "utf-8", "[Function]"];

        _emitsDataOnCall("writeFile", sendData, args, function (filename, data, encoding, callback) {
            callback.apply(callback, sendData.args);
        }, test);
    },

    "stat": function (test) {
        var sendData = {
                id: "ID",
                callback: 1,
                args: [null, {}]
            },
            args = [sendData.id, "some_path", "[Function]"];

        _emitsDataOnCall("stat", sendData, args, function (path, callback) {
            callback.apply(callback, sendData.args);
        }, test);
    }

});
