// returns all mapped modules
module.exports = {
    watch: function (bus) {
        var maps = require('fs').readdirSync(__dirname + '/map').map(function (file) {
                return file.replace(/\.js$/, '');
            }),
            api = {};

        maps.forEach(function (map) {
            api[map] = require('./map/' + map)(bus);
        });
    }
};
