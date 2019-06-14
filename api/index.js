const mongoose = require('mongoose');
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const cors = require('cors');
// const route = require('./routes/userRoute');
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const graphqlHttp = require('express-graphql');
const isAuth = require('./middleware/is-auth');
const PORT = 3000;

app.use(cors());

app.use(isAuth);

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
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
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

