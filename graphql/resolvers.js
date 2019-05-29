const User = require('../models/User');
const bcrypt = require('bcryptjs')
const validator = require('validator');
const jwt = require('jsonwebtoken')

module.exports = {
    createUser: async function (args, req) {
        const errors = []
        if (!validator.isEmail(args.userInput.email)) {
            errors.push({message: 'Email is Invalid.'})
        }
        if (validator.isEmpty(args.userInput.password) || !validator.isLength(args.userInput.password, {min: 5})) {

            errors.push({message: ' Password too short'})
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input')
            error.data = errors
            error.code = 422
            throw error
        }
        const existinguser = await User.findOne({email: args.userInput.email})
        if (existinguser) {
            const error = new Error('User exists already')
            throw error
        }
        const hashedPw = await bcrypt.hash(args.userInput.password, 12)
        const user = new User({
            email: args.userInput.email,
            name: args.userInput.name,
            password: args.userInput.password
        });
        const createdUser = await user.save()
        return {...createdUser._doc, _id: createdUser._id.toString()}
    },

    login: async function (args, req) {
        const user = await User.findOne({email: email});
        if (!user) {
            const error = new Error('User Not Found');
            error.code = 401;
            throw error
        }
        const isEqual = await bcrypt.compare(args.password, user.password)

        if (!isEqual) {
            const error = new Error('Password is incorrect');
            error.code = 401;
            throw error
        }

        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email,
        }, 'somesupersecret', {expiresIn: '1h'})

        return {token: token, userId: user._id.toString()}

    }
};