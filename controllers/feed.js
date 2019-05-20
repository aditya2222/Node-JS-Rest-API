const { validationResult } = require('express-validator/check')
const fs = require('fs');
const path = require('path')
const Post = require('../models/post')
const User = require('../models/User')
const io = require('../scoket')

exports.getPosts = async (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 2;
	try {
		const tottalItems = await Post.find().countDocuments()
		const posts = await Post.find()
			.populate('creator')
			.skip((currentPage - 1) * perPage)
			.limit(perPage)

		res.status(200).json({
			posts: posts,
			totalItems: tottalItems
		})
	}
	catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
};


exports.postPost = async (req, res, next) => {

	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed')
			error.statusCode = 422
			throw error
		}
		if (!req.file) {
			const error = new Error('No image Provided')
			error.statusCode = 422
			throw error

		}
		const imageUrl = req.file.path
		const title = req.body.title;
		const content = req.body.content;
		let creator;

		const post = new Post({
			title: title,
			content: content,
			imageUrl: imageUrl,
			creator: req.userId
		})
		const response = await post.save()
		const user = await User.findById(req.userId)
		user.posts.push(post)
		creator = user
		const anotherResponse = await user.save()
		io.getIO().emit('posts', {
			action: 'create',
			post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
		})
		res.status(201).json({
			message: 'Post Created successfully',
			post: post,
			creator: { _id: creator._id, name: creator.name }
		})
	}
	catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}


};


exports.getPost = async (req, res, next) => {
	try {
		const postId = req.params.postId;
		const post = await Post.findById(postId)
		if (!post) {
			const error = new Error('Could not find the post')
			error.statusCode = 404;
			throw error
		}
		res.status(200).json({
			message: 'Post fetched',
			post: post
		})
	}

	catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
};

exports.updatePost = async (req, res, next) => {
	try {

		console.log('endpoint hit');
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed!')
			error.errrors = errors.array()
			error.statusCode = 422
			throw error
		}
		const postId = req.params.postId;
		const title = req.body.title;
		const content = req.body.content;
		let imageUrl = req.body.image;
		console.log(req.body.imageUrl)
		console.log(req.file)

		if (req.file) {
			imageUrl = req.file.path
		}
		console.log('image url is', imageUrl)
		if (!imageUrl) {
			const err = new Error('No file picked')
			err.statusCode = 422;
			throw err
		}

		const post = await Post.findById(postId)

		console.log(post)
		if (!post) {
			const error = new Error('Could not find the post')
			error.statusCode = 404;
			throw error
		}
		if (post.creator.toString() !== req.userId) {
			const error = new Error('Not Authorized!')
			error.statusCode = 403;
			throw error
		}
		if (imageUrl !== post.imageUrl) {
			clearImage(post.imageUrl)
		}

		post.title = title
		post.imageUrl = imageUrl;
		post.content = content;
		const result = await post.save()
		res.status(200).json({ message: 'Post Updated!', post: result })

	}

	catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}

};


exports.deletePost = async (req, res, next) => {
	try {
		const postId = req.params.postId
		const post = await Post.findById(postId)
		if (!post) {
			const error = new Error('Could not find post.')
			error.statusCode = 404
			throw error
		}
		if (post.creator.toString() !== req.userId) {
			const error = new Error('Not Authorized')
			error.statusCode = 403;
			throw error
		}
		// check logged in user
		clearImage(post.imageUrl)
		const result = await Post.findByIdAndRemove(postId)
		const user = await User.findById(req.userId)
		user.posts.pull(postId)
		user.save();
		res.status(200).json({ message: 'Deleted Post' })
	}
	catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}

exports.getStatus = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId)
		if (!user) {
			const error = new Error('User Does not exist')
			throw error
		}
		res.status(200).json({ status: user.status })
	}
	catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		throw error
	}
}

const clearImage = (filePath) => {
	filePath = path.join(__dirname, '..', filePath);
	fs.unlink(filePath, err => {
		console.log(err)
	})

};

