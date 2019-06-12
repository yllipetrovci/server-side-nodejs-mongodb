const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const { dateToString } = require('../../helpers/date');

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event._id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)
    }
};

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } })
        events => {
            return events.map(event => {
                return transformEvent(event);
            })
        }
        return events;
    } catch (err) { throw err; }
}

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformEvent(event);
    } catch (err) {
        throw err;
    }
}

const user = async userId => {
    try {
        const user = await User.findById(userId)
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    } catch (err) { throw err }
}

module.exports =
    {
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
        users: async () => {
            try {
                const users = await User.find()
                return users.map(user => {
                    return { ...user._doc }
                })

            } catch (err) {
                throw err;
            }
        },
        bookings: async (args) => {
            try {
                const bookings = await Booking.find();
                return bookings.map(booking => {
                    return {
                        ...booking._doc,
                        _id: booking.id,
                        user: user.bind(this, booking._doc.user),
                        event: singleEvent.bind(this, booking._doc.event),
                        createdAt: dateToString(booking._doc.createdAt),
                        updatedAt: dateToString(booking._doc.updatedAt),
                    }
                })
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
        createUser: async (args) => {
            try {
                const userResult = await User.findOne({ email: args.userInput.email })
                //if a user exists with a same email address than throw an error
                if (userResult) throw new Error("User exists already.");

                //first argument its password, second argument its salting round
                const hashedPassword = await bcrypt.hash(args.userInput.password, 12)

                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                })

                const result = await user.save();
                return { ...result._doc, _id: result.id };

            } catch (err) {
                throw err;
            }
        },
        bookEvent: async (args) => {
            try {
                const fetchedEvent = await Event.findOne({ _id: args.eventId });
                const booking = new Bookig({
                    user: '',
                    event: fetchedEvent
                })
                const result = await booking.save();
                return {
                    ...result._doc,
                    _id: result.id,
                    createdAt: dateToString(booking._doc.createdAt),
                    updatedAt: dateToString(booking._doc.updatedAt),
                }

            } catch (err) {
                throw err;
            }
        },
        cancelBooking: async (args) => {
            try {
                const booking = await Booking.findById(args.bookingId).populate('event');
                const event = transformEvent(booking.event);
                await Booking.deleteOne({ _id: args._doc.bookingId });
                return event;

            } catch (err) {
                throw err;
            }
        }
    }