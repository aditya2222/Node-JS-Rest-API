const { validationResult } = require('express-validator/check')

const Post = require('../models/post')

exports.getPosts = (req, res, next) => {
    Post.find()
        .then((posts) => {
            res.status(200).json({
                posts: posts
            })
        })
        .catch((error) => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })

};


exports.postPost = (req, res, next) => {
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
    const post = new Post({
        title: title,
        content: content,
        creator: 'Author',
        imageUrl: imageUrl
    })
    post.save()
        .then((response) => {
            console.log(response)
            res.status(201).json({
                message: 'Post Created successfully',
                post: response
            })
        })
        .catch((error) => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })

};


exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('Could not find the post')
                error.statusCode = 404;
                throw error
            }
            res.status(200).json({
                message: 'Post fetched',
                post: post
            })
        })
        .catch((error) => {
            if (!error.statusCode) {
                error.statusCode = 500
            }
            next(error)
        })
}