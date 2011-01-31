module.exports.Observable = function () {
    var _listeners = {},
        _this;

    function _on(event, listener, scope, oneTime) {
        if (!event) {
            throw "event must be truthy";
        }
        _listeners[event] = _listeners[event] || [];
        _listeners[event].push([listener, scope, oneTime]);
    }

    return (_this = {
        on: function (event, listener, scope) {
            _on(event, listener, scope, false);
        },

        once: function (event, listener, scope) {
            _on(event, listener, scope, true);
        },

        emit: function (event, args, sync) {
            args = args || [];
            sync = sync || false;

            if (!_listeners || !_listeners[event]) {
                return;
            }

            _listeners[event].forEach(function (listener, index, array) {
                function emit() {
                    try {
                        listener[0].apply(listener[1], args);
                        if (listener[2] === true) {
                            _listeners[event].splice(index, 1);
                        }
                    } catch (e) {
                        console.log(e.type || e.name);
                        console.log(e.message);
                        console.log(e.stack);
                    }
                }

                if (sync) {
                    emit();
                } else {
                    setTimeout(emit, 1);
                }
            });
        },

        clear: function (event) {
            if (event) {
                delete _listeners[event];
            } else {
                _listeners = {};
            }
        }
    });
};
