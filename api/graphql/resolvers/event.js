const Event = require('../../models/event');
const { user } = require('./merge');

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event._id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)
    }
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return transformEvent(event);
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args) => {
        try {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, // + converts to float 
                creator: '5cfec1f3d87c0f2a4215de0e',
                date: new Date().toISOString()
            });

            let createdEvent;
            const result = await event.save()

            // graphql call the functions e.g user and get the result from that function
            createdEvent = transformEvent(result);
            const user = await User.findById(createdEvent.creator)

            if (!user) throw new Error('User not found!');

            user.createdEvents.push(event);
            await user.save();
            return createdEvent;
        } catch (err) {
            throw err;
        }
    },

}