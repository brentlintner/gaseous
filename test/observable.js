var observable, s,
    catches = require('catchjs').catches;

module.exports = require('nodeunit').testCase({

    setUp: function (done) {
        s = require('sinon').sandbox.create();
        observable = require('./../lib/gaseous/observable').Observable();
        done();
    },

    tearDown: function (done) {
        s.verifyAndRestore();
        observable = undefined;
        done();
    },

    "on method should register and emit properly": function (test) {
        observable.on("TestTriggerObservable", s.mock().once());
        observable.emit("TestTriggerObservable");

        setTimeout(function () {
            test.done();
        }, 2);
    },

    "emit passes args to subscriber": function (test) {
        var args = ["test", "sweet"];

        observable.on("TestTriggerObservable", function (arg0, arg1) {
            test.strictEqual(args[0], arg0);
            test.strictEqual(args[1], arg1);
            test.done();
        });

        observable.emit("TestTriggerObservable", args);
    },

    "on dies if event is falsy" : function (test) {
        test.ok(catches(function () {
            observable.on(false, function () {});
        }));
        test.done();
    },

    "can clear events": function (test) {
        observable.on("need", s.mock().never());
        observable.on("better", s.mock().never());
        observable.clear();
        observable.emit("need", [], true);
        observable.emit("better", [], true);
        test.done();
    },

    "can clear event type": function (test) {
        observable.on("imagination", s.mock().once());
        observable.on("your_face", s.mock().never());
        observable.clear("your_face");
        observable.emit("imagination", [], true);
        observable.emit("your_face", [], true);
        test.done();
    },

    "once only gets triggered once": function (test) {
        observable.once("sometest", s.mock().once());
        observable.emit("sometest", [], true);
        observable.emit("sometest", [], true);
        test.done();
    }

});
