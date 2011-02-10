var self = module.exports = {
    api: null,
    watch: function (bus) {
        var maps = require('fs').readdirSync(__dirname + '/map').map(function (file) {
                return file.replace(/\.js$/, '');
            }),
            api = {};

        maps.forEach(function (map) {
            api[map] = require('./map/' + map)(bus);
        });

        self.api = api;
    }
};
