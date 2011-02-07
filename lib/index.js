var self = module.exports = {
    server: require('./server'),
    map: require('./map'),
    bus: require('./observable').Observable()
};

self.map.watch(self.bus);
self.server.watch(self.bus);
