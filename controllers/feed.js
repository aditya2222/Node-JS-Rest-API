const { validationResult } = require('express-validator/check')

const Post = require('../models/post')

exports.getPosts = (req, res, next) => {

    res.status(200).json({
        posts: [{
            _id: '1',
            title: 'First Post',
            context: 'This is the first post',
            imageUrl: 'images/duck.jpg',
            creator: {
                name: 'Admin'
            },
            createdAt: new Date().toISOString()
        }]
    })
};


exports.postPost = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed')
        error.statusCode = 422
        throw error
    }
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        creator: 'Author',
        imageUrl: 'demo'
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


