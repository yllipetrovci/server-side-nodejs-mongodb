const mongoose = require('mongoose');
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const cors = require('cors');
// const route = require('./routes/userRoute');
const bcrypt = require('bcryptjs');

const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const PORT = 3000;

const Event = require('./models/event');
const User = require('./models/user');

const events = eventIds => {
    return Event.find({ _id: { $in: eventIds } })
        .then(events => {
            return events.map(event => {
                return {
                    ...event._doc,
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

app.use(cors());

app.use(bodyparser.json());

/* 
###################################################################################################
# A brief Explanation about graphql                                                               #
# 1. Graphql has some kind of queries like                                                        #
#       -Query in RESTful api means a GET request                                                 #
#       -Mutation in RESTful api means on of these request type (POST, PATCH, DELETE, UPDATE)     #                          # 
# 2. Graphql works with types, you can create your own event type as it is e.g under build        # 
# schema line.                                                                                    #
#  the "!"" sign means that the specific filed are required and can not be null                   #
# 3. You can create input instead of writing long queries, you can separate it                    #
#                                                                                                 #
###################################################################################################  
*/

app.use('/graphql',
    graphqlHttp({
        schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float
            date: String! 
            creator: User!
        }

        type User{
            _id: ID!
            email: String!
            password: String!
            createdEvents: [Event!]
        }

        input UserInput{
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
            users: [User!]!
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput) : User
        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
        rootValue: {
            events: () => {
                return Event.find()
                    // .populate('creator') populate is replaced by method user
                    .then(events => {
                        return events.map(event => {
                            return {
                                ...event._doc, creator: user.bind(this, event._doc.creator)
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
                    creator: '5cfea1252de55214a99309ae',
                    date: new Date().toISOString()
                });

                let createdEvent;

                return event.save().then(result => {
                    createdEvent = { ...result._doc };
                    return User.findById('5cfd88224b584123a68e6dca')
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
        },
        graphiql: true
    })
);

// app.use('/api', route);

app.get('/', function (req, res) {
    res.send('Hello world');
});

mongoose.connect(
    `${process.env.API_URL}`,
    { useNewUrlParser: true }
)
    .then(() => {
        console.log('MongoDB Connected: ' + process.env.API_URL)
        app.listen(PORT, () => {
            console.log('Server has been started at PORT ' + PORT);
        })
    })
    .catch(err => console.log(err));

