const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');

const events = eventIds => {
    return Event.find({ _id: { $in: eventIds } })
        .then(events => {
            return events.map(event => {
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    _id: event._id,
                    creator: user.bind(this, event.creator)
                }
            })
        }
        ).catch(err => { throw err; })
}

const user = userId => {
    return User.findById(userId).then(user => {
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    }).catch(err => { throw err })
}

module.exports =
    {
        events: () => {
            return Event.find()
                // .populate('creator') populate is replaced by method user
                .then(events => {
                    return events.map(event => {
                        return {
                            ...event._doc,
                            date: new Date(event._doc.date).toISOString(),
                            creator: user.bind(this, event._doc.creator)
                        };
                    });
                }).catch((err) => {
                    console.log(err);
                    throw err;
                });

        },
        users: () => {
            return User.find().then(users => {
                return users.map(user => {
                    return { ...user._doc }
                })
            })
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, // + converts to float 
                creator: '5cfea9e63782651b1ad6b4db',
                date: new Date().toISOString()
            });

            let createdEvent;
            return event.save().then(result => {
                // graphql call the functions e.g user and get the result from that function
                createdEvent = { ...result._doc, creator: user.bind(this, result._doc.creator) };
                return User.findById(createdEvent.creator)
            }).then(user => {
                if (!user) throw new Error('User not found!');

                user.createdEvents.push(event);
                return user.save();
            }).then(result => {
                return createdEvent;
            }).catch(err => {
                console.log(err);
                throw err;
            });
        },
        createUser: (args) => {
            return User.findOne({ email: args.userInput.email }).then(user => {
                //if a user exists with a same email address than throw an error
                if (user) throw new Error("User exists already.");

                return bcrypt.hash(args.userInput.password, 12).then((hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    })

                    return user.save();

                })).then(result => {
                    return { ...result._doc, _id: result.id };
                }

                ).catch(err => {
                    throw err;
                })

            })
            //first argument its password, second argument its salting round

        }
    }