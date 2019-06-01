const User = require('../models/User');
const bcrypt = require('bcryptjs')
const validator = require('validator');
const jwt = require('jsonwebtoken')
const Post = require('../models/post')

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
			password: hashedPw 
		});
		const createdUser = await user.save()
		return {...createdUser._doc, _id: createdUser._id.toString()}
	},

	login: async function (args, req) {
		const user = await User.findOne({email: args.email});
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

	},

	createPost: async function(args, req) {
		if(!req.isAuth)	{	
			const error = new Error('Not Authenticated')
			error.code = 401
			throw error
		}
		const errors = []
		if(validator.isEmpty(args.postInput.title) || !validator.isLength(args.postInput.title, {min:5})){	
			errors.push({message: "Title is invalid."})	
		}

		if(validator.isEmpty(args.postInput.content) || !validator.isLength(args.postInput.content, {min:5})){	
			errors.push({message: "Content is invalid."})
		}

		if(errors.length>0){
		
			const error = new Error('Invalid Input.')
			error.data = errors
			error.code = 422
			throw error
		}

		const user = await User.findById(req.userId)
		if(!user){
		
			const error = new Error('Invalid User')
			error.code = 401
			throw error
		}

		const post = new Post({	
			title: args.postInput.title,
			content: args.postInput.content,
			imageUrl: args.postInput.imageUrl,
			creator: user
		})
		const createdPost = await post.save()
		user.posts.push(createdPost)
		return {...createdPost._doc, _id: createdPost._id.toString(), createdAt: createdPost.createdAt.toISOString(), updatedAt: createdPost.updatedAt.toISOString()}

	
	}  
};
