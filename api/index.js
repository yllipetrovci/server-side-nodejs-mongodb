const mongoose = require('mongoose');
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const cors = require('cors');
const route = require('./routes/userRoute');

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

app.use('/api', route);

app.get('/', function(req,res){
    res.send('Hello world');
});

app.listen(PORT, ()=>{
    console.log('Server has been started at PORT '+PORT );
})