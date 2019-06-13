const authResolver = require('./auth');
const eventsResolver = require('./event');
const bookingResolver = require('./booking');

const rootResolvers = {
    ...authResolver,
    ...eventsResolver,
    ...bookingResolver
};

module.exports = rootResolvers;