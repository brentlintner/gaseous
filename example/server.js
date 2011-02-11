var gaseous = require('./../lib'),
    modules = {
        epic: {
            test: function (cb1, cb2) {
                setTimeout(cb1, 1000);
                setTimeout(cb2, 4000);
            }
        },
        fs: require('fs')
    };

gaseous.map(modules).listen();
