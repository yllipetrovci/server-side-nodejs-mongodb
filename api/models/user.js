const mongoose = reuqire('mongoose');

const Schema = mongoose.Schema;

const userSchema = new  Schema({
    email: {
        type:String,
        reuqire: true
    },
    password: {
        type:String,
        reuqire: true
    },
    createdEvents: [
        {
            type: Schema.Types.ObjectId
        }
    ]
});

module.exports = mongoose.model('User', userSchema);