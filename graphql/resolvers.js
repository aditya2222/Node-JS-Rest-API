const User = require('../models/User');
const bcrypt = require('bcryptjs')
const validator = require('validator');
const jwt = require('jsonwebtoken')
const Post = require('../models/post')
const { clearImage } = require('../util/file')


module.exports = {
	createUser: async function (args, req) {
		const errors = []
		if (!validator.isEmail(args.userInput.email)) {
			errors.push({ message: 'Email is Invalid.' })
		}
		if (validator.isEmpty(args.userInput.password) || !validator.isLength(args.userInput.password, { min: 5 })) {

			errors.push({ message: ' Password too short' })
		}
		if (errors.length > 0) {
			const error = new Error('Invalid input')
			error.data = errors
			error.code = 422
			throw error
		}
		const existinguser = await User.findOne({ email: args.userInput.email })
		if (existinguser) {
			const error = new Error('User exists already')
			throw error
		}
		const hashedPw = await bcrypt.hash(args.userInput.password, 12);
		const user = new User({
			email: args.userInput.email,
			name: args.userInput.name,
			password: hashedPw
		});
		const createdUser = await user.save()
		return { ...createdUser._doc, _id: createdUser._id.toString() }
	},

	login: async function (args, req) {
		const user = await User.findOne({ email: args.email });
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
		}, 'somesupersecret', { expiresIn: '1h' })

		return { token: token, userId: user._id.toString() }

	},

	createPost: async function (args, req) {
		if (!req.isAuth) {
			const error = new Error('Not Authenticated')
			error.code = 401
			throw error
		}
		const errors = []
		if (validator.isEmpty(args.postInput.title) || !validator.isLength(args.postInput.title, { min: 5 })) {
			errors.push({ message: "Title is invalid." })
		}

		if (validator.isEmpty(args.postInput.content) || !validator.isLength(args.postInput.content, { min: 5 })) {
			errors.push({ message: "Content is invalid." })
		}

		if (errors.length > 0) {

			const error = new Error('Invalid Input.')
			error.data = errors
			error.code = 422
			throw error
		}

		const user = await User.findById(req.userId)
		if (!user) {

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
		await user.save()
		return { ...createdPost._doc, _id: createdPost._id.toString(), createdAt: createdPost.createdAt.toISOString(), updatedAt: createdPost.updatedAt.toISOString() }


	},

	getposts: async function (args, req) {
		if (!req.isAuth) {
			const error = new Error("User not authenticated!")
			error.code = 401
			throw error
		}
		if (!args.page) {
			args.page = 1;
		}
		const perPage = 2
		const totalPosts = await Post.find().countDocuments()
		const posts = await Post.find().sort({ createdAt: -1 }).populate('creator').skip((2 * args.page) - 2).limit(perPage)
		return {
			posts: posts.map(el => {

				return { ...el._doc, _id: el._id.toString(), updatedAt: el.updatedAt.toISOString(), createdAt: el.createdAt.toISOString() }
			}), totalPosts: totalPosts
		}

	},

	post: async function (args, req) {

		if (!req.isAuth) {

			const error = new Error('Not authenticated')
			error.code = 401
			throw error
		}

		const post = await Post.findById(args.id).populate('creator')
		if (!post) {

			const error = new Error('No post found')
			error.code = 404
			throw error
		}

		return { ...post._doc, _id: post._id.toString(), createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() }

	},

	updatePost: async function (args, req) {
		if (!req.isAuth) {
			const error = new Error('Not Authenticaed')
			error.code = 401
			throw error
		}

		const post = await Post.findById(args.id).populate('creator')


		if (!post) {
			const error = new Error('No Post Found')
			error.code = 404
			throw error
		}

		if (post.creator._id.toString() !== req.userId.toString()) {

			const error = new Error('Not Authorized')
			error.code = 403
			throw error

		}



		const errors = []
		if (validator.isEmpty(args.postInput.title) || !validator.isLength(args.postInput.title, { min: 5 })) {
			errors.push({ message: "Title is invalid." })
		}

		if (validator.isEmpty(args.postInput.content) || !validator.isLength(args.postInput.content, { min: 5 })) {
			errors.push({ message: "Content is invalid." })
		}

		if (errors.length > 0) {

			const error = new Error('Invalid Input.')
			error.data = errors
			error.code = 422
			throw error
		}

		post.title = args.postInput.title
		post.content = args.postInput.content

		if (args.postInput.imageUrl !== 'undefined') {

			post.imageUrl = args.postInput.imageUrl
		}

		const updatedPost = await post.save()

		return { ...updatedPost._doc, _id: updatedPost._id.toString(), createdAt: updatedPost.createdAt.toISOString(), updatedAt: updatedPost.updatedAt.toISOString() }


	},
	deletePost: async function (args, req) {
		if (!req.isAuth) {
			const error = new Error('Not Authenticated')
			error.code = 401
			throw error
		}

		const post = await Post.findById(args.id)

		if (!post) {
			const error = new Error('No Post Found')
			error.code = 404
			throw error
		}

		if (post.creator.toString() !== req.userId) {
			const error = new Error('Not Auhorized')
			error.code = 403
			throw error
		}

		clearImage(post.imageUrl)

		await Post.findByIdAndRemove(args.id)
		const user = await User.findById(req.userId)
		user.posts.pull(args.id)
		await user.save()
		return true
	},

	user: async function(args, req){


		if (!req.isAuth) {
			const error = new Error('Not Authenticated')
			error.code = 401
			throw error
		}

		const user = await User.findById(req.userId)

		if(!user){
		
			const error = new Error('No user Found')
			error.code = 404
			throw error
		}

		return {...user._doc, _id: user._id.toString()}
	
	},
	
	updateStatus: async function(args, req){

		if(!req.isAuth){
		
			const error = new Error('Not Authenitcated')
			error.code = 401
			throw error
		}

		const user = await User.findById(req.userId)
		if(!user){

			const error = new Error('Not user found')
			error.code = 404
			throw error	
		
		}

		user.status = args.status
		await user.save()
		return{...user._doc, _id:user._id.toString() }

		
	}
};
