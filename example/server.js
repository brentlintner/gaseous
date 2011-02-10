var gaseous = require('./../lib');

gaseous.map.bind({
    epic: {
        test: function (cb1, cb2) {
            setTimeout(cb1, 1000);
            setTimeout(cb2, 4000);
        }
    },
    fs: require('fs')
});

gaseous.server.bind(process.cwd()).listen();
