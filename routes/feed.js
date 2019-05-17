const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const isAuth = require('../middleware/is-auth')
const feed = require('../controllers/feed');

router.get('/posts', isAuth, feed.getPosts);

router.post('/createPost', isAuth, [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 })
], feed.postPost);


router.get('/post/:postId', isAuth, feed.getPost);


router.put('/post/:postId',isAuth, [
    body('title')
        .trim()
        .isLength({ min: 5 }),
    body('content')
        .trim()
        .isLength({ min: 5 })
], feed.updatePost);

router.delete('/post/:postId', isAuth, feed.deletePost)

module.exports = router
