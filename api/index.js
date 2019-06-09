const mongoose = require('mongoose');
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const cors = require('cors');
const route = require('./routes/userRoute');

const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const PORT = 3000;

//temporary use 
const Event = require('./models/event');

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
        }

        type User{
            _id: ID!
            email: String!
            password: String!
        }

        input UserInput{
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
        rootValue: {
            events: () => {
                return Event.find().then(events => {
                    return events.map(event => {
                        return { ...event._doc };
                    });
                }).catch((err) => {
                    console.log(err);
                    throw err;
                });

            },
            createEvent: (args) => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price, // + converts to float 
                    date: new Date().toISOString()
                });

                return event.save().then(result => {
                    console.log(result);
                    return { ...result._doc };
                }).catch(err => {
                    console.log(err);
                    throw err;
                });
            }
        },
        graphiql: true
    })
);

app.use('/api', route);

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

