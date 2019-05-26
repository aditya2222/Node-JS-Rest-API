const User = require('../models/User');
const bcrypt = require('bcryptjs')

module.exports = {
    createUser: async function (args, req) {
        const existinguser = await User.findOne({ email: args.userInput.email })
        if (existinguser) {
            const error = new Error('User exists already')
            throw error
        }
        const hashedPw = await bcrypt.hash(args.userInput.password, 12)
        const user = new User({
            email: args.userInput.email,
            name: args.userInput.name,
            password: args.userInput.password
        })
        const createdUser = await user.save()
        return { ...createdUser._doc, _id: createdUser._id.toString() }
    }
}