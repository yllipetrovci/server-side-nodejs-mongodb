const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } })
        events => {
            return events.map(event => {
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    _id: event._id,
                    creator: user.bind(this, event.creator)
                }
            })
        }
        return events;
    } catch (err) { throw err; }
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
                const events = await Event.find()
                // .populate('creator') populate is replaced by method user
                return events.map(event => {
                    return {
                        ...event._doc,
                        date: new Date(event._doc.date).toISOString(),
                        creator: user.bind(this, event._doc.creator)
                    };
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
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
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
                createdEvent = {
                    ...result._doc,
                    // creator: user.bind(this, result._doc.creator)
                };
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
                    _id: result.id
                }
                
            } catch (err) {
                throw err;
            }
        }
    }