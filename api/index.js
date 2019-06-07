const mongoose = require('mongoose');
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const cors = require('cors');
const route = require('./routes/userRoute');

const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const PORT = 3000;

// connect to Mongo daemon
// mongoose.connect(
//     'mongodb://localhost:27017/admin',
//     { useNewUrlParser: true }
//   )
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));


app.use(cors());

app.use(bodyparser.json());

app.use('/graphql',
    graphqlHttp({
        schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
        rootValue: {
            events: () => {
                return ['Event1', 'Event2', 'Event3']
            },
            createEvent: (args) => {
                const eventName = args.name;
                return eventName;
            }
        },
        graphiql: true
    })
);

app.use('/api', route);

app.get('/', function (req, res) {
    res.send('Hello world');
});

app.listen(PORT, () => {
    console.log('Server has been started at PORT ' + PORT);
})