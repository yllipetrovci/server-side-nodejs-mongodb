const bcrypt = require('bcryptjs');
const User = require('../../models/user');

module.exports = {
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
    login: async ({ email, password }) => {
        const user = User.findOne({ email: email });
        if(!user){
            throw new Error("User does not exist!");
        }
        const isEqual = await bcrypt.compare(password, user.password);
        
        if(!isEqual){
            throw new Error('Password is incorrect');
        }
    }

}