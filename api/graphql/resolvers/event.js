const Event = require('../../models/event');
const { transformEvent } = require('./merge');

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
    createEvent: async (args, req) => {
        if(!req.isAuth){
            throw new Error('Unauthenticated!');
        }
        try {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, // + converts to float 
                creator: req.userId,
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